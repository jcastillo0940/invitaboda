<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// 1. Determinar si la aplicación está en modo mantenimiento
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// 2. Registrar el autoloader de Composer
require __DIR__.'/../vendor/autoload.php';

// 3. Arrancar Laravel
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// --- NUEVA LÍNEA VITAL ---
// Esto obliga a Laravel a saber que su carpeta pública es public_html
$app->usePublicPath(__DIR__);
// -------------------------

// 4. Manejar la solicitud
$app->handleRequest(Request::capture());