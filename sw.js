/* =====================================================================
   SERVICE WORKER — guarda los archivos de la app en el dispositivo
   para que abra aunque no haya internet.
   Con internet siempre pide la versión nueva, así cuando subas
   cambios a GitHub les llegan solos a todos.
   (Los personajes y tweets NO van aquí: están en IndexedDB.)
   ===================================================================== */

const CACHE = 'twt2015-v13';
const ARCHIVOS = [
    './',
    'index.html',
    'css/style.css',
    'js/html-to-image.js',
    'js/almacen.js',
    'js/app.js',
    'manifest.json',
    'iconos/icono.svg',
    'iconos/icono-192.png',
    'iconos/icono-512.png',
    'iconos/apple-touch-icon.png',
    'fuentes/arimo-400.woff2',
    'fuentes/arimo-700.woff2'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Primero internet; si no hay, lo guardado.
// "no-cache": pregunta siempre a GitHub si hay versión nueva, en vez de fiarse
// de la copia que el navegador guarda unos minutos (por eso antes no se actualizaba).
self.addEventListener('fetch', e => {
    const pet = e.request;
    if (pet.method !== 'GET' || new URL(pet.url).origin !== location.origin) return;
    e.respondWith(
        fetch(pet, { cache: 'no-cache' })
            .then(resp => {
                if (resp.ok) {
                    const copia = resp.clone();
                    caches.open(CACHE).then(c => c.put(pet, copia));
                }
                return resp;
            })
            .catch(() => caches.match(pet, { ignoreSearch: true })
                .then(r => r || (pet.mode === 'navigate' ? caches.match('index.html') : Response.error())))
    );
});
