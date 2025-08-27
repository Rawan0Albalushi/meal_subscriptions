<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get language from Accept-Language header
        $language = $request->header('Accept-Language');
        
        // Validate language is either 'ar' or 'en'
        if ($language && in_array($language, ['ar', 'en'])) {
            app()->setLocale($language);
        } else {
            // Default to Arabic if no valid language is provided
            app()->setLocale('ar');
        }
        
        return $next($request);
    }
}
