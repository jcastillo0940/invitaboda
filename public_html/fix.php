<?php
// public_html/fix.php

// 1. Forzar la creación del enlace simbólico si falta
$publicHtml = __DIR__;
$storage = __DIR__ . '/../storage/app/public';
if (!file_exists($publicHtml . '/storage')) {
    symlink($storage, $publicHtml . '/storage');
}

// 2. Limpiar caché manualmente eliminando archivos
$cachePath = __DIR__ . '/../bootstrap/cache/*.php';
array_map('unlink', glob($cachePath));

echo "Limpieza manual completada. Borra este archivo después de usarlo.";