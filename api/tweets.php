<?php
// Tweets: GET los devuelve todos; POST (JSON con "accion") crea, guarda, borra u ordena.
require __DIR__ . '/db.php';
require __DIR__ . '/fotos.php';

function leerTweet($conn, $id)
{
    $st = $conn->prepare("SELECT id, autor_id, orden, datos FROM tweets WHERE id = ?");
    $st->bind_param('i', $id);
    $st->execute();
    $f = $st->get_result()->fetch_assoc();
    if (!$f) return null;
    return ['id' => (int) $f['id'], 'autor_id' => (int) $f['autor_id'], 'orden' => (int) $f['orden'], 'datos' => json_decode($f['datos'], true)];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $res = $conn->query("SELECT id, autor_id, orden, datos FROM tweets ORDER BY orden DESC, id DESC");
    $lista = [];
    while ($f = $res->fetch_assoc()) {
        $lista[] = ['id' => (int) $f['id'], 'autor_id' => (int) $f['autor_id'], 'orden' => (int) $f['orden'], 'datos' => json_decode($f['datos'], true)];
    }
    responder(['tweets' => $lista]);
}

$p = leerJSON();
$accion = $p['accion'] ?? '';

if ($accion === 'crear') {
    $autor = (int) ($p['autor_id'] ?? 0);
    if ($autor <= 0) responder(['error' => 'Falta el autor.'], 400);
    $datos = json_encode($p['datos'] ?? new stdClass(), JSON_UNESCAPED_UNICODE);
    $orden = (int) $conn->query("SELECT COALESCE(MAX(orden), 0) + 1 AS o FROM tweets")->fetch_assoc()['o'];
    $st = $conn->prepare("INSERT INTO tweets (autor_id, orden, datos) VALUES (?, ?, ?)");
    $st->bind_param('iis', $autor, $orden, $datos);
    $st->execute();
    responder(['tweet' => leerTweet($conn, $conn->insert_id)]);
}

if ($accion === 'guardar') {
    $id = (int) ($p['id'] ?? 0);
    $autor = (int) ($p['autor_id'] ?? 0);
    if (!is_array($p['datos'] ?? null)) responder(['error' => 'Datos no válidos.'], 400);
    $datos = json_encode($p['datos'], JSON_UNESCAPED_UNICODE);
    $st = $conn->prepare("UPDATE tweets SET autor_id = ?, datos = ? WHERE id = ?");
    $st->bind_param('isi', $autor, $datos, $id);
    $st->execute();
    responder(['ok' => true]);
}

if ($accion === 'borrar') {
    $id = (int) ($p['id'] ?? 0);
    $t = leerTweet($conn, $id);
    if ($t) {
        borrarImagenesTweet($t['datos']);
        $st = $conn->prepare("DELETE FROM tweets WHERE id = ?");
        $st->bind_param('i', $id);
        $st->execute();
    }
    responder(['ok' => true]);
}

if ($accion === 'ordenar') {
    $st = $conn->prepare("UPDATE tweets SET orden = ? WHERE id = ?");
    foreach (($p['orden'] ?? []) as $o) {
        $orden = (int) ($o['orden'] ?? 0);
        $id = (int) ($o['id'] ?? 0);
        $st->bind_param('ii', $orden, $id);
        $st->execute();
    }
    responder(['ok' => true]);
}

responder(['error' => 'Acción desconocida.'], 400);
