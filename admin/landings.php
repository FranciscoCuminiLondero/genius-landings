
/**
 * admin/landings.php
 * Panel para activar la variante de landing vigente, por cliente.
 * Por ahora solo opera sobre "suenosimple"; techstore y modalatam
 * quedan listos en el JSON para sumarse sin tocar esta lógica.
 */
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$configPath = __DIR__ . '/data/landings_activas.json';

// Definición de variantes disponibles por cliente.
// "archivo" => null significa que todavía no fue subido al servidor.
$clientesDisponibles = [
    'suenosimple' => [
        'nombre' => 'SueñoSimple',
        'variantes' => [
            'index-default.html' => ['etiqueta' => 'Genérica',        'archivo' => 'index-default.html'],
            'diamadre.html'      => ['etiqueta' => 'Día de la Madre', 'archivo' => 'diamadre.html'],
            'economica-pro.html' => ['etiqueta' => 'Económica Pro',   'archivo' => 'economica-pro.html'],
            'mundial.html'       => ['etiqueta' => 'Mundial',         'archivo' => null],
            'blackfriday.html'   => ['etiqueta' => 'Black Friday',    'archivo' => null],
        ],
    ],
    // 'techstore'  => [ ... ],  // próximamente
    // 'modalatam'  => [ ... ],  // próximamente
];

function leer_estado(string $configPath): array {
    if (!file_exists($configPath)) return [];
    $json = json_decode(file_get_contents($configPath), true);
    return is_array($json) ? $json : [];
}

function guardar_estado(string $configPath, array $estado): bool {
    $ok = file_put_contents(
        $configPath,
        json_encode($estado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
    return $ok !== false;
}

$mensaje = '';
$mensajeTipo = ''; // 'ok' | 'error'

// --- Procesar activación ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['cliente'], $_POST['variante'])) {
    $cliente  = $_POST['cliente'];
    $variante = $_POST['variante'];

    if (!isset($clientesDisponibles[$cliente])) {
        $mensaje = 'Cliente no reconocido.';
        $mensajeTipo = 'error';
    } elseif (!isset($clientesDisponibles[$cliente]['variantes'][$variante])) {
        $mensaje = 'Variante no reconocida para ese cliente.';
        $mensajeTipo = 'error';
    } elseif (empty($clientesDisponibles[$cliente]['variantes'][$variante]['archivo'])) {
        $mensaje = 'Esa variante todavía no fue subida al servidor.';
        $mensajeTipo = 'error';
    } else {
        $estado = leer_estado($configPath);
        $estado[$cliente] = [
            'variante'    => $variante,
            'actualizado' => date('Y-m-d H:i:s'),
        ];
        if (guardar_estado($configPath, $estado)) {
            $mensaje = 'Landing activada correctamente.';
            $mensajeTipo = 'ok';
        } else {
            $mensaje = 'No se pudo escribir el archivo de configuración. Revisá permisos de admin/data/.';
            $mensajeTipo = 'error';
        }
    }
}

$estadoActual = leer_estado($configPath);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Genius — Admin de Landings</title>
  <link rel="stylesheet" href="css/styles.css">
  <style>
    .landing-panel { max-width: 720px; margin: 0 auto; }
    .variant-grid { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); margin-top: 1rem; }
    .variant-card { border: 1px solid #333; border-radius: 8px; padding: 1rem; text-align: center; }
    .variant-card.activa { border-color: #4ade80; box-shadow: 0 0 0 1px #4ade80; }
    .variant-card.no-disponible { opacity: .45; }
    .variant-label { display: block; margin-bottom: .6rem; font-weight: 600; }
    .badge-activa { display: inline-block; font-size: .75rem; color: #4ade80; margin-bottom: .4rem; }
    .alerta { padding: .8rem 1rem; border-radius: 6px; margin: 1rem 0; }
    .alerta.ok { background: #14532d; color: #bbf7d0; }
    .alerta.error { background: #7f1d1d; color: #fecaca; }
    .cliente-proximamente { opacity: .5; margin-top: 2rem; }
  </style>
</head>
<body>

  <header class="site-header">
    <a href="index.php" class="brand">Genius<span>.</span></a>
    <span class="header-meta">Admin — Estado de landings</span>
  </header>

  <main class="landing-panel">
    <div class="page-header">
      <h1>Landings activas</h1>
      <p>Elegí qué variante se muestra a los visitantes de cada cliente.</p>
    </div>

    <?php if ($mensaje): ?>
      <div class="alerta <?= htmlspecialchars($mensajeTipo) ?>">
        <?= htmlspecialchars($mensaje) ?>
      </div>
    <?php endif; ?>

    <?php foreach ($clientesDisponibles as $clienteKey => $cliente): ?>
      <section>
        <h2><?= htmlspecialchars($cliente['nombre']) ?></h2>

        <?php
          $varianteActiva = $estadoActual[$clienteKey]['variante'] ?? null;
          $actualizado    = $estadoActual[$clienteKey]['actualizado'] ?? null;
        ?>
        <p style="opacity:.7; font-size:.9rem;">
          <?php if ($actualizado): ?>
            Última actualización: <?= htmlspecialchars($actualizado) ?>
          <?php else: ?>
            Sin actualizaciones registradas todavía.
          <?php endif; ?>
        </p>

        <div class="variant-grid">
          <?php foreach ($cliente['variantes'] as $variantKey => $variant): ?>
            <?php
              $esActiva      = $variantKey === $varianteActiva;
              $disponible    = !empty($variant['archivo']);
              $clases        = 'variant-card' . ($esActiva ? ' activa' : '') . (!$disponible ? ' no-disponible' : '');
            ?>
            <div class="<?= $clases ?>">
              <span class="variant-label"><?= htmlspecialchars($variant['etiqueta']) ?></span>

              <?php if ($esActiva): ?>
                <span class="badge-activa">● Activa ahora</span><br>
              <?php endif; ?>

              <?php if ($disponible): ?>
                <form method="post" style="margin:0;">
                  <input type="hidden" name="cliente" value="<?= htmlspecialchars($clienteKey) ?>">
                  <input type="hidden" name="variante" value="<?= htmlspecialchars($variantKey) ?>">
                  <button type="submit" class="btn btn-primary" <?= $esActiva ? 'disabled' : '' ?>>
                    <?= $esActiva ? 'En uso' : 'Activar' ?>
                  </button>
                </form>
              <?php else: ?>
                <button type="button" class="btn" disabled>Sin subir</button>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endforeach; ?>

    <div class="cliente-proximamente">
      <p>TechStore y ModaLatam se habilitarán acá próximamente.</p>
    </div>
  </main>

  <footer class="site-footer">
    Genius Agency &mdash; Uso interno. No compartir fuera del equipo.
  </footer>

</body>
</html>