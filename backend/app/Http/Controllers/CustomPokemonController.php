<?php

namespace App\Http\Controllers;

use App\Models\CustomPokemon;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;

class CustomPokemonController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(CustomPokemon::all());
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge(['name' => strtolower(trim((string) $request->input('name')))]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9-]+$/',
                'unique:custom_pokemon,name',
                $this->notInPokeApi(),
            ],
            'base_experience' => ['nullable', 'integer', 'min:0'],
            'height' => ['required', 'integer', 'min:0'],
            'weight' => ['required', 'integer', 'min:0'],
        ]);

        $customPokemon = CustomPokemon::create($validated);

        return response()->json($customPokemon, 201);
    }

    public function show(CustomPokemon $customPokemon): JsonResponse
    {
        return response()->json($customPokemon);
    }

    public function update(Request $request, CustomPokemon $customPokemon): JsonResponse
    {
        $name = strtolower(trim((string) $request->input('name', $customPokemon->name)));
        $request->merge(['name' => $name]);

        $nameRules = [
            'required',
            'string',
            'max:255',
            'regex:/^[a-zA-Z0-9-]+$/',
            Rule::unique('custom_pokemon', 'name')->ignore($customPokemon),
        ];

        if ($name !== $customPokemon->name) {
            $nameRules[] = $this->notInPokeApi();
        }

        $validated = $request->validate([
            'name' => $nameRules,
            'base_experience' => ['nullable', 'integer', 'min:0'],
            'height' => ['sometimes', 'integer', 'min:0'],
            'weight' => ['sometimes', 'integer', 'min:0'],
        ]);

        $customPokemon->update($validated);

        return response()->json($customPokemon->refresh());
    }

    public function destroy(CustomPokemon $customPokemon): JsonResponse
    {
        $customPokemon->delete();

        return response()->json([
            'message' => 'Custom pokemon deleted.',
        ]);
    }

    private function notInPokeApi(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (Http::get('https://pokeapi.co/api/v2/pokemon/'.strtolower($value))->successful()) {
                $fail('The :attribute already exists in the official PokeAPI.');
            }
        };
    }
}
