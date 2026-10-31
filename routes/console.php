<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('trees:validate', function () {
    $files = collect(File::files(storage_path('app/data')))
        ->filter(fn ($file) => $file->getExtension() === 'json');
    $hasErrors = false;

    foreach ($files as $file) {
        $errors = [];

        try {
            $data = json_decode(File::get($file->getPathname()), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            $this->error($file->getFilename().': invalid JSON ('.$exception->getMessage().')');
            $hasErrors = true;
            continue;
        }

        if (! is_array($data)) {
            $this->error($file->getFilename().': root JSON value must be an object');
            $hasErrors = true;
            continue;
        }

        $steps = collect($data)->filter(fn ($step, $key) => $key !== 'start' && is_array($step) && isset($step['question']));
        $start = $data['start'] ?? null;

        if (! is_string($start) || ! $steps->has($start)) {
            $errors[] = 'start must reference an existing step';
        }

        foreach ($steps as $stepId => $step) {
            if (! is_string($step['question'] ?? null) || ! is_array($step['options'] ?? null)) {
                $errors[] = "{$stepId}: question and options are required";
                continue;
            }

            foreach ($step['options'] as $index => $option) {
                $target = $option['next_step'] ?? null;
                if (! is_string($option['label'] ?? null) || ! is_string($target) || ! $steps->has($target)) {
                    $errors[] = "{$stepId}.options.{$index}: label or next_step is invalid";
                }
            }
        }

        $state = [];
        $visit = function (string $stepId) use (&$visit, &$state, &$errors, $steps): void {
            if (($state[$stepId] ?? 0) === 1) {
                $errors[] = "cycle detected at {$stepId}";
                return;
            }
            if (($state[$stepId] ?? 0) === 2) return;

            $state[$stepId] = 1;
            foreach ($steps->get($stepId, [])['options'] ?? [] as $option) {
                $target = $option['next_step'] ?? null;
                if (is_string($target) && $steps->has($target)) $visit($target);
            }
            $state[$stepId] = 2;
        };

        foreach ($steps->keys() as $stepId) $visit($stepId);

        if ($errors !== []) {
            $this->error($file->getFilename().': '.implode('; ', array_unique($errors)));
            $hasErrors = true;
        } else {
            $this->info($file->getFilename().': valid ('.$steps->count().' steps)');
        }
    }

    if ($files->isEmpty()) {
        $this->warn('No decision tree JSON files were found.');
    }

    return $hasErrors ? self::FAILURE : self::SUCCESS;
})->purpose('Validate decision tree JSON files and detect broken links or cycles');
