<?php
// public_html/storage_check.php
echo "<h3>Diagnóstico de Almacenamiento</h3>";

$publicStorage = __DIR__ . '/storage';
$actualStorage = __DIR__ . '/../storage/app/public';

echo "Ruta pública: " . $publicStorage . "<br>";
echo "Ruta real: " . $actualStorage . "<br>";

if (file_exists($publicStorage)) {
    echo "EL ENLACE 'storage' EXISTE.<br>";
    if (is_link($publicStorage)) {
        echo "Es un enlace simbólico que apunta a: " . readlink($publicStorage) . "<br>";
    } else {
        echo "Es un DIRECTORIO REAL o JUNCTION.<br>";
    }
} else {
    echo "EL ENLACE 'storage' NO EXISTE.<br>";
}

echo "<h4>Contenido de storage/app/public/designs/</h4>";
$designDir = $actualStorage . '/designs';
if (is_dir($designDir)) {
    $files = scandir($designDir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "- $file <br>";
        }
    }
} else {
    echo "El directorio de diseños no existe en la ruta real.<br>";
}

echo "<h4>Prueba de lectura directa</h4>";
$testFile = $designDir . '/iaizUIcUOpIuVKpBTHgQBQluoWz5fKwJj62MVcVX.jpg';
if (file_exists($testFile)) {
    echo "Archivo de prueba encontrado. Tamaño: " . filesize($testFile) . " bytes.<br>";
} else {
    echo "Archivo de prueba NO encontrado.<br>";
}
