<?php
// Conexión a MariaDB. La base de datos y las tablas se crean (y se actualizan) solas.
header('Content-Type: application/json; charset=utf-8');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Datos de conexión: se leen de config.php; si no existe, se usan los de XAMPP por defecto
if (file_exists(__DIR__ . '/config.php')) require __DIR__ . '/config.php';
defined('DB_HOST') || define('DB_HOST', 'localhost');
defined('DB_USER') || define('DB_USER', 'root');
defined('DB_PASS') || define('DB_PASS', '');
defined('DB_NAME') || define('DB_NAME', 'twt2015');
const VERSION_ESQUEMA = 2;

// Si PHP falla de golpe, devolver el error en JSON para que la página lo muestre
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode(['error' => 'Error de PHP: ' . $e['message'] . ' (' . basename($e['file']) . ':' . $e['line'] . ')'], JSON_UNESCAPED_UNICODE);
    }
});
ini_set('display_errors', '0');

// Cortar un texto a N caracteres sin romper tildes ni emojis (sin depender de php-mbstring)
function cortar($texto, $max)
{
    if (function_exists('mb_substr')) return mb_substr($texto, 0, $max);
    return preg_match('/^.{0,' . (int) $max . '}/us', $texto, $m) ? $m[0] : substr($texto, 0, $max);
}

function responder($datos, $codigo = 200)
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Lee el cuerpo JSON de una petición POST
function leerJSON()
{
    $cuerpo = file_get_contents('php://input');
    if (strlen($cuerpo) > 4000000) responder(['error' => 'Demasiados datos.'], 400);
    $datos = json_decode($cuerpo, true);
    if (!is_array($datos)) responder(['error' => 'Datos no válidos.'], 400);
    return $datos;
}

function leerAjuste($conn, $clave)
{
    $st = $conn->prepare("SELECT valor FROM ajustes WHERE clave = ?");
    $st->bind_param('s', $clave);
    $st->execute();
    $fila = $st->get_result()->fetch_assoc();
    return $fila ? $fila['valor'] : null;
}

function guardarAjuste($conn, $clave, $valor)
{
    $st = $conn->prepare("INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
    $st->bind_param('ss', $clave, $valor);
    $st->execute();
}

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    $conn->set_charset('utf8mb4');
    $conn->query("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $conn->select_db(DB_NAME);

    $conn->query("CREATE TABLE IF NOT EXISTS ajustes (
        clave VARCHAR(50) PRIMARY KEY,
        valor MEDIUMTEXT NOT NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $version = (int) (leerAjuste($conn, 'version') ?? 0);
    if ($version < VERSION_ESQUEMA) {
        require __DIR__ . '/migraciones.php';
        migrar($conn, $version);
        guardarAjuste($conn, 'version', (string) VERSION_ESQUEMA);
    }
} catch (Throwable $e) {
    $msg = 'Error con la base de datos: ' . $e->getMessage();
    if ($e instanceof mysqli_sql_exception && in_array($e->getCode(), [1044, 1045, 2002], true)) {
        $msg = 'No se pudo conectar a la base de datos (' . $e->getMessage() . '). '
             . 'Copia api/config.example.php como api/config.php y pon tu usuario y contraseña de MariaDB/MySQL.';
    }
    responder(['error' => $msg], 500);
}
