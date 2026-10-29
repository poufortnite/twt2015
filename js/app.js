'use strict';

/* =====================================================================
   TWITTER 2015 — perfiles y tweets falsos estilo 2015
   Páginas:  #/                 inicio (todos los perfiles)
             #/perfil/ID[/tab]  perfil (tab: respuestas | fotos)
             #/tweet/ID         un tweet con sus respuestas
   Todo se guarda solo en la base de datos.
   ===================================================================== */

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

// "plaintext-only" evita pegar texto con formato; si el navegador no lo soporta, "true"
const CE = (() => {
    const d = document.createElement('div');
    d.contentEditable = 'plaintext-only';
    return d.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true';
})();

const COLOR_DEFECTO = '#55acee';
const COLORES_2015 = ['#55acee', '#0084b4', '#3b94d9', '#2b7bb9', '#981ceb', '#e81c4f', '#f58ea8', '#fab81e', '#ff691f', '#19cf86', '#91d2fa', '#abb8c2'];

/* ---------------------------------------------------------------------
   ICONOS (todos dibujados aquí, mismo estilo)
   --------------------------------------------------------------------- */

const ICONO = (() => {
    const g = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</g></svg>`;
    // Insignia de verificado: roseta azul con un check blanco
    const pts = [];
    for (let i = 0; i < 24; i++) {
        const r = i % 2 ? 9.3 : 10.7;
        const a = Math.PI * 2 * i / 24 - Math.PI / 2;
        pts.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2));
    }
    return {
        reply: g('<path d="M9 6.5 3.8 11.5 9 16.5"/><path d="M4.3 11.5h9.2a6.2 6.2 0 0 1 6.2 6.2v.8"/>'),
        retweet: g('<path d="M5.5 11.5V8.8a2.3 2.3 0 0 1 2.3-2.3h11"/><path d="m16 3.6 2.9 2.9L16 9.4"/><path d="M18.5 12.5v2.7a2.3 2.3 0 0 1-2.3 2.3h-11"/><path d="M8 14.6 5.1 17.5 8 20.4"/>'),
        fav: g('<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'),
        favLleno: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
        more: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></g></svg>',
        seguir: g('<circle cx="9" cy="8" r="3.6"/><path d="M2.8 19.5c.6-3.6 3.1-5.6 6.2-5.6s5.6 2 6.2 5.6"/><path d="M18.5 8v6M15.5 11h6"/>', 'stroke-width="2"'),
        siguiendo: g('<circle cx="9" cy="8" r="3.6"/><path d="M2.8 19.5c.6-3.6 3.1-5.6 6.2-5.6s5.6 2 6.2 5.6"/><path d="m15.5 11 2.2 2.2 4-4.2"/>', 'stroke-width="2"'),
        pin: g('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
        enlace: g('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>'),
        calendario: g('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>'),
        camara: g('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3L9.5 4.8h5L16.2 7h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.4"/>'),
        candadoGrande: g('<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
        verificado: `<svg class="ico-verif" viewBox="0 0 24 24" aria-label="Cuenta verificada"><polygon points="${pts.join(' ')}" fill="#55acee" stroke="#55acee" stroke-width="1.6" stroke-linejoin="round"/><path d="m7.7 12.3 2.9 2.9 5.8-6.1" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        candado: '<svg class="ico-candado" viewBox="0 0 12 14" aria-label="Cuenta protegida"><path fill="currentColor" d="M10 6V4a4 4 0 0 0-8 0v2H1v8h10V6h-1zM3.5 4a2.5 2.5 0 0 1 5 0v2h-5V4z"/></svg>'
    };
})();

/* ---------------------------------------------------------------------
   DATOS
   --------------------------------------------------------------------- */

let personajes = [];   // perfiles
let tweets = [];       // [{id, autor_id, orden, datos}], ordenados de más nuevo a más viejo
let app = { miradorId: null, relaciones: {} };

function datosTweetNuevo() {
    return { texto: '', fecha: '12:18 - 6 feb. 2015', rts: '0', favs: '0', caras: [], rtPor: [], imagen: '', respuestas: [] };
}

function normalizarTweet(t) {
    t.datos = Object.assign(datosTweetNuevo(), t.datos || {});
    if (!Array.isArray(t.datos.caras)) t.datos.caras = [];
    if (!Array.isArray(t.datos.rtPor)) t.datos.rtPor = [];
    if (!Array.isArray(t.datos.respuestas)) t.datos.respuestas = [];
    t.datos.respuestas.forEach(r => {
        if (r.rts == null) r.rts = '';
        if (r.favs == null) r.favs = '';
        if (r.imagen == null) r.imagen = '';
    });
    return t;
}

function ordenarTweets() {
    tweets.sort((a, b) => b.orden - a.orden || b.id - a.id);
}

const pj = id => personajes.find(p => p.id === Number(id)) || null;
const tweetPorId = id => tweets.find(t => t.id === Number(id)) || null;
const mirador = () => pj(app.miradorId);

/* ---------------------------------------------------------------------
   UTILIDADES
   --------------------------------------------------------------------- */

function esc(t) {
    return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Texto de un tweet con las @menciones, #hashtags y enlaces en color, como en Twitter
function textoHTML(raw) {
    return esc(raw).replace(
        /(https?:\/\/[^\s<]+)|(^|[^\w&])(@\w{1,20})|(^|[^\w&])(#[\p{L}\p{N}_]+)/gu,
        (m, url, a, mencion, b, tag) => url ? `<span class="enlace">${url}</span>`
            : mencion ? `${a}<span class="enlace">${mencion}</span>`
            : `${b}<span class="enlace">${tag}</span>`
    );
}

const urlImg = nombre => nombre ? 'uploads/' + encodeURIComponent(nombre) : '';
const fondo = url => url ? `style="background-image:url('${url}')"` : '';
const fondoPj = p => fondo(p ? urlImg(p.foto) : '');

function nombreHTML(p) {
    if (!p) return '<span class="ph">Cuenta eliminada</span>';
    return `<span class="nom">${esc(p.nombre)}</span>${p.verificada ? ICONO.verificado : ''}${p.privada ? ICONO.candado : ''}`;
}

// "12:18 - 6 feb. 2015" → "6 feb. 2015" (así salía en el perfil)
function fechaCorta(fecha) {
    const i = String(fecha).indexOf(' - ');
    return i >= 0 ? fecha.slice(i + 3) : fecha;
}

const webCorta = w => String(w).replace(/^https?:\/\//, '').replace(/\/$/, '');

function nuevoId() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

let tAviso = null;
function aviso(texto, error = false) {
    const el = $('#aviso');
    el.textContent = texto;
    el.classList.toggle('error', error);
    el.hidden = false;
    clearTimeout(tAviso);
    tAviso = setTimeout(() => { el.hidden = true; }, error ? 5000 : 2200);
}

async function api(url, opciones = {}) {
    const r = await fetch('api/' + url, opciones);
    let datos;
    try {
        datos = await r.json();
    } catch {
        throw new Error('El servidor ha respondido algo raro (' + r.status + ').');
    }
    if (!r.ok || datos.error) throw new Error(datos.error || 'Error ' + r.status);
    return datos;
}

const apiJSON = (url, cuerpo) => api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });

function reducirImagen(archivo, max) {
    return new Promise((ok, mal) => {
        const url = URL.createObjectURL(archivo);
        const img = new Image();
        img.onload = () => {
            const k = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * k);
            c.height = Math.round(img.height * k);
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            c.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo procesar la imagen'))), 'image/jpeg', 0.9);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            mal(new Error('Ese archivo no es una imagen válida'));
        };
        img.src = url;
    });
}

// Abre el selector de archivos y devuelve la imagen ya reducida (o null)
function pedirImagen(max) {
    return new Promise(ok => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const f = input.files[0];
            if (!f) return ok(null);
            try {
                ok(await reducirImagen(f, max));
            } catch (e) {
                aviso(e.message, true);
                ok(null);
            }
        };
        input.click();
    });
}

async function subirImagen(blob) {
    const fd = new FormData();
    fd.append('imagen', blob, 'imagen.jpg');
    const res = await api('subir.php', { method: 'POST', body: fd });
    return res.archivo;
}

