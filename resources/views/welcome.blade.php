<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#5b2c91">
        <link rel="icon" type="image/svg+xml" href="/we-logo.svg">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>WE EXCEED | مساعد الدعم الفني</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body>
        <div id="app"></div>
        <noscript>
            <p dir="rtl" style="margin: 2rem auto; max-width: 32rem; padding: 1rem; text-align: center; font-family: sans-serif;">
                يلزم تفعيل JavaScript لاستخدام شجرة القرارات.
            </p>
        </noscript>
    </body>
</html>
