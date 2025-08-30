<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('🔍 LogAuthMiddleware - بدء معالجة الطلب', [
            'request_path' => $request->path(),
            'request_method' => $request->method(),
            'request_url' => $request->fullUrl(),
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
            'headers' => [
                'authorization' => $request->header('Authorization') ? 'موجود' : 'غير موجود',
                'content_type' => $request->header('Content-Type'),
                'accept' => $request->header('Accept'),
                'user_agent' => $request->header('User-Agent')
            ]
        ]);

        // التحقق من وجود token
        $authHeader = $request->header('Authorization');
        if ($authHeader) {
            \Log::info('🔑 LogAuthMiddleware - تم العثور على Authorization header', [
                'auth_header_length' => strlen($authHeader),
                'auth_header_starts_with_bearer' => str_starts_with($authHeader, 'Bearer ')
            ]);
        } else {
            \Log::warning('⚠️ LogAuthMiddleware - لا يوجد Authorization header');
        }

        $response = $next($request);

        \Log::info('✅ LogAuthMiddleware - انتهاء معالجة الطلب', [
            'response_status' => $response->getStatusCode(),
            'response_content_type' => $response->headers->get('Content-Type'),
            'user_authenticated' => auth()->check(),
            'user_id' => auth()->check() ? auth()->id() : null,
            'user_role' => auth()->check() ? auth()->user()->role : null
        ]);

        return $response;
    }
}
