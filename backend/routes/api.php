<?php

use App\Http\Controllers\BannedPokemonController;
use App\Http\Controllers\CustomPokemonController;
use App\Http\Controllers\PokemonController;
use App\Http\Middleware\VerifySecretKey;
use Illuminate\Support\Facades\Route;

Route::post('/info', [PokemonController::class, 'index']);

Route::middleware(VerifySecretKey::class)->group(function (): void {
    Route::get('/banned', [BannedPokemonController::class, 'index']);
    Route::post('/banned', [BannedPokemonController::class, 'store']);
    Route::delete('/banned/{bannedPokemon}', [BannedPokemonController::class, 'destroy']);

    Route::get('/custom', [CustomPokemonController::class, 'index']);
    Route::post('/custom', [CustomPokemonController::class, 'store']);
    Route::get('/custom/{customPokemon}', [CustomPokemonController::class, 'show']);
    Route::match(['put', 'patch'], '/custom/{customPokemon}', [CustomPokemonController::class, 'update']);
    Route::delete('/custom/{customPokemon}', [CustomPokemonController::class, 'destroy']);
});
