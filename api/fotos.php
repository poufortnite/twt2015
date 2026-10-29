<?php
// Funciones para guardar y borrar imágenes en la carpeta uploads

const CARPETA_FOTOS = __DIR__ . '/../uploads/';

// Guarda el archivo subido en el campo $campo y devuelve su nombre (o null si no se subió nada)
function guardarImagen($campo)
{
    if (!isset($_FILES[$campo]) || $_FILES[$campo]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $f = $_FILES[$campo];
    if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) {
        responder(['error' => 'La imagen pesa demasiado.'], 400);
    }
    if ($f['error'] !== UPLOAD_ERR_OK) {
        responder(['error' => 'No se pudo subir la imagen (código ' . $f['error'] . ').'], 400);
    }
    $info = @getimagesize($f['tmp_name']);
    $tipos = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
    if (!$info || !isset($tipos[$info['mime']])) {
        responder(['error' => 'Ese archivo no es una imagen válida.'], 400);
    }
    if (!is_dir(CARPETA_FOTOS) || !is_writable(CARPETA_FOTOS)) {
        responder(['error' => 'La carpeta uploads no existe o Apache no puede escribir en ella.'], 500);
    }
    $nombre = time() . '_' . bin2hex(random_bytes(4)) . '.' . $tipos[$info['mime']];
    if (!move_uploaded_file($f['tmp_name'], CARPETA_FOTOS . $nombre)) {
        responder(['error' => 'No se pudo guardar la imagen en uploads.'], 500);
    }
    return $nombre;
}

function borrarImagen($nombre)
{
    if (!is_string($nombre) || $nombre === '' || $nombre !== basename($nombre)) return;
    $ruta = CARPETA_FOTOS . $nombre;
    if (is_file($ruta)) @unlink($ruta);
}

// Borra las imágenes que lleva un tweet (la suya y las de sus respuestas)
function borrarImagenesTweet($datos)
{
    if (!is_array($datos)) return;
    borrarImagen($datos['imagen'] ?? '');
    foreach (($datos['respuestas'] ?? []) as $r) {
        borrarImagen($r['imagen'] ?? '');
    }
}