/* ---------------------------------------------------------------------
   GUARDADO AUTOMÁTICO
   --------------------------------------------------------------------- */

const temporizadores = new Map();   // id de tweet → timeout
let tApp = null;
let guardandoApp = false;

function marcarGuardado(texto, error = false) {
    const el = $('#guardado');
    el.textContent = texto;
    el.classList.toggle('error', error);
}

function hayPendientes() {
    return temporizadores.size > 0 || guardandoApp;
}

function guardarTweet(t) {
    marcarGuardado('Guardando…');
    clearTimeout(temporizadores.get(t.id));
    temporizadores.set(t.id, setTimeout(() => enviarTweet(t), 600));
}

async function enviarTweet(t) {
    clearTimeout(temporizadores.get(t.id));
    temporizadores.delete(t.id);
    try {
        await apiJSON('tweets.php', { accion: 'guardar', id: t.id, autor_id: t.autor_id, datos: t.datos });
        if (!hayPendientes()) marcarGuardado('Guardado');
    } catch (e) {
        marcarGuardado('No se ha guardado', true);
        aviso(e.message, true);
    }
}

function guardarApp() {
    guardandoApp = true;
    marcarGuardado('Guardando…');
    clearTimeout(tApp);
    tApp = setTimeout(async () => {
        try {
            await apiJSON('ajustes.php', app);
            guardandoApp = false;
            if (!hayPendientes()) marcarGuardado('Guardado');
        } catch (e) {
            guardandoApp = false;
            marcarGuardado('No se ha guardado', true);
            aviso(e.message, true);
        }
    }, 400);
}

// Al cerrar la pestaña o cambiar de app, se manda lo que quede pendiente
function guardarTodoYa() {
    for (const [id, tm] of temporizadores) {
        clearTimeout(tm);
        const t = tweetPorId(id);
        if (t) navigator.sendBeacon('api/tweets.php', new Blob([JSON.stringify({ accion: 'guardar', id: t.id, autor_id: t.autor_id, datos: t.datos })], { type: 'application/json' }));
    }
    temporizadores.clear();
    if (guardandoApp) {
        clearTimeout(tApp);
        navigator.sendBeacon('api/ajustes.php', new Blob([JSON.stringify(app)], { type: 'application/json' }));
        guardandoApp = false;
    }
}

async function cargarTodo() {
    const [p, t, a] = await Promise.all([api('personajes.php'), api('tweets.php'), api('ajustes.php')]);
    personajes = p.personajes;
    tweets = t.tweets.map(normalizarTweet);
    ordenarTweets();
    app = Object.assign({ miradorId: null, relaciones: {} }, a.app || {});
    if (!app.relaciones || Array.isArray(app.relaciones)) app.relaciones = {};
    if (app.miradorId && !pj(app.miradorId)) app.miradorId = null;
}

/* ---------------------------------------------------------------------
   SEGUIR / SIGUIENDO
   --------------------------------------------------------------------- */

// Relación entre la cuenta que mira y "objetivo": yo | siguiendo | seguir | pendiente
function relacion(objetivo) {
    const m = mirador();
    if (!m || !objetivo || m.id === objetivo.id) return 'yo';
    return app.relaciones[`${m.id}-${objetivo.id}`] || 'siguiendo';
}

function cambiarRelacion(objetivo) {
    const m = mirador();
    if (!m || !objetivo || m.id === objetivo.id) return;
    const actual = relacion(objetivo);
    const nueva = actual === 'siguiendo' ? 'seguir'
        : actual === 'seguir' ? (objetivo.privada ? 'pendiente' : 'siguiendo')
        : 'siguiendo';
    app.relaciones[`${m.id}-${objetivo.id}`] = nueva;
    guardarApp();
}

function botonSeguir(objetivo, enPerfil) {
    const rel = relacion(objetivo);
    if (rel === 'yo') {
        return enPerfil ? `<button class="bseg" data-accion="editar-perfil" data-id="${objetivo.id}">Editar perfil</button>` : '';
    }
    const txt = { siguiendo: 'Siguiendo', seguir: 'Seguir', pendiente: 'Pendiente' }[rel];
    const ico = rel === 'siguiendo' ? ICONO.siguiendo : rel === 'seguir' ? ICONO.seguir : '';
    return `<button class="bseg bseg-${rel}" data-accion="seguir" data-id="${objetivo.id}">${ico}${txt}</button>`;
}

/* ---------------------------------------------------------------------
   PIEZAS COMUNES
   --------------------------------------------------------------------- */

// Barra de iconos. "cuentas" (opcional) pone el número al lado del retweet y la estrella.
function barraAcciones({ rts = '', favs = '', retwitteado = false, favorito = false, editable = null, replyAttrs = '' } = {}) {
    const num = (campo, valor) => editable
        ? `<span class="cuenta ed" data-bind="${editable}:${campo}" data-ph="0">${esc(valor)}</span>`
        : (valor && valor !== '0' ? `<span class="cuenta">${esc(valor)}</span>` : '');
    return `
        <span class="accion a-reply" ${replyAttrs}><span class="icono">${ICONO.reply}</span></span>
        <span class="accion a-rt ${retwitteado ? 'activo' : ''}"><span class="icono">${ICONO.retweet}</span>${num('rts', rts)}</span>
        <span class="accion a-fav ${favorito ? 'activo' : ''}"><span class="icono">${favorito ? ICONO.favLleno : ICONO.fav}</span>${num('favs', favs)}</span>
        <span class="accion a-more"><span class="icono">${ICONO.more}</span></span>`;
}

// Usuario al que responde una respuesta (para el "@usuario" del principio)
function usuarioPadre(t, r) {
    if (r.parentId === 'main') return pj(t.autor_id)?.usuario || '';
    const padre = t.datos.respuestas.find(x => x.id === r.parentId);
    return padre ? pj(padre.autorId)?.usuario || '' : '';
}

function prefijoMencion(t, r) {
    const u = usuarioPadre(t, r);
    if (!u) return '';
    if (String(r.texto).trim().toLowerCase().startsWith(u.toLowerCase())) return '';
    return `<span class="enlace mencion-auto">${esc(u)}</span> `;
}

function imagenHTML(nombre, clase = '') {
    return nombre ? `<div class="t-img ${clase}"><img src="${urlImg(nombre)}" alt=""></div>` : '';
}

/* ---------------------------------------------------------------------
   PÁGINA: PERFILES (todas las cuentas)
   --------------------------------------------------------------------- */

function contarTweets(p) {
    let n = 0;
    tweets.forEach(t => {
        if (t.autor_id === p.id || t.datos.rtPor.includes(p.id)) n++;
        t.datos.respuestas.forEach(r => { if (r.autorId === p.id) n++; });
    });
    return n;
}

function vistaPerfiles() {
    document.title = 'Perfiles';
    return `
    <div class="inicio">
        <h1 class="titulo-pag">Perfiles</h1>
        <p class="pista no-captura">Toca un perfil para verlo. Arriba a la derecha eliges desde qué cuenta se mira todo.</p>
        <div class="tarjetas">
            ${personajes.map(p => `
            <a class="tarjeta" href="#/perfil/${p.id}" style="--tema:${p.color}">
                <div class="t-portada" ${fondo(urlImg(p.portada))}></div>
                <div class="t-av av" ${fondoPj(p)}></div>
                <div class="t-info">
                    <b>${nombreHTML(p)}</b>
                    <span class="handle">${esc(p.usuario)}</span>
                </div>
            </a>`).join('')}
            <button class="tarjeta tarjeta-nueva" data-accion="nuevo-personaje">
                <span class="mas">+</span>
                <span>Nuevo personaje</span>
            </button>
        </div>
    </div>`;
}

/* ---------------------------------------------------------------------
   PÁGINA: INICIO (timeline con los tweets recientes)
   --------------------------------------------------------------------- */

// Tweets de las cuentas que sigue quien mira (y los suyos), con los retweets de esas cuentas
function elementosInicio() {
    const v = mirador();
    const items = [];
    const visible = a => a && (!v || a.id === v.id || relacion(a) === 'siguiendo');
    tweets.forEach(t => {
        const a = pj(t.autor_id);
        if (!a) return;
        if (visible(a)) return items.push({ tipo: 'tweet', t, quien: null });
        if (a.privada) return;   // de una cuenta privada que no sigues no ves nada, ni retweets
        const quien = t.datos.rtPor.map(pj).find(r => r && visible(r));
        if (quien) items.push({ tipo: 'tweet', t, quien });
    });
    return items;
}

