<?php
echo "PHP está funcionando.<br>";
echo "Versión: " . phpversion() . "<br>";

$ruta = __DIR__ . '/data/landings_activas.json';
echo "Buscando archivo en: " . htmlspecialchars($ruta) . "<br>";

if (file_exists($ruta)) {
    echo "El archivo JSON existe.<br>";
    echo "Es legible: " . (is_readable($ruta) ? 'sí' : 'NO') . "<br>";
    $contenido = file_get_contents($ruta);
    echo "Contenido crudo:<br><pre>" . htmlspecialchars($contenido) . "</pre>";

    $json = json_decode($contenido, true);
    if ($json === null) {
        echo "ERROR: el JSON no se pudo decodificar. json_last_error_msg(): " . json_last_error_msg();
    } else {
        echo "JSON decodificado correctamente.";
    }
} else {
    echo "ERROR: el archivo NO existe en esa ruta.";
}