<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomPokemon extends Model
{
    protected $fillable = ['name', 'base_experience', 'height', 'weight'];
}
