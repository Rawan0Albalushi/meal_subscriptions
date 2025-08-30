<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        \Log::info('🔍 CheckRole Middleware - بدء التحقق', [
            'request_path' => $request->path(),
            'request_method' => $request->method(),
            'user_authenticated' => auth()->check(),
            'user_id' => auth()->check() ? auth()->id() : null,
            'user_role' => auth()->check() ? auth()->user()->role : null,
            'required_role' => $role,
            'headers' => $request->headers->all()
        ]);

        if (!auth()->check()) {
            \Log::error('❌ CheckRole Middleware - المستخدم غير مسجل دخول');
            return response()->json([
                'success' => false,
                'message' => 'يجب تسجيل الدخول أولاً'
            ], 401);
        }

        if (auth()->user()->role !== $role) {
            \Log::error('❌ CheckRole Middleware - المستخدم ليس لديه الصلاحية المطلوبة', [
                'user_role' => auth()->user()->role,
                'required_role' => $role
            ]);
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لهذا المورد'
            ], 403);
        }

        \Log::info('✅ CheckRole Middleware - التحقق ناجح', [
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role
        ]);

        return $next($request);
    }
}
