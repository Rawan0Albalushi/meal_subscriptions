<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        \Log::info('🔍 EnsureRole Middleware - بدء التحقق', [
            'request_path' => $request->path(),
            'required_role' => $role,
            'user_authenticated' => $request->user() ? 'نعم' : 'لا',
            'user_role' => $request->user() ? $request->user()->role : 'غير محدد'
        ]);

        if (!$request->user()) {
            \Log::error('❌ EnsureRole Middleware - المستخدم غير مسجل دخول');
            abort(403, 'Unauthorized access');
        }

        if ($request->user()->role !== $role) {
            \Log::error('❌ EnsureRole Middleware - المستخدم ليس لديه الصلاحية المطلوبة', [
                'user_role' => $request->user()->role,
                'required_role' => $role
            ]);
            abort(403, 'Unauthorized access');
        }

        \Log::info('✅ EnsureRole Middleware - التحقق ناجح', [
            'user_role' => $request->user()->role,
            'required_role' => $role
        ]);

        return $next($request);
    }
}
