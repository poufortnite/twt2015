# twt2015

Crea perfiles, tweets y mensajes directos falsos con el estilo de Twitter en 2015, y descárgalos como imagen.

- Tweets con respuestas, fotos, "Retwitteado por" y las fotitos de quien le dio a favorito
- Mensajes directos entre tus personajes, de dos o en grupo
- Descarga de cualquier pantalla como PNG, o de todos los tweets de golpe (un .zip con una imagen por tweet)
- Guía de uso la primera vez que se abre (y luego en el botón **?** de arriba)

Es una app web instalable (PWA): no necesita servidor, ni PHP, ni base de datos.
Todo lo que creas se guarda **en tu propio móvil u ordenador** (IndexedDB), y funciona también sin internet.

## Cómo usarla

1. Abre el enlace: **https://poufortnite.github.io/twt2015/**
2. Instálala:
   - **Android / PC (Chrome o Edge):** botón **Instalar** arriba, o menú ⋮ → *Instalar app*.
   - **iPhone:** ábrela en **Safari** → botón Compartir → *Añadir a pantalla de inicio*.
3. Crea tu primer personaje y a twittear.

Tus datos no salen de tu dispositivo. En **Perfiles → Tus datos** puedes guardar una copia
(un archivo `.json`) y cargarla en otro móvil.

## Cómo está hecha

| Archivo | Qué hace |
|---|---|
| `index.html` | La página |
| `css/style.css` | Los estilos |
| `js/app.js` | Toda la app (vistas, edición, capturas) |
| `js/almacen.js` | Guarda los datos en el dispositivo con IndexedDB. Sustituye a la antigua carpeta `api/` en PHP |
| `js/html-to-image.js` | Librería para hacer las capturas PNG |
| `manifest.json` | Nombre, icono y colores de la app instalada |
| `sw.js` | Service worker: guarda los archivos para que abra sin internet |
| `iconos/` | Iconos de la app |

## Publicar cambios

Cada vez que subes cambios a la rama `main`, GitHub Pages actualiza la web en uno o dos minutos
y a quien la tenga instalada le llega sola la próxima vez que la abra con internet.

**Cada vez que subas cambios, sube el número de `CACHE` en `sw.js`** (`twt2015-v8` → `twt2015-v9`).
Así la app instalada se da cuenta de que hay versión nueva y se recarga sola al abrirla o al volver a ella.
Si añades archivos nuevos a la app, ponlos también en `ARCHIVOS` en `sw.js`.
