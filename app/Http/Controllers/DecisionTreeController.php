<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use JsonException;

class DecisionTreeController extends Controller
{
    public function index(): JsonResponse
    {
        $files = File::files(storage_path('app/data'));
        $trees = collect($files)
            ->filter(fn ($file) => $file->getExtension() === 'json')
            ->map(fn ($file) => [
                'name' => $file->getFilenameWithoutExtension(),
                'title' => $file->getFilenameWithoutExtension(),
            ])
            ->values();

        return response()->json(['trees' => $trees]);
    }

    public function show(string $tree): JsonResponse
    {
        abort_unless(preg_match('/\A[a-zA-Z0-9_-]+\z/', $tree) === 1, 404);

        $path = storage_path("app/data/{$tree}.json");
        abort_unless(File::isFile($path), 404);

        $cacheKey = "decision-tree.{$tree}.".File::lastModified($path);
        $data = Cache::remember($cacheKey, now()->addHour(), function () use ($path) {
            try {
                return json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                abort(500, 'Decision tree JSON is invalid.');
            }
        });

        return response()->json($data);
    }
}