// Los #hashtags más usados en todos los tweets
function tendencias() {
    const cuenta = new Map();
    const sumar = texto => {
        const vistos = new Map();   // en minúsculas → como se escribió
        (String(texto).match(/#[\p{L}\p{N}_]+/gu) || []).forEach(h => { if (!vistos.has(h.toLowerCase())) vistos.set(h.toLowerCase(), h); });
        vistos.forEach((original, clave) => {
            const e = cuenta.get(clave) || { tag: original, n: 0 };
            e.n++;
            cuenta.set(clave, e);
        });
    };
    tweets.forEach(t => {
        sumar(t.datos.texto);
        t.datos.respuestas.forEach(r => sumar(r.texto));
    });
    return [...cuenta.values()].sort((a, b) => b.n - a.n).slice(0, 10);
}

function vistaInicio() {
    document.title = 'Twitter';
    const v = mirador();
    const items = elementosInicio();
    const tend = tendencias();
    const sugerencias = v ? personajes.filter(p => p.id !== v.id && relacion(p) === 'seguir').slice(0, 3) : [];
    const color = v ? v.color : COLOR_DEFECTO;

    const tarjeta = v ? `
        <div class="caja dash" style="--tema:${v.color}">
            <a class="dash-portada" href="#/perfil/${v.id}" ${fondo(urlImg(v.portada))}></a>
            <div class="dash-cuerpo">
                <a class="av dash-av" href="#/perfil/${v.id}" ${fondoPj(v)}></a>
                <a class="dash-nombre" href="#/perfil/${v.id}"><b>${nombreHTML(v)}</b><span class="handle">${esc(v.usuario)}</span></a>
            </div>
            <ul class="dash-stats">
                <li><span>TWEETS</span><b>${esc(v.n_tweets !== '' ? v.n_tweets : String(contarTweets(v)))}</b></li>
                <li><span>SIGUIENDO</span><b>${esc(v.n_siguiendo || '0')}</b></li>
                <li><span>SEGUIDORES</span><b>${esc(v.n_seguidores || '0')}</b></li>
            </ul>
        </div>` : `
        <div class="caja dash-vacio no-captura">
            <p>Elige desde qué cuenta miras para ver <b>su</b> inicio: los tweets de quien sigue.</p>
            <button class="btn btn-ancho" data-accion="mirador">Elegir cuenta</button>
        </div>`;

    let timeline;
    if (!personajes.length) {
        timeline = `<div class="vacio-tl">Todavía no hay nadie. <a class="enlace" href="#/perfiles">Crea tu primer personaje</a>.</div>`;
    } else if (!items.length) {
        timeline = `<div class="vacio-tl">${v ? 'Aquí saldrán los tweets de las cuentas que sigues.' : 'Todavía no hay tweets.'}</div>`;
    } else {
        timeline = items.map(it => itemTimeline(it, v, false, 0, 0)).join('');
    }

    return `
    <div class="barra-pag barra-home no-captura">
        <span class="pista-izq">${v ? `Tweets recientes de las cuentas que sigue ${esc(v.usuario)}` : 'Todos los tweets, del más nuevo al más viejo'}</span>
        <button class="tb tb-azul" data-accion="descargar">Descargar</button>
    </div>
    <div class="home capturable" style="--tema:${color}">
        <aside class="home-izq">${tarjeta}</aside>

        <section class="home-centro caja">
            <div class="componer" data-accion="componer">
                <div class="av componer-av" ${fondoPj(v)}></div>
                <div class="componer-in">¿Qué está pasando?</div>
            </div>
            <div class="timeline">${timeline}</div>
        </section>

        <aside class="home-der">
            ${sugerencias.length ? `
            <div class="caja lateral">
                <h3>A quién seguir</h3>
                ${sugerencias.map(p => `
                <div class="sug">
                    <a class="av sug-av" href="#/perfil/${p.id}" ${fondoPj(p)}></a>
                    <div class="sug-info">
                        <a href="#/perfil/${p.id}"><b>${nombreHTML(p)}</b> <span class="handle">${esc(p.usuario)}</span></a>
                        ${botonSeguir(p, false)}
                    </div>
                </div>`).join('')}
            </div>` : ''}
            ${tend.length ? `
            <div class="caja lateral">
                <h3>Tendencias</h3>
                ${tend.map(x => `<div class="tend"><span class="enlace">${esc(x.tag)}</span><span class="gris">${x.n} ${x.n === 1 ? 'Tweet' : 'Tweets'}</span></div>`).join('')}
            </div>` : ''}
        </aside>
    </div>`;
}

/* ---------------------------------------------------------------------
   PÁGINA: PERFIL
   --------------------------------------------------------------------- */

function elementosTimeline(p, pestana) {
    const items = [];
    tweets.forEach(t => {
        const propio = t.autor_id === p.id;
        // Los tweets de cuentas privadas no se pueden retwittear
        const rt = !propio && t.datos.rtPor.includes(p.id) && !pj(t.autor_id)?.privada;
        if (pestana === 'respuestas') {
            // Sus respuestas en cualquier tweet, de la más nueva a la más vieja
            [...t.datos.respuestas].reverse().forEach(r => {
                if (r.autorId === p.id) items.push({ tipo: 'resp', t, r });
            });
        }
        if (propio || rt) {
            if (pestana === 'fotos' && !t.datos.imagen) return;
            items.push({ tipo: 'tweet', t, quien: rt ? p : null });
        }
        if (pestana === 'fotos') {
            t.datos.respuestas.forEach(r => { if (r.autorId === p.id && r.imagen) items.push({ tipo: 'resp', t, r }); });
        }
    });
    return items;
}

function fotosDe(p) {
    const fotos = [];
    tweets.forEach(t => {
        if (t.autor_id === p.id && t.datos.imagen) fotos.push(t.datos.imagen);
        t.datos.respuestas.forEach(r => { if (r.autorId === p.id && r.imagen) fotos.push(r.imagen); });
    });
    return fotos;
}

function itemTimeline(item, p, conHerramientas, total, i) {
    const { t } = item;
    const ve = mirador() || p;   // quien "mira" para marcar retweets y favoritos propios (puede ser null)
    if (item.tipo === 'resp') {
        const r = item.r;
        const a = pj(r.autorId);
        return `
        <div class="ti" data-accion="abrir-tweet" data-id="${t.id}">
            <div class="ti-fila">
                <div class="av ti-av" data-accion="ir-perfil" data-id="${a?.id}" ${fondoPj(a)}></div>
                <div class="ti-cuerpo">
                    <div class="ti-cab"><b data-accion="ir-perfil" data-id="${a?.id}">${nombreHTML(a)}</b> <span class="gris">${esc(a?.usuario)} · ${esc(r.tiempo)}</span></div>
                    <div class="ti-txt">${prefijoMencion(t, r)}${textoHTML(r.texto)}</div>
                    ${imagenHTML(r.imagen)}
                    <div class="actions-bar">${barraAcciones({ rts: r.rts, favs: r.favs })}</div>
                </div>
            </div>
        </div>`;
    }
    const a = pj(t.autor_id);
    return `
        <div class="ti" data-accion="abrir-tweet" data-id="${t.id}">
            ${item.quien ? `<div class="ti-rt"><span class="icono">${ICONO.retweet}</span>Retwitteado por <span data-accion="ir-perfil" data-id="${item.quien.id}">${esc(item.quien.nombre)}</span></div>` : ''}
            <div class="ti-fila">
                <div class="av ti-av" data-accion="ir-perfil" data-id="${a?.id}" ${fondoPj(a)}></div>
                <div class="ti-cuerpo">
                    <div class="ti-cab"><b data-accion="ir-perfil" data-id="${a?.id}">${nombreHTML(a)}</b> <span class="gris">${esc(a?.usuario)} · ${esc(fechaCorta(t.datos.fecha))}</span></div>
                    <div class="ti-txt">${textoHTML(t.datos.texto) || '<span class="ph no-captura">(tweet vacío)</span>'}</div>
                    ${imagenHTML(t.datos.imagen)}
                    <div class="actions-bar">${barraAcciones({
                        rts: t.datos.rts, favs: t.datos.favs,
                        retwitteado: !!ve && t.datos.rtPor.includes(ve.id),
                        favorito: !!ve && t.datos.caras.includes(ve.id)
                    })}</div>
                </div>
                ${conHerramientas ? `
                <div class="herr no-captura">
                    <button data-accion="mover-tweet" data-id="${t.id}" data-dir="-1" title="Subir" ${i === 0 ? 'disabled' : ''}>▲</button>
                    <button data-accion="mover-tweet" data-id="${t.id}" data-dir="1" title="Bajar" ${i === total - 1 ? 'disabled' : ''}>▼</button>
                </div>` : ''}
            </div>
        </div>`;
}

function vistaPerfil(p, pestana) {
    document.title = `${p.nombre} (${p.usuario}) | Twitter`;
    const rel = relacion(p);
    const protegido = p.privada && rel !== 'yo' && rel !== 'siguiendo';
    const items = protegido ? [] : elementosTimeline(p, pestana);
    const fotos = fotosDe(p);
    const favAuto = tweets.filter(t => t.datos.caras.includes(p.id)).length;
    const n = (v, auto) => esc(v !== '' ? v : String(auto));
    const boton = botonSeguir(p, true);

    let timeline;
    if (protegido) {
        timeline = `
            <div class="protegido">
                <span class="icono">${ICONO.candadoGrande}</span>
                <h2>Los Tweets de ${esc(p.usuario)} están protegidos.</h2>
                <p>Solo los seguidores confirmados tienen acceso a los Tweets y al perfil completo de ${esc(p.usuario)}. Haz clic en el botón "Seguir" para enviar una solicitud de seguimiento.</p>
            </div>`;
    } else if (!items.length) {
        timeline = `<div class="vacio-tl">${pestana === 'fotos' ? `${esc(p.usuario)} todavía no ha publicado fotos ni vídeos.` : `${esc(p.usuario)} todavía no ha twitteado.`}</div>`;
    } else {
        timeline = items.map((it, i) => itemTimeline(it, p, pestana === 'tweets', items.length, i)).join('');
    }

    const tab = (clave, texto) => `<a href="#/perfil/${p.id}${clave === 'tweets' ? '' : '/' + clave}" class="${pestana === clave ? 'act' : ''}">${texto}</a>`;

    return `
    <div class="barra-pag no-captura">
        <a class="tb" href="#/perfiles">← Perfiles</a>
        <button class="tb" data-accion="editar-perfil" data-id="${p.id}">Editar perfil</button>
        <button class="tb" data-accion="nuevo-tweet" data-id="${p.id}">+ Tweet</button>
        <button class="tb tb-azul" data-accion="descargar">Descargar</button>
    </div>

    <div class="perfil capturable" style="--tema:${p.color}">
        <div class="portada" ${fondo(urlImg(p.portada))}></div>

        <div class="pnav">
            <div class="pnav-in">
                <div class="pnav-hueco"></div>
                <ul class="pstats">
                    <li class="${pestana !== 'fotos' ? 'act' : ''}"><span>TWEETS</span><b>${n(p.n_tweets, contarTweets(p))}</b></li>
                    <li><span>SIGUIENDO</span><b>${n(p.n_siguiendo, 0)}</b></li>
                    <li><span>SEGUIDORES</span><b>${n(p.n_seguidores, 0)}</b></li>
                    <li><span>FAVORITOS</span><b>${n(p.n_favoritos, favAuto)}</b></li>
                </ul>
                <div class="pnav-btn">${boton}</div>
            </div>
        </div>

        <div class="pcuerpo">
            <aside class="pinfo">
                <div class="pav-fila">
                    <div class="av pav" ${fondoPj(p)}></div>
                    <div class="pbtn-movil">${boton}</div>
                </div>
                <h1 class="pnombre">${nombreHTML(p)}</h1>
                <div class="handle">${esc(p.usuario)}</div>
                ${p.bio ? `<p class="pbio">${textoHTML(p.bio)}</p>` : ''}
                ${p.ubicacion ? `<div class="pdato"><span class="icono">${ICONO.pin}</span><span>${esc(p.ubicacion)}</span></div>` : ''}
                ${p.web ? `<div class="pdato"><span class="icono">${ICONO.enlace}</span><span class="enlace">${esc(webCorta(p.web))}</span></div>` : ''}
                <div class="pdato"><span class="icono">${ICONO.calendario}</span><span>Se unió en ${esc(p.union_fecha)}</span></div>
                ${fotos.length && !protegido ? `
                <div class="pfotos-tit"><span class="icono">${ICONO.camara}</span><a href="#/perfil/${p.id}/fotos">${fotos.length} ${fotos.length === 1 ? 'foto o vídeo' : 'fotos y vídeos'}</a></div>
                <div class="pfotos">${fotos.slice(0, 6).map(f => `<div ${fondo(urlImg(f))}></div>`).join('')}</div>` : ''}
            </aside>

            <section class="pcentro">
                ${protegido ? '' : `<nav class="ptabs">${tab('tweets', 'Tweets')}${tab('respuestas', 'Tweets y respuestas')}${tab('fotos', 'Fotos y vídeos')}</nav>`}
                <div class="timeline">${timeline}</div>
            </section>
        </div>
    </div>`;
}

/* ---------------------------------------------------------------------
   PÁGINA: TWEET
   --------------------------------------------------------------------- */

let tweetActual = null;

function vistaTweet(t) {
    tweetActual = t;
    const a = pj(t.autor_id);
    const d = t.datos;
    const ve = mirador() || a;
    document.title = `${a ? a.nombre : ''} en Twitter: "${d.texto.slice(0, 60)}"`;

    return `
    <div class="barra-pag no-captura">
        <a class="tb" href="#/perfil/${t.autor_id}">← ${esc(a ? a.usuario : 'Perfil')}</a>
        <button class="tb" data-accion="foto-tweet">${d.imagen ? 'Quitar foto' : '+ Foto'}</button>
        <button class="tb" data-accion="rt-por">Retwitteado por…</button>
        <button class="tb tb-rojo" data-accion="borrar-tweet">Borrar</button>
        <button class="tb tb-azul" data-accion="descargar">Descargar</button>
    </div>
    <p class="pista no-captura">Toca la foto o el nombre para cambiar el autor, y cualquier texto o número para editarlo.</p>

    <article class="tweet capturable" style="--tema:${a ? a.color : COLOR_DEFECTO}">
        <div class="main-tweet">
            <div class="u-info">
                <div class="av av-grande" data-accion="autor-tweet" ${fondoPj(a)}></div>
                <div class="u-nombres" data-accion="autor-tweet">
                    <b class="nombre">${a ? nombreHTML(a) : '<span class="ph">Toca para elegir autor</span>'}</b>
                    <span class="handle">${esc(a ? a.usuario : '@usuario')}</span>
                </div>
                ${a ? botonSeguir(a, false) : ''}
            </div>

            <div class="main-txt ed" data-bind="tweet:texto" data-multi data-ph="¿Qué está pasando?"></div>
            ${imagenHTML(d.imagen, 't-img-grande')}

            <div class="stats">
                <div class="stat">
                    <span class="stat-label">RETWEETS</span>
                    <span class="stat-num ed" data-bind="tweet:rts" data-ph="0"></span>
                </div>
                <div class="stat stat-ultima">
                    <span class="stat-label">FAVORITOS</span>
                    <span class="stat-num ed" data-bind="tweet:favs" data-ph="0"></span>
                </div>
                <div class="caras" data-accion="caras" title="Quién sale aquí">
                    ${d.caras.map(pj).filter(Boolean).map(p => `<div class="av av-cara" ${fondoPj(p)}></div>`).join('') || '<span class="caras-vacio no-captura">+ fotitos</span>'}
                </div>
            </div>

            <div class="main-date ed" data-bind="tweet:fecha" data-ph="12:18 - 6 feb. 2015"></div>

            <div class="actions-bar">${barraAcciones({
                retwitteado: d.rtPor.includes(ve?.id),
                favorito: d.caras.includes(ve?.id),
                replyAttrs: 'data-accion="responder" data-padre="main"'
            })}</div>
        </div>

        <div class="reply-box" data-accion="responder" data-padre="main">
            <div class="av av-mini" data-accion="mirador" title="Cuenta desde la que se mira" ${fondoPj(ve)}></div>
            <div class="fake-in">Responder a ${esc(a ? a.usuario : '@usuario')}</div>
        </div>

        <div class="respuestas">${d.respuestas.map((r, i) => respuestaHTML(t, r, i)).join('')}</div>
    </article>

    <button class="btn btn-verde btn-ancho no-captura" data-accion="responder" data-padre="main">+ Añadir respuesta</button>`;
}

function respuestaHTML(t, r, i) {
    const p = pj(r.autorId);
    const total = t.datos.respuestas.length;
    return `
    <div class="resp ${r.parentId === 'main' ? 'a-main' : 'a-resp'}" data-rid="${r.id}">
        <div class="hilo"></div>
        <div class="av av-resp" data-accion="autor-resp" ${fondoPj(p)}></div>
        <div class="resp-cuerpo">
            <div class="resp-cab">
                <b data-accion="autor-resp">${p ? nombreHTML(p) : '<span class="ph">¿Quién?</span>'}</b>
                <span class="gris">${esc(p ? p.usuario : '@usuario')} ·</span>
                <span class="gris ed" data-bind="resp:${r.id}:tiempo" data-ph="1h"></span>
            </div>
            <div class="resp-txt">${prefijoMencion(t, r)}<span class="ed" data-bind="resp:${r.id}:texto" data-multi data-ph="Escribe la respuesta…"></span></div>
            ${imagenHTML(r.imagen)}
            <div class="actions-bar">${barraAcciones({ rts: r.rts, favs: r.favs, editable: `resp:${r.id}`, replyAttrs: `data-accion="responder" data-padre="${r.id}" title="Responder a esta respuesta"` })}</div>
        </div>
        <div class="herr no-captura">
            <button data-accion="mover-resp" data-dir="-1" title="Subir" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button data-accion="mover-resp" data-dir="1" title="Bajar" ${i === total - 1 ? 'disabled' : ''}>▼</button>
            <button data-accion="foto-resp" title="${r.imagen ? 'Quitar foto' : 'Añadir foto'}">${r.imagen ? '⊘' : '📷'}</button>
            <button data-accion="borrar-resp" class="rojo" title="Borrar">✕</button>
        </div>
    </div>`;
}

/* ---------------------------------------------------------------------
   TEXTOS EDITABLES (se ven con colores; al tocarlos se editan)
   --------------------------------------------------------------------- */

function objetoBind(bind) {
    const partes = bind.split(':');
    const t = tweetActual;
    if (!t) return null;
    if (partes[0] === 'tweet') return { obj: t.datos, campo: partes[1], t };
    if (partes[0] === 'resp') {
        const r = t.datos.respuestas.find(x => x.id === partes[1]);
        return r ? { obj: r, campo: partes[2], t } : null;
    }
    return null;
}

function pintarEditable(el) {
    const b = objetoBind(el.dataset.bind);
    const valor = b ? b.obj[b.campo] ?? '' : '';
    el.innerHTML = el.hasAttribute('data-multi') ? textoHTML(valor) : esc(valor);
}

function empezarEdicion(el) {
    if (el.isContentEditable) return;
    const b = objetoBind(el.dataset.bind);
    if (!b) return;
    el.textContent = b.obj[b.campo] ?? '';
    el.contentEditable = CE;
    el.classList.add('editando');
    el.focus();
    const rango = document.createRange();
    rango.selectNodeContents(el);
    rango.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rango);
}

document.addEventListener('input', e => {
    const el = e.target.closest && e.target.closest('.ed.editando');
    if (!el) return;
    const b = objetoBind(el.dataset.bind);
    if (!b) return;
    const texto = el.innerText.replace(/\n$/, '');
    b.obj[b.campo] = el.hasAttribute('data-multi') ? texto : texto.trim();
    guardarTweet(b.t);
});

document.addEventListener('focusout', e => {
    const el = e.target.closest && e.target.closest('.ed.editando');
    if (!el) return;
    el.contentEditable = 'false';
    el.removeAttribute('contenteditable');
    el.classList.remove('editando');
    pintarEditable(el);
});

document.addEventListener('keydown', e => {
    const el = e.target.closest && e.target.closest('.ed.editando');
    if (el && e.key === 'Enter' && !el.hasAttribute('data-multi')) {
        e.preventDefault();
        el.blur();
    }
    if (e.key === 'Escape') {
        if (el) el.blur();
        else if (!$('#modal').hidden) cerrarModal();
    }
});

// Pegar siempre como texto plano
document.addEventListener('paste', e => {
    const el = e.target.closest && e.target.closest('.ed.editando');
    if (!el) return;
    e.preventDefault();
    const texto = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, texto);
});

