<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isSeller()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول. يجب أن تكون بائعاً.'
            ], 403);
        }

        return $next($request);
    }
}
