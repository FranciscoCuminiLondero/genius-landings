<?php
/**
 * suenosimple/index.php
 * Router de landing: muestra la variante activa definida desde el admin.
 */

// Ruta al JSON central de landings activas (uno arriba, en admin/data/)
$configPath = __DIR__ . '/../admin/data/landings_activas.json';

// Variante por defecto si algo falla (debe existir siempre como red de seguridad)
$variantePorDefecto = 'index-default.html';

$variante = $variantePorDefecto;

if (file_exists($configPath)) {
    $json = json_decode(file_get_contents($configPath), true);
    if (is_array($json) && !empty($json['suenosimple']['variante'])) {
        $variante = $json['suenosimple']['variante'];
    }
}

// Sanitizar: solo permitir nombres de archivo simples, nada de rutas (../, /, etc.)
$variante = basename($variante);

$rutaArchivo = __DIR__ . '/' . $variante;

// Si el archivo activo no existe, caer al de por defecto
if (!file_exists($rutaArchivo)) {
    $rutaArchivo = __DIR__ . '/' . $variantePorDefecto;
}

if (file_exists($rutaArchivo)) {
    readfile($rutaArchivo);
} else {
    http_response_code(503);
    echo 'Landing no disponible en este momento.';
}