/* ---------------------------------------------------------------------
   MODALES
   --------------------------------------------------------------------- */

let alCerrarModal = null;

function abrirModal(titulo, html, alCerrar = null) {
    $('#modal-titulo').textContent = titulo;
    const cuerpo = $('#modal-cuerpo');
    cuerpo.innerHTML = html;
    cuerpo.onclick = null;
    cuerpo.scrollTop = 0;
    $('#modal').hidden = false;
    alCerrarModal = alCerrar;
}

function cerrarModal() {
    $('#modal').hidden = true;
    $('#modal-cuerpo').innerHTML = '';
    const fn = alCerrarModal;
    alCerrarModal = null;
    if (fn) fn();
}

function rejilla(lista, seleccionados) {
    if (!lista.length) {
        return `<p class="vacio">No hay personajes para elegir.</p>
                <button class="btn btn-ancho" data-accion="nuevo-personaje">+ Crear personaje</button>`;
    }
    return `<div class="rejilla">${lista.map(p => `
        <button class="pj ${seleccionados.includes(p.id) ? 'sel' : ''}" data-pj="${p.id}">
            <div class="av" ${fondoPj(p)}></div>
            <b>${nombreHTML(p)}</b>
            <span>${esc(p.usuario)}</span>
        </button>`).join('')}</div>`;
}

