<?php
// Ajustes generales: desde qué cuenta se mira y a quién sigue cada cuenta.
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $valor = leerAjuste($conn, 'app');
    responder(['app' => $valor ? json_decode($valor) : null]);
}

$datos = leerJSON();
guardarAjuste($conn, 'app', json_encode($datos, JSON_UNESCAPED_UNICODE));
responder(['ok' => true]);
