<?php
// Personajes: listar (GET) y crear / editar / borrar (POST con "accion").
require __DIR__ . '/db.php';
require __DIR__ . '/fotos.php';

const CAMPOS_TEXTO = ['bio' => 400, 'ubicacion' => 100, 'web' => 200, 'union_fecha' => 60,
                      'n_tweets' => 20, 'n_siguiendo' => 20, 'n_seguidores' => 20, 'n_favoritos' => 20];

// Las versiones anteriores ponían el candado 🔒 dentro del nombre: ahora es "cuenta privada"
function arreglarCandados($conn)
{
    $res = $conn->query("SELECT id, nombre FROM personajes");
    while ($f = $res->fetch_assoc()) {
        if (strpos($f['nombre'], "\u{1F512}") === false) continue;
        $nombre = trim(preg_replace('/\x{1F512}[\x{FE0E}\x{FE0F}]?/u', '', $f['nombre']));
        if ($nombre === '') $nombre = 'Sin nombre';
        $id = (int) $f['id'];
        $st = $conn->prepare("UPDATE personajes SET nombre = ?, privada = 1 WHERE id = ?");
        $st->bind_param('si', $nombre, $id);
        $st->execute();
    }
}

function listar($conn)
{
    arreglarCandados($conn);
    $res = $conn->query("SELECT id, nombre, usuario, foto, portada, bio, ubicacion, web, union_fecha, color,
                                privada, verificada, n_tweets, n_siguiendo, n_seguidores, n_favoritos
                         FROM personajes ORDER BY id");
    $lista = [];
    while ($f = $res->fetch_assoc()) {
        $f['id'] = (int) $f['id'];
        $f['privada'] = (bool) $f['privada'];
        $f['verificada'] = (bool) $f['verificada'];
        $lista[] = $f;
    }
    return $lista;
}

function limpiarUsuario($u)
{
    $u = trim(ltrim(trim($u), '@'));
    return $u === '' ? '' : '@' . $u;
}

function limpiarColor($c)
{
    return preg_match('/^#[0-9a-fA-F]{6}$/', $c) ? strtolower($c) : '#55acee';
}

function filaActual($conn, $id)
{
    $st = $conn->prepare("SELECT foto, portada FROM personajes WHERE id = ?");
    $st->bind_param('i', $id);
    $st->execute();
    return $st->get_result()->fetch_assoc();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    responder(['personajes' => listar($conn)]);
}

$accion = $_POST['accion'] ?? '';

if ($accion === 'crear' || $accion === 'editar') {
    $nombre  = cortar(trim($_POST['nombre'] ?? ''), 100);
    $usuario = cortar(limpiarUsuario($_POST['usuario'] ?? ''), 100);
    if ($nombre === '' || $usuario === '') {
        responder(['error' => 'Falta el nombre o el @usuario.'], 400);
    }
    $valores = [
        'nombre'     => $nombre,
        'usuario'    => $usuario,
        'color'      => limpiarColor($_POST['color'] ?? ''),
        'privada'    => !empty($_POST['privada']) && $_POST['privada'] !== '0' ? 1 : 0,
        'verificada' => !empty($_POST['verificada']) && $_POST['verificada'] !== '0' ? 1 : 0,
    ];
    foreach (CAMPOS_TEXTO as $campo => $max) {
        $valores[$campo] = cortar(trim($_POST[$campo] ?? ''), $max);
    }
    if ($valores['union_fecha'] === '') $valores['union_fecha'] = 'marzo de 2012';

    $id = (int) ($_POST['id'] ?? 0);
    $vieja = null;
    if ($accion === 'editar') {
        $vieja = filaActual($conn, $id);
        if (!$vieja) responder(['error' => 'Ese personaje ya no existe.'], 404);
    }

    $foto = guardarImagen('foto');
    $portada = guardarImagen('portada');
    if ($foto !== null) $valores['foto'] = $foto;
    if ($portada !== null) $valores['portada'] = $portada;
    elseif (!empty($_POST['quitar_portada'])) $valores['portada'] = '';

    $campos = array_keys($valores);
    $tipos = '';
    $params = [];
    foreach ($valores as $v) {
        $tipos .= is_int($v) ? 'i' : 's';
        $params[] = $v;
    }

    if ($accion === 'crear') {
        if (!isset($valores['foto'])) {
            $campos[] = 'foto';
            $tipos .= 's';
            $params[] = '';
        }
        $sql = "INSERT INTO personajes (" . implode(', ', $campos) . ") VALUES (" . implode(', ', array_fill(0, count($campos), '?')) . ")";
        $st = $conn->prepare($sql);
        $st->bind_param($tipos, ...$params);
        $st->execute();
        $nuevoId = $conn->insert_id;
        responder(['personajes' => listar($conn), 'id' => $nuevoId]);
    }

    $sql = "UPDATE personajes SET " . implode(', ', array_map(fn($c) => "$c = ?", $campos)) . " WHERE id = ?";
    $tipos .= 'i';
    $params[] = $id;
    $st = $conn->prepare($sql);
    $st->bind_param($tipos, ...$params);
    $st->execute();

    if ($foto !== null) borrarImagen($vieja['foto']);
    if (array_key_exists('portada', $valores) && $vieja['portada'] !== $valores['portada']) borrarImagen($vieja['portada']);
    responder(['personajes' => listar($conn), 'id' => $id]);
}

if ($accion === 'borrar') {
    $id = (int) ($_POST['id'] ?? 0);
    $fila = filaActual($conn, $id);
    if ($fila) {
        // Sus tweets (y las fotos que llevan) se borran con él
        $st = $conn->prepare("SELECT datos FROM tweets WHERE autor_id = ?");
        $st->bind_param('i', $id);
        $st->execute();
        $res = $st->get_result();
        while ($t = $res->fetch_assoc()) borrarImagenesTweet(json_decode($t['datos'], true));

        $st = $conn->prepare("DELETE FROM tweets WHERE autor_id = ?");
        $st->bind_param('i', $id);
        $st->execute();

        $st = $conn->prepare("DELETE FROM personajes WHERE id = ?");
        $st->bind_param('i', $id);
        $st->execute();
        borrarImagen($fila['foto']);
        borrarImagen($fila['portada']);
    }
    responder(['personajes' => listar($conn)]);
}

responder(['error' => 'Acción desconocida.'], 400);