// Elegir un solo personaje. opciones: {excluir: [ids], ninguno: 'texto del botón para "ninguno"'}
function elegirUno(titulo, actual, alElegir, opciones = {}) {
    const lista = personajes.filter(p => !(opciones.excluir || []).includes(p.id));
    abrirModal(titulo, `
        ${opciones.texto ? `<p class="destino">${opciones.texto}</p>` : ''}
        ${rejilla(lista, actual ? [actual] : [])}
        ${opciones.ninguno ? `<button class="btn btn-gris btn-ancho" data-ninguno>${opciones.ninguno}</button>` : ''}
    `);
    $('#modal-cuerpo').onclick = e => {
        const b = e.target.closest('[data-pj]');
        if (b) { cerrarModal(); return alElegir(Number(b.dataset.pj)); }
        if (e.target.closest('[data-ninguno]')) { cerrarModal(); return alElegir(null); }
    };
}

// Elegir varios personajes
function elegirVarios(titulo, actuales, max, alListo, opciones = {}) {
    const lista = personajes.filter(p => !(opciones.excluir || []).includes(p.id));
    let sel = actuales.filter(id => lista.some(p => p.id === id));
    abrirModal(titulo, `
        <p class="destino">${opciones.texto || 'Toca para marcar o desmarcar.'}</p>
        ${rejilla(lista, sel)}
        ${lista.length ? `<div class="fila-btns">
            <button class="btn btn-gris" data-ninguno>Ninguno</button>
            <button class="btn" data-listo>Listo</button>
        </div>` : ''}
    `);
    const cuerpo = $('#modal-cuerpo');
    const marcar = () => $$('[data-pj]', cuerpo).forEach(b => b.classList.toggle('sel', sel.includes(Number(b.dataset.pj))));
    cuerpo.onclick = e => {
        const b = e.target.closest('[data-pj]');
        if (b) {
            const id = Number(b.dataset.pj);
            if (sel.includes(id)) sel = sel.filter(x => x !== id);
            else if (sel.length < max) sel.push(id);
            else aviso(`Máximo ${max}`, true);
            return marcar();
        }
        if (e.target.closest('[data-ninguno]')) { sel = []; return marcar(); }
        if (e.target.closest('[data-listo]')) { cerrarModal(); alListo(sel); }
    };
}

