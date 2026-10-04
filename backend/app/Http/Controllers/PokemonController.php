<?php

namespace App\Http\Controllers;

use App\Models\BannedPokemon;
use App\Models\CustomPokemon;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PokemonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'names' => ['required', 'array', 'min:1', 'max:50'],
            'names.*' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9-]+$/'],
        ]);

        $names = collect($validated['names'])
            ->map(fn (string $name): string => strtolower(trim($name)))
            ->unique()
            ->values();

        $bannedNames = BannedPokemon::query()
            ->pluck('name')
            ->map(fn (string $name): string => strtolower($name));

        $allowedNames = $names->diff($bannedNames)->values();

        $customPokemons = CustomPokemon::query()
            ->whereIn('name', $allowedNames)
            ->get()
            ->keyBy('name');

        $apiNames = $allowedNames->diff($customPokemons->keys())->values();

        $responses = Http::pool(function (Pool $pool) use ($apiNames): void {
            foreach ($apiNames as $name) {
                $pool->as($name)->get("https://pokeapi.co/api/v2/pokemon/{$name}");
            }
        });

        $pokemons = [];
        $notFound = [];

        foreach ($allowedNames as $name) {
            if ($customPokemons->has($name)) {
                $pokemons[] = $this->mapCustomPokemon($customPokemons[$name]);

                continue;
            }

            $response = $responses[$name] ?? null;

            if (! $response instanceof Response || ! $response->successful()) {
                $notFound[] = $name;

                continue;
            }

            $pokemons[] = $this->mapPokemon($response->json());
        }

        return response()->json([
            'data' => $pokemons,
            'not_found' => $notFound,
        ]);
    }

    private function mapPokemon(array $details): array
    {
        return [
            'id' => $details['id'],
            'name' => $details['name'],
            'height' => $details['height'],
            'weight' => $details['weight'],
            'base_experience' => $details['base_experience'],
            'types' => array_map(fn (array $type): string => $type['type']['name'], $details['types'] ?? []),
            'abilities' => array_map(fn (array $ability): string => $ability['ability']['name'], $details['abilities'] ?? []),
            'stats' => array_map(fn (array $stat): array => [
                'name' => $stat['stat']['name'],
                'value' => $stat['base_stat'],
            ], $details['stats'] ?? []),
            'sprites' => [
                'front_default' => $details['sprites']['front_default'] ?? null,
                'back_default' => $details['sprites']['back_default'] ?? null,
                'official_artwork' => $details['sprites']['other']['official-artwork']['front_default'] ?? null,
            ],
            'is_custom' => false,
        ];
    }

    private function mapCustomPokemon(CustomPokemon $pokemon): array
    {
        return [
            'id' => $pokemon->id,
            'name' => $pokemon->name,
            'height' => $pokemon->height,
            'weight' => $pokemon->weight,
            'base_experience' => $pokemon->base_experience,
            'types' => [],
            'abilities' => [],
            'stats' => [],
            'sprites' => [
                'front_default' => null,
                'back_default' => null,
                'official_artwork' => null,
            ],
            'is_custom' => true,
        ];
    }
}
