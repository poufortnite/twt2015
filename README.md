# Twitter 2015

Recreación del Twitter de 2015 para crear perfiles y tweets inventados (con respuestas, retweets, favoritos e imágenes).

Hecho con HTML, CSS y JavaScript en el navegador, y PHP + MariaDB/MySQL en el servidor.

## Requisitos

- Apache con PHP 8 (por ejemplo XAMPP)
- MariaDB 10.3 o superior (o MySQL 8)

## Instalación

1. Copia la carpeta del proyecto en la carpeta web de Apache (en XAMPP, `htdocs/twt2015`).
2. Comprueba que Apache puede escribir en la carpeta `uploads/`.
3. Configura la conexión a la base de datos:
   - Si usas XAMPP tal cual (usuario `root` sin contraseña), no tienes que hacer nada.
   - Si tu MariaDB/MySQL tiene otro usuario o contraseña, copia `api/config.example.php` como `api/config.php` y pon tus datos:

     ```php
     const DB_HOST = 'localhost';
     const DB_USER = 'tu_usuario';
     const DB_PASS = 'tu_contraseña';
     const DB_NAME = 'twt2015';
     ```

     `config.php` está en el `.gitignore`, así que tu contraseña nunca se sube a GitHub.
     El usuario necesita permiso para crear la base de datos `twt2015` (o créala tú antes y dale permisos sobre ella).

4. Abre `http://localhost/twt2015/` en el navegador.

No hace falta importar ningún `.sql`: la base de datos `twt2015` y sus tablas se crean solas la primera vez que se abre la página, y empiezan vacías.

## Estructura

```
index.html        Página principal
css/style.css     Estilos
js/app.js         Lógica de la aplicación
api/              Endpoints PHP (personajes, tweets, ajustes, subida de imágenes)
api/config.example.php  Plantilla de configuración de la base de datos
uploads/          Imágenes subidas (no se suben a Git)
```

## Empezar de cero

Para borrar todo lo creado y volver a una instalación limpia:

```sql
DROP DATABASE twt2015;
```

y vacía la carpeta `uploads/` (dejando `.gitkeep`).