/* ---------- Formulario de personaje ---------- */

function formPersonaje(id = null) {
    const p = id ? pj(id) : null;
    const v = (campo, def = '') => esc(p ? p[campo] ?? def : def);
    const color = p ? p.color : COLOR_DEFECTO;

    abrirModal(p ? 'Editar perfil' : 'Nuevo personaje', `
    <form id="form-pj" class="form-pj" autocomplete="off">
        <label>Portada</label>
        <div class="f-portada" id="f-portada" ${fondo(p ? urlImg(p.portada) : '')} style="--tema:${color}">
            <div class="av f-av" id="f-av" ${fondoPj(p)}></div>
        </div>
        <div class="fila-btns fila-izq f-botones">
            <button type="button" class="mini-btn" id="f-btn-foto">Cambiar foto</button>
            <button type="button" class="mini-btn" id="f-btn-portada">Cambiar portada</button>
            <button type="button" class="mini-btn rojo" id="f-btn-quitar" ${p && p.portada ? '' : 'hidden'}>Quitar portada</button>
        </div>

        <label for="f-nombre">Nombre</label>
        <input type="text" id="f-nombre" maxlength="100" value="${v('nombre')}">

        <label for="f-usuario">@usuario</label>
        <input type="text" id="f-usuario" maxlength="100" value="${v('usuario')}" placeholder="@usuario" autocapitalize="off" autocorrect="off" spellcheck="false">

        <div class="checks">
            <label class="check"><input type="checkbox" id="f-privada" ${p && p.privada ? 'checked' : ''}> ${ICONO.candado} Cuenta privada</label>
            <label class="check"><input type="checkbox" id="f-verificada" ${p && p.verificada ? 'checked' : ''}> ${ICONO.verificado} Verificada</label>
        </div>

        <label for="f-bio">Biografía <span class="contador" id="f-bio-n"></span></label>
        <textarea id="f-bio" maxlength="160" rows="3">${v('bio')}</textarea>

        <label for="f-ubicacion">Ubicación</label>
        <input type="text" id="f-ubicacion" maxlength="100" value="${v('ubicacion')}" placeholder="Seúl, Corea del Sur">

        <label for="f-web">Sitio web</label>
        <input type="text" id="f-web" maxlength="200" value="${v('web')}" placeholder="ejemplo.com" autocapitalize="off" spellcheck="false">

        <label for="f-union">Se unió en</label>
        <input type="text" id="f-union" maxlength="60" value="${v('union_fecha', 'marzo de 2012')}" placeholder="marzo de 2012">

        <label>Color del tema</label>
        <div class="colores">
            ${COLORES_2015.map(c => `<button type="button" class="color ${c === color ? 'sel' : ''}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}
            <input type="color" id="f-color" value="${color}" title="Otro color">
        </div>

        <label>Números <span class="ayuda">(vacío = se cuentan solos)</span></label>
        <div class="numeros">
            <div><span>Tweets</span><input type="text" id="f-n_tweets" maxlength="20" value="${v('n_tweets')}" placeholder="auto"></div>
            <div><span>Siguiendo</span><input type="text" id="f-n_siguiendo" maxlength="20" value="${v('n_siguiendo')}" placeholder="0"></div>
            <div><span>Seguidores</span><input type="text" id="f-n_seguidores" maxlength="20" value="${v('n_seguidores')}" placeholder="0"></div>
            <div><span>Favoritos</span><input type="text" id="f-n_favoritos" maxlength="20" value="${v('n_favoritos')}" placeholder="auto"></div>
        </div>

        <div class="fila-btns">
            ${p ? '<button type="button" class="btn btn-rojo" id="f-borrar">Borrar</button>' : ''}
            <button type="button" class="btn btn-gris" data-accion="cerrar-modal">Cancelar</button>
            <button type="submit" class="btn" id="f-guardar">${p ? 'Guardar' : 'Crear'}</button>
        </div>
    </form>`);

    let foto = null, portada = null, quitarPortada = false, colorSel = color;

    const bio = $('#f-bio');
    const contar = () => { $('#f-bio-n').textContent = `${bio.value.length}/160`; };
    bio.oninput = contar;
    contar();

    const ponerColor = c => {
        colorSel = c;
        $('#f-portada').style.setProperty('--tema', c);
        $('#f-color').value = c;
        $$('.color', $('#form-pj')).forEach(b => b.classList.toggle('sel', b.dataset.color === c));
    };
    $('#f-color').oninput = e => ponerColor(e.target.value);

    $('#modal-cuerpo').onclick = async e => {
        const c = e.target.closest('[data-color]');
        if (c) return ponerColor(c.dataset.color);
        if (e.target.id === 'f-btn-foto' || e.target.closest('#f-av')) {
            const b = await pedirImagen(400);
            if (b) { foto = b; $('#f-av').style.backgroundImage = `url("${URL.createObjectURL(b)}")`; }
            return;
        }
        if (e.target.id === 'f-btn-portada' || e.target.id === 'f-portada') {
            const b = await pedirImagen(1500);
            if (b) {
                portada = b;
                quitarPortada = false;
                $('#f-portada').style.backgroundImage = `url("${URL.createObjectURL(b)}")`;
                $('#f-btn-quitar').hidden = false;
            }
            return;
        }
        if (e.target.id === 'f-btn-quitar') {
            portada = null;
            quitarPortada = true;
            $('#f-portada').style.backgroundImage = '';
            $('#f-btn-quitar').hidden = true;
            return;
        }
        if (e.target.id === 'f-borrar') return borrarPersonaje(p);
    };

    $('#form-pj').onsubmit = async e => {
        e.preventDefault();
        const nombre = $('#f-nombre').value.trim();
        const usuario = $('#f-usuario').value.trim();
        if (!nombre || !usuario) return aviso('Pon nombre y @usuario', true);
        if (!p && !foto) return aviso('Elige una foto de perfil', true);

        const fd = new FormData();
        fd.append('accion', p ? 'editar' : 'crear');
        if (p) fd.append('id', p.id);
        fd.append('nombre', nombre);
        fd.append('usuario', usuario);
        fd.append('privada', $('#f-privada').checked ? '1' : '0');
        fd.append('verificada', $('#f-verificada').checked ? '1' : '0');
        fd.append('color', colorSel);
        ['bio', 'ubicacion', 'web', 'n_tweets', 'n_siguiendo', 'n_seguidores', 'n_favoritos'].forEach(c => fd.append(c, $('#f-' + c).value));
        fd.append('union_fecha', $('#f-union').value);
        if (foto) fd.append('foto', foto, 'foto.jpg');
        if (portada) fd.append('portada', portada, 'portada.jpg');
        if (quitarPortada) fd.append('quitar_portada', '1');

        const boton = $('#f-guardar');
        boton.disabled = true;
        try {
            const res = await api('personajes.php', { method: 'POST', body: fd });
            personajes = res.personajes;
            cerrarModal();
            aviso(p ? 'Perfil guardado' : 'Personaje creado');
            if (!p) location.hash = `#/perfil/${res.id}`;
            else pintarPagina();
        } catch (err) {
            boton.disabled = false;
            aviso(err.message, true);
        }
    };
}

