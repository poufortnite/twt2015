<?php
// Sube una imagen para un tweet o una respuesta y devuelve el nombre del archivo.
require __DIR__ . '/db.php';
require __DIR__ . '/fotos.php';

$nombre = guardarImagen('imagen');
if ($nombre === null) responder(['error' => 'No has elegido ninguna imagen.'], 400);
responder(['archivo' => $nombre]);
