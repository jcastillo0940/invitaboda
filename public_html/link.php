<?php
$target = __DIR__ . '/../storage/app/public';
$link = __DIR__ . '/storage';
if (symlink($target, $link)) {
    echo "¡Enlace creado con éxito!";
} else {
    echo "Error al crear el enlace.";
}
