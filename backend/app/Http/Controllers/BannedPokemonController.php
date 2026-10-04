<?php

namespace App\Http\Controllers;

use App\Models\BannedPokemon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannedPokemonController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BannedPokemon::all());
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge(['name' => strtolower(trim((string) $request->input('name')))]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9-]+$/', 'unique:banned_pokemon,name'],
        ]);

        $bannedPokemon = BannedPokemon::create($validated);

        return response()->json($bannedPokemon, 201);
    }

    public function destroy(BannedPokemon $bannedPokemon): JsonResponse
    {
        $bannedPokemon->delete();

        return response()->json([
            'message' => 'Pokemon removed from ban list.',
        ]);
    }
}