async function borrarPersonaje(p) {
    const suyos = tweets.filter(t => t.autor_id === p.id).length;
    if (!confirm(`¿Borrar a ${p.nombre}?\n\nSe borrarán también ${suyos === 1 ? 'su tweet' : `sus ${suyos} tweets`}, sus respuestas en otros tweets y sus fotos.`)) return;

    // Quitarlo de los tweets de los demás
    const cambiados = [];
    tweets.forEach(t => {
        if (t.autor_id === p.id) return;
        const d = t.datos;
        const antes = JSON.stringify(d);
        d.caras = d.caras.filter(x => x !== p.id);
        d.rtPor = d.rtPor.filter(x => x !== p.id);
        d.respuestas.filter(r => r.autorId === p.id).forEach(r => quitarRespuesta(t, r.id));
        if (JSON.stringify(d) !== antes) cambiados.push(t);
    });
    try {
        await Promise.all(cambiados.map(t => apiJSON('tweets.php', { accion: 'guardar', id: t.id, autor_id: t.autor_id, datos: t.datos })));
        const fd = new FormData();
        fd.append('accion', 'borrar');
        fd.append('id', p.id);
        const res = await api('personajes.php', { method: 'POST', body: fd });
        personajes = res.personajes;
        tweets = tweets.filter(t => t.autor_id !== p.id);
        if (app.miradorId === p.id) app.miradorId = null;
        Object.keys(app.relaciones).forEach(k => { if (k.split('-').includes(String(p.id))) delete app.relaciones[k]; });
        guardarApp();
        cerrarModal();
        aviso('Personaje borrado');
        location.hash = '#/perfiles';
        pintarPagina();
    } catch (e) {
        aviso(e.message, true);
    }
}

/* ---------- Respuestas ---------- */

function quitarRespuesta(t, rid) {
    const lista = t.datos.respuestas;
    const i = lista.findIndex(r => r.id === rid);
    if (i < 0) return;
    const r = lista[i];
    // Las que respondían a esta pasan a responder a lo que respondía ella
    lista.forEach(x => { if (x.parentId === rid) x.parentId = r.parentId; });
    lista.splice(i, 1);
}

function esDescendiente(t, r, idPadre) {
    let actual = r;
    while (actual && actual.parentId !== 'main') {
        if (actual.parentId === idPadre) return true;
        actual = t.datos.respuestas.find(x => x.id === actual.parentId);
    }
    return false;
}

let ultimoQueResponde = null;

function nuevaRespuesta(t, parentId) {
    let destino;
    if (parentId === 'main') destino = pj(t.autor_id)?.usuario || 'el tweet';
    else {
        const padre = t.datos.respuestas.find(r => r.id === parentId);
        destino = pj(padre?.autorId)?.usuario || 'la respuesta';
    }
    // Por defecto responde la cuenta desde la que se mira
    let elegido = mirador()?.id || (pj(ultimoQueResponde) ? ultimoQueResponde : null);
    let imagen = null;

    abrirModal('Nueva respuesta', `
        <p class="destino">En respuesta a ${esc(destino)}</p>
        <label>¿Quién responde?</label>
        ${rejilla(personajes, elegido ? [elegido] : [])}
        ${personajes.length ? `
            <label for="nr-texto">Texto</label>
            <textarea id="nr-texto" placeholder="Escribe tu respuesta…"></textarea>
            <div class="fila-btns fila-izq">
                <button type="button" class="mini-btn" id="nr-foto">📷 Añadir foto</button>
                <span id="nr-foto-ok" class="gris"></span>
            </div>
            <label for="nr-tiempo">Hace cuánto</label>
            <input type="text" id="nr-tiempo" value="1h">
            <div class="fila-btns">
                <button class="btn btn-gris" data-accion="cerrar-modal">Cancelar</button>
                <button class="btn btn-verde" id="nr-publicar">Responder</button>
            </div>` : ''}
    `);

    const cuerpo = $('#modal-cuerpo');
    cuerpo.onclick = async e => {
        const b = e.target.closest('[data-pj]');
        if (b) {
            elegido = Number(b.dataset.pj);
            $$('.pj', cuerpo).forEach(x => x.classList.toggle('sel', x === b));
            return;
        }
        if (e.target.id === 'nr-foto') {
            imagen = await pedirImagen(1200);
            $('#nr-foto-ok').textContent = imagen ? 'Foto añadida ✓' : '';
            return;
        }
        if (e.target.id === 'nr-publicar') {
            const texto = $('#nr-texto').value.trim();
            if (!elegido) return aviso('Elige quién responde', true);
            if (!texto && !imagen) return aviso('Escribe algo', true);
            e.target.disabled = true;
            let archivo = '';
            if (imagen) {
                try { archivo = await subirImagen(imagen); }
                catch (err) { e.target.disabled = false; return aviso(err.message, true); }
            }
            const r = { id: nuevoId(), autorId: elegido, texto, tiempo: $('#nr-tiempo').value.trim() || '1h', parentId, rts: '', favs: '', imagen: archivo };
            const lista = t.datos.respuestas;
            if (parentId === 'main') lista.push(r);
            else {
                // Justo debajo de la respuesta (y de las que ya le respondían)
                let j = lista.findIndex(x => x.id === parentId) + 1;
                while (j < lista.length && esDescendiente(t, lista[j], parentId)) j++;
                lista.splice(j, 0, r);
            }
            ultimoQueResponde = elegido;
            cerrarModal();
            guardarTweet(t);
            pintarPagina();
        }
    };
}

/* ---------------------------------------------------------------------
   CAPTURA
   --------------------------------------------------------------------- */

async function descargar() {
    const objetivo = $('.capturable');
    if (!objetivo) return;
    if (typeof htmlToImage === 'undefined') return aviso('No se ha cargado la librería de capturas (¿hay internet?)', true);
    if (document.activeElement) document.activeElement.blur();

    // Se pone en tamaño PC para que la captura salga igual desde el móvil
    document.documentElement.classList.add('ancho', 'capturando');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
        const url = await htmlToImage.toPng(objetivo, {
            pixelRatio: 2,
            backgroundColor: getComputedStyle(objetivo).backgroundColor || '#ffffff',
            skipFonts: true,
            filter: n => !(n.classList && n.classList.contains('no-captura'))
        });
        const ahora = new Date();
        const dos = n => String(n).padStart(2, '0');
        const tipo = objetivo.classList.contains('perfil') ? 'perfil' : 'tweet';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tipo}_${dos(ahora.getDate())}-${dos(ahora.getMonth() + 1)}_${dos(ahora.getHours())}-${dos(ahora.getMinutes())}-${dos(ahora.getSeconds())}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (e) {
        aviso('No se pudo hacer la captura: ' + (e && e.message ? e.message : e), true);
    } finally {
        document.documentElement.classList.remove('capturando');
        actualizarAncho();
    }
}

/* ---------------------------------------------------------------------
   NAVEGACIÓN
   --------------------------------------------------------------------- */

