<!doctype html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700&display=swap" rel="stylesheet">
    
    <!-- Preload custom fonts -->
    <link rel="preload" href="{{ asset('fonts/TheYearofHandicrafts-Regular.otf') }}" as="font" type="font/otf" crossorigin>
    <link rel="preload" href="{{ asset('fonts/TheYearofHandicrafts-Medium.otf') }}" as="font" type="font/otf" crossorigin>
    <link rel="preload" href="{{ asset('fonts/TheYearofHandicrafts-SemiBold.otf') }}" as="font" type="font/otf" crossorigin>
    <link rel="preload" href="{{ asset('fonts/TheYearofHandicrafts-Bold.otf') }}" as="font" type="font/otf" crossorigin>
    @php
        $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
    @endphp
    
    <link rel="stylesheet" href="{{ asset('build/' . $manifest['resources/css/app.css']['file']) }}">
    <script type="module" src="{{ asset('build/' . $manifest['resources/js/app.jsx']['file']) }}"></script>
    <title>اشتراك الوجبات</title>
  </head>
  <body>
    <div id="app"></div>
    <noscript>فعّل الجافاسكربت.</noscript>
  </body>
</html>

