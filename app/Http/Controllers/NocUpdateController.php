<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use RuntimeException;

class NocUpdateController extends Controller
{
    public function index(): JsonResponse
    {
        $updates = $this->readUpdates();
        $active = array_values(array_filter($updates, function (array $update): bool {
            return ($update['status'] ?? '') !== 'resolved'
                && (! isset($update['valid_until']) || strtotime($update['valid_until']) >= now()->timestamp);
        }));

        usort($active, fn (array $a, array $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        return response()->json(['updates' => $active]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeManager($request);
        $validated = $this->validatedUpdate($request);
        $validated['id'] = (string) Str::uuid();
        $validated['created_at'] = now()->toIso8601String();

        $updates = $this->readUpdates();
        $updates[] = $validated;
        $this->writeUpdates($updates);

        return response()->json(['update' => $validated], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $this->authorizeManager($request);
        $validated = $this->validatedUpdate($request);
        $updates = $this->readUpdates();
        $index = array_search($id, array_column($updates, 'id'), true);
        abort_if($index === false, 404);

        $validated['id'] = $id;
        $validated['created_at'] = $updates[$index]['created_at'] ?? now()->toIso8601String();
        $updates[$index] = $validated;
        $this->writeUpdates($updates);

        return response()->json(['update' => $validated]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->authorizeManager($request);
        $updates = $this->readUpdates();
        $remaining = array_values(array_filter($updates, fn (array $update) => ($update['id'] ?? '') !== $id));
        abort_if(count($remaining) === count($updates), 404);
        $this->writeUpdates($remaining);

        return response()->json(['deleted' => true]);
    }

    private function authorizeManager(Request $request): void
    {
        $configuredKey = (string) config('services.noc_updates.admin_key', '');
        abort_if($configuredKey === '', 503, 'NOC update management is not configured.');
        abort_unless(hash_equals($configuredKey, (string) $request->header('X-NOC-Admin-Key')), 403);
    }

    private function validatedUpdate(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'area_codes' => ['required', 'array', 'min:1', 'max:30'],
            'area_codes.*' => ['required', 'string', 'max:16'],
            'type' => ['required', 'string', 'in:Major Fault,Planned Outage,Unplanned Outage,Other'],
            'reference' => ['nullable', 'string', 'max:60'],
            'sla' => ['nullable', 'string', 'max:120'],
            'valid_until' => ['required', 'date'],
            'agent_action' => ['required', 'string', 'max:700'],
            'customer_script' => ['required', 'string', 'max:1000'],
            'sr_required' => ['required', 'boolean'],
            'screenshot_required' => ['required', 'boolean'],
            'status' => ['required', 'string', 'in:active,monitoring,resolved'],
        ]);
    }

    private function readUpdates(): array
    {
        $path = storage_path('app/noc_updates.json');
        if (! is_file($path)) {
            return [];
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            abort(500, 'Could not read NOC updates file.');
        }
        try {
            flock($handle, LOCK_SH);
            $decoded = json_decode(stream_get_contents($handle) ?: '[]', true);
            abort_unless(is_array($decoded), 500, 'NOC updates file is invalid.');
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }

        return array_values(array_filter($decoded, 'is_array'));
    }

    private function writeUpdates(array $updates): void
    {
        $path = storage_path('app/noc_updates.json');
        $directory = dirname($path);
        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw new RuntimeException('Could not create NOC updates directory.');
        }

        $contents = json_encode($updates, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $handle = fopen($path, 'c+');
        if ($handle === false) {
            throw new RuntimeException('Could not open NOC updates file.');
        }

        try {
            if (! flock($handle, LOCK_EX)) {
                throw new RuntimeException('Could not lock NOC updates file.');
            }
            rewind($handle);
            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, $contents);
            fflush($handle);
            flock($handle, LOCK_UN);
        } finally {
            fclose($handle);
        }
    }
}