function ruta() {
    const partes = location.hash.replace(/^#\/?/, '').split('/');
    return { pag: partes[0] || 'inicio', id: Number(partes[1]) || 0, extra: partes[2] || '' };
}

let rutaAnterior = '';

function pintarPagina() {
    const r = ruta();
    const vista = $('#vista');
    tweetActual = null;
    let html;

    if (r.pag === 'perfil' && pj(r.id)) {
        const pestana = ['respuestas', 'fotos'].includes(r.extra) ? r.extra : 'tweets';
        html = vistaPerfil(pj(r.id), pestana);
        vista.className = 'pag-perfil';
    } else if (r.pag === 'tweet' && tweetPorId(r.id)) {
        html = vistaTweet(tweetPorId(r.id));
        vista.className = 'pag-tweet';
    } else if (r.pag === 'perfiles') {
        html = vistaPerfiles();
        vista.className = 'pag-perfiles';
    } else {
        if (r.pag !== 'inicio' && location.hash) history.replaceState(null, '', '#/');
        html = vistaInicio();
        vista.className = 'pag-inicio';
    }
    const navAct = vista.className === 'pag-perfiles' ? 'perfiles' : vista.className === 'pag-inicio' ? 'inicio' : '';
    $$('.topnav a').forEach(a => a.classList.toggle('act', a.dataset.pag === navAct));
    vista.innerHTML = html;
    $$('.ed', vista).forEach(pintarEditable);
    pintarMirador();

    const clave = location.hash;
    if (clave !== rutaAnterior) window.scrollTo(0, 0);
    rutaAnterior = clave;
}

function pintarMirador() {
    const m = mirador();
    const av = $('#mirador-av');
    av.style.backgroundImage = m ? `url("${urlImg(m.foto)}")` : '';
    av.classList.toggle('sin', !m);
    $('.mirador-txt').textContent = m ? 'Viendo como' : 'Viendo como el autor';
}

function actualizarAncho() {
    document.documentElement.classList.toggle('ancho', window.innerWidth >= 760);
}

/* ---------------------------------------------------------------------
   ACCIONES (todos los clics pasan por aquí)
   --------------------------------------------------------------------- */

document.addEventListener('click', async e => {
    // Tocar un texto editable
    const ed = e.target.closest('.ed');
    if (ed && !ed.isContentEditable && !document.documentElement.classList.contains('capturando')) {
        e.preventDefault();
        return empezarEdicion(ed);
    }
    if (ed) return;

    const el = e.target.closest('[data-accion]');
    if (!el) return;
    const accion = el.dataset.accion;
    const t = tweetActual;

    switch (accion) {
        case 'cerrar-modal': return cerrarModal();
        case 'nuevo-personaje': return formPersonaje();
        case 'editar-perfil': return formPersonaje(Number(el.dataset.id));
        case 'descargar': return descargar();

        case 'ir-perfil':
            e.stopPropagation();
            if (pj(el.dataset.id)) location.hash = `#/perfil/${el.dataset.id}`;
            return;

        case 'componer': {
            const crear = async autor => {
                try {
                    const res = await apiJSON('tweets.php', { accion: 'crear', autor_id: autor, datos: datosTweetNuevo() });
                    tweets.push(normalizarTweet(res.tweet));
                    ordenarTweets();
                    location.hash = `#/tweet/${res.tweet.id}`;
                    setTimeout(() => { const txt = $('.main-txt.ed'); if (txt) empezarEdicion(txt); }, 50);
                } catch (err) { aviso(err.message, true); }
            };
            if (mirador()) return crear(mirador().id);
            return elegirUno('¿Quién twittea?', null, id => id && crear(id));
        }

        case 'abrir-tweet':
            location.hash = `#/tweet/${el.dataset.id}`;
            return;

        case 'mirador':
            e.stopPropagation();
            return elegirUno('¿Desde qué cuenta se mira?', app.miradorId, id => {
                app.miradorId = id;
                guardarApp();
                pintarPagina();
            }, {
                texto: 'Es la cuenta "con la sesión iniciada": sale en "Responder a", y decide si ves Seguir, Siguiendo o Editar perfil.',
                ninguno: 'Ninguna (ver cada cosa como su autor)'
            });

        case 'seguir':
            cambiarRelacion(pj(el.dataset.id));
            return pintarPagina();

        case 'nuevo-tweet': {
            const autor = Number(el.dataset.id);
            try {
                const res = await apiJSON('tweets.php', { accion: 'crear', autor_id: autor, datos: datosTweetNuevo() });
                tweets.push(normalizarTweet(res.tweet));
                ordenarTweets();
                location.hash = `#/tweet/${res.tweet.id}`;
                setTimeout(() => { const txt = $('.main-txt.ed'); if (txt) empezarEdicion(txt); }, 50);
            } catch (err) { aviso(err.message, true); }
            return;
        }

        case 'mover-tweet': {
            const tw = tweetPorId(el.dataset.id);
            const r = ruta();
            const lista = elementosTimeline(pj(r.id), 'tweets').map(x => x.t);
            const i = lista.indexOf(tw);
            const j = i + Number(el.dataset.dir);
            if (i < 0 || j < 0 || j >= lista.length) return;
            const otro = lista[j];
            // Intercambiar posiciones
            let [oa, ob] = [tw.orden, otro.orden];
            if (oa === ob) ob = oa + (j < i ? 1 : -1);
            tw.orden = ob;
            otro.orden = oa;
            ordenarTweets();
            pintarPagina();
            try {
                await apiJSON('tweets.php', { accion: 'ordenar', orden: [{ id: tw.id, orden: tw.orden }, { id: otro.id, orden: otro.orden }] });
            } catch (err) { aviso(err.message, true); }
            return;
        }
    }

    // ----- Acciones dentro de un tweet -----
    if (!t) return;
    const respEl = el.closest('.resp');
    const r = respEl ? t.datos.respuestas.find(x => x.id === respEl.dataset.rid) : null;

    switch (accion) {
        case 'autor-tweet':
            return elegirUno('Autor del tweet', t.autor_id, id => {
                if (!id) return;
                t.autor_id = id;
                guardarTweet(t);
                pintarPagina();
            });

        case 'caras':
            return elegirVarios('¿Quién sale en favoritos?', t.datos.caras, 9, sel => {
                t.datos.caras = sel;
                guardarTweet(t);
                pintarPagina();
            }, { texto: 'Las fotitos de quienes le han dado a favorito (máximo 9). Lo normal es no poner al autor.' });

        case 'rt-por':
            if (pj(t.autor_id)?.privada) return aviso('Los tweets de cuentas privadas no se pueden retwittear', true);
            return elegirVarios('Retwitteado por…', t.datos.rtPor, 50, sel => {
                t.datos.rtPor = sel;
                guardarTweet(t);
                pintarPagina();
                aviso(sel.length ? 'Saldrá en sus perfiles como "Retwitteado por"' : 'Ya no sale como retweet');
            }, { excluir: [t.autor_id], texto: 'Este tweet saldrá en sus perfiles con "Retwitteado por…".' });

        case 'foto-tweet':
            if (t.datos.imagen) {
                if (!confirm('¿Quitar la foto del tweet?')) return;
                t.datos.imagen = '';
            } else {
                const b = await pedirImagen(1200);
                if (!b) return;
                try { t.datos.imagen = await subirImagen(b); }
                catch (err) { return aviso(err.message, true); }
            }
            guardarTweet(t);
            return pintarPagina();

        case 'borrar-tweet': {
            if (!confirm('¿Borrar este tweet con todas sus respuestas?')) return;
            const autor = t.autor_id;
            clearTimeout(temporizadores.get(t.id));
            temporizadores.delete(t.id);
            try {
                await apiJSON('tweets.php', { accion: 'borrar', id: t.id });
                tweets = tweets.filter(x => x !== t);
                location.hash = `#/perfil/${autor}`;
            } catch (err) { aviso(err.message, true); }
            return;
        }

        case 'responder':
            return nuevaRespuesta(t, el.dataset.padre || 'main');
    }

    if (!r) return;
    const lista = t.datos.respuestas;
    const i = lista.indexOf(r);

    switch (accion) {
        case 'autor-resp':
            return elegirUno('¿Quién responde?', r.autorId, id => {
                if (!id) return;
                r.autorId = id;
                guardarTweet(t);
                pintarPagina();
            });
        case 'mover-resp': {
            const j = i + Number(el.dataset.dir);
            if (j < 0 || j >= lista.length) return;
            [lista[i], lista[j]] = [lista[j], lista[i]];
            break;
        }
        case 'foto-resp':
            if (r.imagen) {
                if (!confirm('¿Quitar la foto de esta respuesta?')) return;
                r.imagen = '';
            } else {
                const b = await pedirImagen(1200);
                if (!b) return;
                try { r.imagen = await subirImagen(b); }
                catch (err) { return aviso(err.message, true); }
            }
            break;
        case 'borrar-resp':
            if ((r.texto.trim() || r.imagen) && !confirm('¿Borrar esta respuesta?')) return;
            quitarRespuesta(t, r.id);
            break;
        default:
            return;
    }
    guardarTweet(t);
    pintarPagina();
});

$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') cerrarModal(); });

window.addEventListener('hashchange', () => {
    if (!$('#modal').hidden) cerrarModal();
    pintarPagina();
});
window.addEventListener('resize', actualizarAncho);
window.addEventListener('pagehide', guardarTodoYa);

// Al volver a la pestaña, recargar por si se ha cambiado algo desde otro dispositivo
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') return guardarTodoYa();
    if (hayPendientes() || !$('#modal').hidden || document.activeElement?.isContentEditable) return;
    try {
        await cargarTodo();
        pintarPagina();
    } catch { /* sin conexión: seguimos con lo que hay */ }
});

/* ---------------------------------------------------------------------
   ARRANQUE
   --------------------------------------------------------------------- */

(async function iniciar() {
    actualizarAncho();
    try {
        await cargarTodo();
        marcarGuardado('Guardado');
    } catch (e) {
        marcarGuardado('Sin conexión con la base de datos', true);
        aviso(e.message, true);
    }
    pintarPagina();
    if (!personajes.length) formPersonaje();
})();
