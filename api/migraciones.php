<?php
// Crea las tablas y actualiza las de versiones anteriores sin perder nada.

function migrar($conn, $desde)
{
    $conn->query("CREATE TABLE IF NOT EXISTS personajes (
        id      INT AUTO_INCREMENT PRIMARY KEY,
        nombre  VARCHAR(100) NOT NULL,
        usuario VARCHAR(100) NOT NULL,
        foto    VARCHAR(255) NOT NULL DEFAULT '',
        creado  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // Campos del perfil (versión 2)
    $columnas = [
        "portada      VARCHAR(255) NOT NULL DEFAULT ''",
        "bio          VARCHAR(400) NOT NULL DEFAULT ''",
        "ubicacion    VARCHAR(100) NOT NULL DEFAULT ''",
        "web          VARCHAR(200) NOT NULL DEFAULT ''",
        "union_fecha  VARCHAR(60)  NOT NULL DEFAULT 'marzo de 2012'",
        "color        VARCHAR(7)   NOT NULL DEFAULT '#55acee'",
        "privada      TINYINT(1)   NOT NULL DEFAULT 0",
        "verificada   TINYINT(1)   NOT NULL DEFAULT 0",
        "n_tweets     VARCHAR(20)  NOT NULL DEFAULT ''",
        "n_siguiendo  VARCHAR(20)  NOT NULL DEFAULT ''",
        "n_seguidores VARCHAR(20)  NOT NULL DEFAULT ''",
        "n_favoritos  VARCHAR(20)  NOT NULL DEFAULT ''",
    ];
    foreach ($columnas as $c) {
        $conn->query("ALTER TABLE personajes ADD COLUMN IF NOT EXISTS $c");
    }

    $conn->query("CREATE TABLE IF NOT EXISTS tweets (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        autor_id INT NOT NULL,
        orden    INT NOT NULL DEFAULT 0,
        datos    MEDIUMTEXT NOT NULL,
        creado   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (autor_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // El tweet de la versión anterior (tabla "estado") pasa a ser el primer tweet de su autor
    $hayEstado = $conn->query("SHOW TABLES LIKE 'estado'")->num_rows > 0;
    $hayTweets = (int) $conn->query("SELECT COUNT(*) AS n FROM tweets")->fetch_assoc()['n'] > 0;
    if ($hayEstado && !$hayTweets) {
        $fila = $conn->query("SELECT datos FROM estado WHERE id = 1")->fetch_assoc();
        $viejo = $fila ? json_decode($fila['datos'], true) : null;
        if (is_array($viejo) && !empty($viejo['autorId'])) {
            $autor = (int) $viejo['autorId'];
            $datos = [
                'texto'      => $viejo['texto'] ?? '',
                'fecha'      => $viejo['fecha'] ?? '12:18 - 6 feb. 2015',
                'rts'        => $viejo['rts'] ?? '0',
                'favs'       => $viejo['favs'] ?? '0',
                'caras'      => $viejo['caras'] ?? [],
                'rtPor'      => [],
                'imagen'     => '',
                'respuestas' => $viejo['respuestas'] ?? [],
            ];
            $json = json_encode($datos, JSON_UNESCAPED_UNICODE);
            $st = $conn->prepare("INSERT INTO tweets (autor_id, orden, datos) VALUES (?, 1, ?)");
            $st->bind_param('is', $autor, $json);
            $st->execute();

            // La cuenta desde la que se miraba también se conserva
            if (!empty($viejo['miradorId'])) {
                $rel = new stdClass();
                if (isset($viejo['siguiendo']) && $viejo['siguiendo'] === false) {
                    $rel->{((int) $viejo['miradorId']) . '-' . $autor} = 'seguir';
                }
                $app = ['miradorId' => (int) $viejo['miradorId'], 'relaciones' => $rel];
                guardarAjuste($conn, 'app', json_encode($app));
            }
        }
    }
}
