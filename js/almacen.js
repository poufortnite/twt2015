'use strict';

/* =====================================================================
   ALMACÉN LOCAL — sustituye a la carpeta api/ (PHP + MariaDB)
   Todo se guarda en el propio navegador o móvil con IndexedDB,
   así la app funciona sin servidor y cada persona tiene sus datos.

   La función apiLocal() recibe lo mismo que recibía el PHP
   ('personajes.php', 'tweets.php', 'ajustes.php', 'subir.php')
   y devuelve las mismas respuestas, para que app.js casi no cambie.

   Almacenes (como si fueran las tablas):
     personajes  → un objeto por personaje (id automático)
     tweets      → {id, autor_id, orden, datos}
     ajustes     → {clave, valor}
     imagenes    → {nombre, blob}   (lo que antes era la carpeta uploads)
     chats       → {id, nombre, miembros, yo, mensajes, actualizado}   (mensajes directos)
   ===================================================================== */

const Almacen = (() => {
    const NOMBRE_BD = 'twt2015';
    const VERSION_BD = 2;   // 2: se añaden los chats
    const CAMPOS_TEXTO = { bio: 400, ubicacion: 100, web: 200, union_fecha: 60, n_tweets: 20, n_siguiendo: 20, n_seguidores: 20, n_favoritos: 20 };

    let bd = null;
    const urls = new Map();   // nombre de imagen → URL temporal (blob:) para usar en <img> y fondos

    /* ---------- Abrir la base de datos ---------- */

    function abrir() {
        if (bd) return Promise.resolve(bd);
        return new Promise((ok, mal) => {
            if (!('indexedDB' in window)) return mal(new Error('Este navegador no puede guardar datos. Prueba con Chrome, Edge o Safari.'));
            const pet = indexedDB.open(NOMBRE_BD, VERSION_BD);
            pet.onupgradeneeded = () => {
                const b = pet.result;
                if (!b.objectStoreNames.contains('personajes')) b.createObjectStore('personajes', { keyPath: 'id', autoIncrement: true });
                if (!b.objectStoreNames.contains('tweets')) b.createObjectStore('tweets', { keyPath: 'id', autoIncrement: true });
                if (!b.objectStoreNames.contains('ajustes')) b.createObjectStore('ajustes', { keyPath: 'clave' });
                if (!b.objectStoreNames.contains('imagenes')) b.createObjectStore('imagenes', { keyPath: 'nombre' });
                if (!b.objectStoreNames.contains('chats')) b.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
            };
            pet.onsuccess = () => {
                bd = pet.result;
                // Si se abre una versión más nueva de la app en otra pestaña, esta le deja paso
                bd.onversionchange = () => { bd.close(); bd = null; };
                ok(bd);
            };
            pet.onerror = () => mal(new Error('No se ha podido abrir el almacén de datos (¿modo incógnito?).'));
            pet.onblocked = () => mal(new Error('Cierra las otras pestañas de la app y vuelve a abrirla.'));
        });
    }

    // Convierte una petición de IndexedDB en promesa
    const promesa = pet => new Promise((ok, mal) => { pet.onsuccess = () => ok(pet.result); pet.onerror = () => mal(pet.error); });

    // Ejecuta "fn" dentro de una transacción y espera a que termine del todo
    async function transaccion(almacenes, modo, fn) {
        const b = await abrir();
        return new Promise((ok, mal) => {
            const tx = b.transaction(almacenes, modo);
            let resultado;
            Promise.resolve(fn(tx)).then(r => { resultado = r; }, e => { try { tx.abort(); } catch { /* ya cerrada */ } mal(e); });
            tx.oncomplete = () => ok(resultado);
            tx.onerror = () => mal(tx.error || new Error('Error al guardar'));
            tx.onabort = () => mal(tx.error || new Error('No se ha guardado'));
        });
    }

    const todos = nombre => transaccion([nombre], 'readonly', tx => promesa(tx.objectStore(nombre).getAll()));

    /* ---------- Utilidades (las mismas que en el PHP) ---------- */

    const cortar = (texto, max) => Array.from(String(texto ?? '')).slice(0, max).join('');

    function limpiarUsuario(u) {
        u = String(u ?? '').trim().replace(/^@+/, '').trim();
        return u === '' ? '' : '@' + u;
    }

    const limpiarColor = c => /^#[0-9a-fA-F]{6}$/.test(c) ? c.toLowerCase() : '#55acee';
    const marcado = v => v != null && v !== '' && v !== '0';
    const error = (texto) => { throw new Error(texto); };

    function nombreImagen() {
        const azar = Array.from(crypto.getRandomValues(new Uint8Array(4)), b => b.toString(16).padStart(2, '0')).join('');
        return Math.floor(Date.now() / 1000) + '_' + azar + '.jpg';
    }

    /* ---------- Imágenes ---------- */

    async function guardarImagen(blob) {
        if (!(blob instanceof Blob)) return null;
        if (!/^image\//.test(blob.type)) error('Ese archivo no es una imagen válida.');
        const nombre = nombreImagen();
        await transaccion(['imagenes'], 'readwrite', tx => promesa(tx.objectStore('imagenes').put({ nombre, blob })));
        urls.set(nombre, URL.createObjectURL(blob));
        return nombre;
    }

    function borrarImagenEn(tx, nombre) {
        if (!nombre) return;
        tx.objectStore('imagenes').delete(nombre);
        if (urls.has(nombre)) { URL.revokeObjectURL(urls.get(nombre)); urls.delete(nombre); }
    }

    function borrarImagenesTweet(tx, datos) {
        if (!datos) return;
        borrarImagenEn(tx, datos.imagen);
        (datos.respuestas || []).forEach(r => borrarImagenEn(tx, r.imagen));
    }

    // Prepara las URLs de todas las imágenes guardadas (solo las que aún no estén)
    async function cargarImagenes() {
        const lista = await todos('imagenes');
        lista.forEach(({ nombre, blob }) => { if (!urls.has(nombre)) urls.set(nombre, URL.createObjectURL(blob)); });
    }

    const urlImagen = nombre => (nombre && urls.get(nombre)) || '';

    // Nombres de las imágenes que algún personaje o tweet sigue usando
    function imagenesEnUso(personajes, tweets, chats = []) {
        const usadas = new Set();
        chats.forEach(c => (c.mensajes || []).forEach(m => { if (m.imagen) usadas.add(m.imagen); }));
        personajes.forEach(p => { if (p.foto) usadas.add(p.foto); if (p.portada) usadas.add(p.portada); });
        tweets.forEach(t => {
            if (t.datos?.imagen) usadas.add(t.datos.imagen);
            (t.datos?.respuestas || []).forEach(r => { if (r.imagen) usadas.add(r.imagen); });
        });
        return usadas;
    }

    // Al arrancar, borra las fotos que ya no usa nadie (p. ej. al "Quitar foto" de un tweet)
    async function limpiarHuerfanas() {
        const [personajes, tweets, chats] = await Promise.all([todos('personajes'), todos('tweets'), todos('chats')]);
        const usadas = imagenesEnUso(personajes, tweets, chats);
        const nombres = await transaccion(['imagenes'], 'readonly', tx => promesa(tx.objectStore('imagenes').getAllKeys()));
        const sobran = nombres.filter(n => !usadas.has(n));
        if (sobran.length) await transaccion(['imagenes'], 'readwrite', tx => sobran.forEach(n => borrarImagenEn(tx, n)));
    }

    /* ---------- personajes.php ---------- */

    async function listarPersonajes() {
        const lista = await todos('personajes');
        return lista.sort((a, b) => a.id - b.id).map(p => ({ ...p, privada: !!p.privada, verificada: !!p.verificada }));
    }

    async function personajesPOST(fd) {
        const accion = fd.get('accion') || '';
        const id = Number(fd.get('id')) || 0;

        if (accion === 'crear' || accion === 'editar') {
            const nombre = cortar(String(fd.get('nombre') ?? '').trim(), 100);
            const usuario = cortar(limpiarUsuario(fd.get('usuario')), 100);
            if (!nombre || !usuario) error('Falta el nombre o el @usuario.');

            const valores = {
                nombre, usuario,
                color: limpiarColor(fd.get('color')),
                privada: marcado(fd.get('privada')),
                verificada: marcado(fd.get('verificada'))
            };
            for (const [campo, max] of Object.entries(CAMPOS_TEXTO)) valores[campo] = cortar(String(fd.get(campo) ?? '').trim(), max);
            if (valores.union_fecha === '') valores.union_fecha = 'marzo de 2012';

            let vieja = null;
            if (accion === 'editar') {
                vieja = await transaccion(['personajes'], 'readonly', tx => promesa(tx.objectStore('personajes').get(id)));
                if (!vieja) error('Ese personaje ya no existe.');
            }

            // Las fotos se guardan primero (cada una en su transacción)
            const foto = await guardarImagen(fd.get('foto'));
            const portada = await guardarImagen(fd.get('portada'));

            const nuevoId = await transaccion(['personajes', 'imagenes'], 'readwrite', async tx => {
                const st = tx.objectStore('personajes');
                const fila = vieja ? { ...vieja, ...valores } : { foto: '', portada: '', creado: new Date().toISOString(), ...valores };
                if (foto) fila.foto = foto;
                if (portada) fila.portada = portada;
                else if (marcado(fd.get('quitar_portada'))) fila.portada = '';
                if (vieja) {
                    if (foto) borrarImagenEn(tx, vieja.foto);
                    if (vieja.portada !== fila.portada) borrarImagenEn(tx, vieja.portada);
                }
                return promesa(st.put(fila));
            });
            return { personajes: await listarPersonajes(), id: nuevoId };
        }

        if (accion === 'borrar') {
            await transaccion(['personajes', 'tweets', 'imagenes'], 'readwrite', async tx => {
                const fila = await promesa(tx.objectStore('personajes').get(id));
                if (!fila) return;
                // Sus tweets (y las fotos que llevan) se borran con él
                const st = tx.objectStore('tweets');
                const lista = await promesa(st.getAll());
                lista.filter(t => t.autor_id === id).forEach(t => {
                    borrarImagenesTweet(tx, t.datos);
                    st.delete(t.id);
                });
                tx.objectStore('personajes').delete(id);
                borrarImagenEn(tx, fila.foto);
                borrarImagenEn(tx, fila.portada);
            });
            return { personajes: await listarPersonajes() };
        }

        error('Acción desconocida.');
    }

    /* ---------- tweets.php ---------- */

    async function listarTweets() {
        const lista = await todos('tweets');
        return lista.sort((a, b) => b.orden - a.orden || b.id - a.id);
    }

    async function tweetsPOST(p) {
        const accion = p.accion || '';

        if (accion === 'crear') {
            const autor = Number(p.autor_id) || 0;
            if (autor <= 0) error('Falta el autor.');
            const tweet = await transaccion(['tweets'], 'readwrite', async tx => {
                const st = tx.objectStore('tweets');
                const lista = await promesa(st.getAll());
                const orden = lista.reduce((m, t) => Math.max(m, t.orden), 0) + 1;
                const fila = { autor_id: autor, orden, datos: p.datos || {}, creado: new Date().toISOString() };
                fila.id = await promesa(st.add(fila));
                return fila;
            });
            return { tweet };
        }

        if (accion === 'guardar') {
            if (!p.datos || typeof p.datos !== 'object') error('Datos no válidos.');
            await transaccion(['tweets'], 'readwrite', async tx => {
                const st = tx.objectStore('tweets');
                const fila = await promesa(st.get(Number(p.id)));
                if (!fila) return;   // ya estaba borrado
                fila.autor_id = Number(p.autor_id) || fila.autor_id;
                fila.datos = p.datos;
                st.put(fila);
            });
            return { ok: true };
        }

        if (accion === 'borrar') {
            await transaccion(['tweets', 'imagenes'], 'readwrite', async tx => {
                const st = tx.objectStore('tweets');
                const fila = await promesa(st.get(Number(p.id)));
                if (!fila) return;
                borrarImagenesTweet(tx, fila.datos);
                st.delete(fila.id);
            });
            return { ok: true };
        }

        if (accion === 'borrar-todos') {
            // Todos los tweets con sus respuestas y sus fotos (los personajes y los chats se quedan)
            await transaccion(['tweets', 'imagenes'], 'readwrite', async tx => {
                const st = tx.objectStore('tweets');
                const lista = await promesa(st.getAll());
                lista.forEach(t => borrarImagenesTweet(tx, t.datos));
                st.clear();
            });
            return { ok: true };
        }

        if (accion === 'ordenar') {
            await transaccion(['tweets'], 'readwrite', async tx => {
                const st = tx.objectStore('tweets');
                for (const o of p.orden || []) {
                    const fila = await promesa(st.get(Number(o.id)));
                    if (fila) { fila.orden = Number(o.orden) || 0; st.put(fila); }
                }
            });
            return { ok: true };
        }

        error('Acción desconocida.');
    }

    /* ---------- chats.php (mensajes directos) ---------- */

    async function listarChats() {
        const lista = await todos('chats');
        return lista.sort((a, b) => String(b.actualizado).localeCompare(String(a.actualizado)) || b.id - a.id);
    }

    async function chatsPOST(p) {
        const accion = p.accion || '';

        if (accion === 'crear') {
            const miembros = (p.miembros || []).map(Number).filter(n => n > 0);
            if (miembros.length < 2) error('Un chat necesita al menos dos personas.');
            const chat = await transaccion(['chats'], 'readwrite', async tx => {
                const fila = { miembros, yo: Number(p.yo) || miembros[0], mensajes: [], actualizado: new Date().toISOString() };
                fila.id = await promesa(tx.objectStore('chats').add(fila));
                return fila;
            });
            return { chat };
        }

        if (accion === 'guardar') {
            await transaccion(['chats'], 'readwrite', async tx => {
                const st = tx.objectStore('chats');
                const fila = await promesa(st.get(Number(p.id)));
                if (!fila) return;   // ya estaba borrado
                fila.miembros = (p.miembros || fila.miembros).map(Number);
                fila.yo = Number(p.yo) || fila.yo;
                if (typeof p.nombre === 'string') fila.nombre = cortar(p.nombre.trim(), 50);
                fila.mensajes = Array.isArray(p.mensajes) ? p.mensajes : fila.mensajes;
                fila.actualizado = new Date().toISOString();
                st.put(fila);
            });
            return { ok: true };
        }

        if (accion === 'borrar') {
            await transaccion(['chats', 'imagenes'], 'readwrite', async tx => {
                const st = tx.objectStore('chats');
                const fila = await promesa(st.get(Number(p.id)));
                if (!fila) return;
                (fila.mensajes || []).forEach(m => borrarImagenEn(tx, m.imagen));
                st.delete(fila.id);
            });
            return { ok: true };
        }

        error('Acción desconocida.');
    }

    /* ---------- ajustes.php ---------- */

    async function leerAjuste(clave) {
        const fila = await transaccion(['ajustes'], 'readonly', tx => promesa(tx.objectStore('ajustes').get(clave)));
        return fila ? fila.valor : null;
    }

    const guardarAjuste = (clave, valor) => transaccion(['ajustes'], 'readwrite', tx => promesa(tx.objectStore('ajustes').put({ clave, valor })));

    /* ---------- La "API": misma entrada y salida que el PHP ---------- */

    async function apiLocal(url, opciones = {}) {
        const archivo = url.split('?')[0];
        const metodo = (opciones.method || 'GET').toUpperCase();
        const cuerpo = opciones.body;
        const json = () => {
            try { return JSON.parse(cuerpo); } catch { error('Datos no válidos.'); }
        };

        if (archivo === 'personajes.php') {
            return metodo === 'GET' ? { personajes: await listarPersonajes() } : personajesPOST(cuerpo);
        }
        if (archivo === 'tweets.php') {
            return metodo === 'GET' ? { tweets: await listarTweets() } : tweetsPOST(json());
        }
        if (archivo === 'chats.php') {
            return metodo === 'GET' ? { chats: await listarChats() } : chatsPOST(json());
        }
        if (archivo === 'ajustes.php') {
            if (metodo === 'GET') return { app: await leerAjuste('app') };
            await guardarAjuste('app', json());
            return { ok: true };
        }
        if (archivo === 'subir.php') {
            const nombre = await guardarImagen(cuerpo.get('imagen'));
            if (!nombre) error('No has elegido ninguna imagen.');
            return { archivo: nombre };
        }
        error('No existe: ' + archivo);
    }

    /* ---------- Copia de seguridad (exportar / importar) ---------- */

    const blobADataURL = blob => new Promise((ok, mal) => {
        const lector = new FileReader();
        lector.onload = () => ok(lector.result);
        lector.onerror = () => mal(lector.error);
        lector.readAsDataURL(blob);
    });

    async function dataURLABlob(dataURL) {
        const [cabecera, base64] = String(dataURL).split(',');
        const tipo = (cabecera.match(/^data:([^;]+)/) || [])[1] || 'image/jpeg';
        const bin = atob(base64 || '');
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new Blob([bytes], { type: tipo });
    }

    // Todo en un único archivo .json (las fotos van dentro como texto)
    async function exportar() {
        const [personajes, tweets, app, imagenes, chats] = await Promise.all([todos('personajes'), todos('tweets'), leerAjuste('app'), todos('imagenes'), todos('chats')]);
        const usadas = imagenesEnUso(personajes, tweets, chats);
        const fotos = {};
        for (const { nombre, blob } of imagenes) {
            if (usadas.has(nombre)) fotos[nombre] = await blobADataURL(blob);
        }
        const copia = { formato: 'twt2015-copia', version: 2, fecha: new Date().toISOString(), personajes, tweets, chats, app, imagenes: fotos };
        return new Blob([JSON.stringify(copia)], { type: 'application/json' });
    }

    // Sustituye TODO lo que hay en este dispositivo por lo que trae la copia
    async function importar(archivo) {
        let copia;
        try { copia = JSON.parse(await archivo.text()); } catch { error('Ese archivo no es una copia de twt2015.'); }
        if (!copia || copia.formato !== 'twt2015-copia' || !Array.isArray(copia.personajes) || !Array.isArray(copia.tweets)) {
            error('Ese archivo no es una copia de twt2015.');
        }
        const fotos = [];
        for (const [nombre, dataURL] of Object.entries(copia.imagenes || {})) fotos.push({ nombre, blob: await dataURLABlob(dataURL) });

        // Las copias antiguas (versión 1) no traen chats: se quedan sin chats
        const chats = Array.isArray(copia.chats) ? copia.chats : [];
        await transaccion(['personajes', 'tweets', 'ajustes', 'imagenes', 'chats'], 'readwrite', tx => {
            ['personajes', 'tweets', 'imagenes', 'chats'].forEach(n => tx.objectStore(n).clear());
            tx.objectStore('ajustes').delete('app');
            copia.personajes.forEach(p => { if (Number(p.id) > 0) tx.objectStore('personajes').put({ ...p, id: Number(p.id) }); });
            copia.tweets.forEach(t => { if (Number(t.id) > 0) tx.objectStore('tweets').put({ ...t, id: Number(t.id), autor_id: Number(t.autor_id) }); });
            chats.forEach(c => { if (Number(c.id) > 0) tx.objectStore('chats').put({ ...c, id: Number(c.id), miembros: (c.miembros || []).map(Number) }); });
            fotos.forEach(f => tx.objectStore('imagenes').put(f));
            if (copia.app) tx.objectStore('ajustes').put({ clave: 'app', valor: copia.app });
        });
        urls.forEach(u => URL.revokeObjectURL(u));
        urls.clear();
    }

    // Pide al navegador que no borre los datos aunque falte espacio
    async function pedirPersistencia() {
        try {
            if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
        } catch { /* no pasa nada si no se puede */ }
    }

    return { apiLocal, urlImagen, cargarImagenes, limpiarHuerfanas, exportar, importar, pedirPersistencia };
})();
