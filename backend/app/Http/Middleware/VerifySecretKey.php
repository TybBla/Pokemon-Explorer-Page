<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifySecretKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $secretKey = config('services.super_secret_key');
        $providedKey = $request->header('X-SUPER-SECRET-KEY');

        if (empty($secretKey) || ! hash_equals($secretKey, (string) $providedKey)) {
            return response()->json([
                'message' => 'Unauthorized. Invalid or missing X-SUPER-SECRET-KEY header.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
