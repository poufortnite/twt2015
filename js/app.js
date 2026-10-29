'use strict';

/* =====================================================================
   TWITTER 2015 — perfiles y tweets falsos estilo 2015
   Páginas:  #/                 inicio (todos los perfiles)
             #/perfil/ID[/tab]  perfil (tab: respuestas | fotos)
             #/tweet/ID         un tweet con sus respuestas
             #/mensajes         mensajes directos (lista de chats)
             #/chat/ID          un chat
   Todo se guarda solo, en este mismo dispositivo (ver almacen.js).
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
        sobre: g('<rect x="3" y="5.5" width="18" height="13" rx="1.8"/><path d="m3.6 6.6 8.4 6.6 8.4-6.6"/>'),
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
let chats = [];        // [{id, miembros, yo, mensajes: [{id, autorId, texto, hora, imagen}]}]
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
const chatPorId = id => chats.find(c => c.id === Number(id)) || null;

function normalizarChat(c) {
    c.miembros = (Array.isArray(c.miembros) ? c.miembros : []).map(Number);
    c.mensajes = Array.isArray(c.mensajes) ? c.mensajes : [];
    c.mensajes.forEach(m => {
        if (m.texto == null) m.texto = '';
        if (m.hora == null) m.hora = '';
        if (m.imagen == null) m.imagen = '';
    });
    if (!c.miembros.includes(Number(c.yo))) c.yo = c.miembros[0] || null;
    if (typeof c.nombre !== 'string') c.nombre = '';
    return c;
}

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

// Las fotos están guardadas en el dispositivo: Almacen da una URL temporal para cada una
const urlImg = nombre => Almacen.urlImagen(nombre);
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

// Antes llamaba al PHP con fetch('api/...'); ahora lo resuelve almacen.js en el propio dispositivo
async function api(url, opciones = {}) {
    return Almacen.apiLocal(url, opciones);
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

const temporizadoresChat = new Map();   // id de chat → timeout

function hayPendientes() {
    return temporizadores.size > 0 || temporizadoresChat.size > 0 || guardandoApp;
}

const datosChat = c => ({ accion: 'guardar', id: c.id, nombre: c.nombre, miembros: c.miembros, yo: c.yo, mensajes: c.mensajes });

function guardarChat(c) {
    marcarGuardado('Guardando…');
    clearTimeout(temporizadoresChat.get(c.id));
    temporizadoresChat.set(c.id, setTimeout(async () => {
        temporizadoresChat.delete(c.id);
        try {
            await apiJSON('chats.php', datosChat(c));
            if (!hayPendientes()) marcarGuardado('Guardado');
        } catch (e) {
            marcarGuardado('No se ha guardado', true);
            aviso(e.message, true);
        }
    }, 600));
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

// Al cerrar la pestaña o cambiar de app, se guarda ya lo que quede pendiente
function guardarTodoYa() {
    for (const [id, tm] of temporizadores) {
        clearTimeout(tm);
        const t = tweetPorId(id);
        if (t) apiJSON('tweets.php', { accion: 'guardar', id: t.id, autor_id: t.autor_id, datos: t.datos }).catch(() => {});
    }
    temporizadores.clear();
    for (const [id, tm] of temporizadoresChat) {
        clearTimeout(tm);
        const c = chatPorId(id);
        if (c) apiJSON('chats.php', datosChat(c)).catch(() => {});
    }
    temporizadoresChat.clear();
    if (guardandoApp) {
        clearTimeout(tApp);
        apiJSON('ajustes.php', app).catch(() => {});
        guardandoApp = false;
    }
}

async function cargarTodo() {
    await Almacen.cargarImagenes();
    const [p, t, a, c] = await Promise.all([api('personajes.php'), api('tweets.php'), api('ajustes.php'), api('chats.php')]);
    personajes = p.personajes;
    chats = c.chats.map(normalizarChat);
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
   QUIÉN SIGUE A QUIÉN (todo desde una ventana, sin ir perfil por perfil)
   --------------------------------------------------------------------- */

// Las relaciones van en app.relaciones['quien-aquien'] = siguiendo | seguir | pendiente (por defecto todos se siguen)
function abrirSeguimientos(idInicial = null) {
    if (personajes.length < 2) return aviso('Hacen falta al menos dos personajes', true);
    let quien = pj(idInicial)?.id || mirador()?.id || personajes[0].id;
    let sentido = 'sigue';   // 'sigue': a quién sigue · 'le-siguen': quién le sigue

    // Clave de la relación según el sentido elegido
    const clave = otroId => sentido === 'sigue' ? `${quien}-${otroId}` : `${otroId}-${quien}`;
    const estado = otroId => app.relaciones[clave(otroId)] || 'siguiendo';
    const poner = (otroId, valor) => { app.relaciones[clave(otroId)] = valor; };

    const pintar = () => {
        const p = pj(quien);
        const otros = personajes.filter(x => x.id !== quien);
        const n = otros.filter(x => estado(x.id) === 'siguiendo').length;
        $('#modal-cuerpo').innerHTML = `
            <p class="destino">Elige una cuenta y marca a quién sigue. Se guarda solo.</p>
            <div class="seg-quien">${personajes.map(x => `
                <button class="seg-cuenta ${x.id === quien ? 'sel' : ''}" data-quien="${x.id}">
                    <span class="av" ${fondoPj(x)}></span>
                    <span>${esc(x.nombre)}</span>
                </button>`).join('')}
            </div>
            <div class="seg-sentido">
                <button class="${sentido === 'sigue' ? 'act' : ''}" data-sentido="sigue">A quién sigue</button>
                <button class="${sentido === 'le-siguen' ? 'act' : ''}" data-sentido="le-siguen">Quién le sigue</button>
            </div>
            <label>${sentido === 'sigue' ? `${esc(p.nombre)} sigue a…` : `Siguen a ${esc(p.nombre)}…`} <span class="ayuda">${n} de ${otros.length}</span></label>
            <div class="rejilla">${otros.map(x => {
                const e = estado(x.id);
                return `
                <button class="pj ${e === 'siguiendo' ? 'sel' : ''} ${e === 'pendiente' ? 'pend' : ''}" data-otro="${x.id}">
                    <div class="av" ${fondoPj(x)}></div>
                    <b>${nombreHTML(x)}</b>
                    <span>${e === 'pendiente' ? 'Pendiente' : esc(x.usuario)}</span>
                </button>`;
            }).join('')}</div>
            <div class="fila-btns">
                <button class="btn btn-gris" data-todos="no">Nadie</button>
                <button class="btn btn-gris" data-todos="si">Todos</button>
                <button class="btn" data-accion="cerrar-modal">Listo</button>
            </div>`;
    };

    abrirModal('Quién sigue a quién', '', () => pintarPagina());
    pintar();
    $('#modal-cuerpo').onclick = e => {
        const c = e.target.closest('[data-quien]');
        if (c) { quien = Number(c.dataset.quien); return pintar(); }
        const s = e.target.closest('[data-sentido]');
        if (s) { sentido = s.dataset.sentido; return pintar(); }
        const o = e.target.closest('[data-otro]');
        if (o) {
            const id = Number(o.dataset.otro);
            poner(id, estado(id) === 'siguiendo' ? 'seguir' : 'siguiendo');
            guardarApp();
            return pintar();
        }
        const t = e.target.closest('[data-todos]');
        if (t) {
            personajes.filter(x => x.id !== quien).forEach(x => poner(x.id, t.dataset.todos === 'si' ? 'siguiendo' : 'seguir'));
            guardarApp();
            return pintar();
        }
    };
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

// "Retwitteado por Ane", "Retwitteado por Ane y Jon", "Retwitteado por Ane y 3 más".
// Primero va la cuenta desde la que se mira (si lo ha retwitteado) y luego las que sigue.
function rtPorHTML(t) {
    if (pj(t.autor_id)?.privada) return '';
    let lista = t.datos.rtPor.map(pj).filter(Boolean);
    if (!lista.length) return '';
    const v = mirador();
    const peso = p => (v && p.id === v.id) ? 0 : (v && relacion(p) === 'siguiendo') ? 1 : 2;
    lista = lista.map((p, i) => ({ p, i })).sort((a, b) => peso(a.p) - peso(b.p) || a.i - b.i).map(x => x.p);
    const nombre = p => `<span class="rt-nom" data-accion="ir-perfil" data-id="${p.id}">${esc(p.nombre)}</span>`;
    const quien = lista.length === 1 ? nombre(lista[0])
        : lista.length === 2 ? `${nombre(lista[0])} y ${nombre(lista[1])}`
        : `${nombre(lista[0])} y ${lista.length - 1} más`;
    return `<div class="tw-rt"><span class="icono">${ICONO.retweet}</span><span>Retwitteado por ${quien}</span></div>`;
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
        ${personajes.length > 1 ? '<button class="mini-btn btn-seg no-captura" data-accion="seguimientos">👥 Quién sigue a quién</button>' : ''}
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

        <div class="caja copia no-captura">
            <h3>Tus datos</h3>
            <p>Todo se guarda solo en este dispositivo. Haz una copia de vez en cuando: te sirve si cambias de móvil o si se borran los datos del navegador.</p>
            <div class="fila-btns fila-izq">
                <button class="mini-btn" data-accion="exportar">⬇ Guardar copia</button>
                <button class="mini-btn" data-accion="importar">⬆ Cargar copia</button>
            </div>
            <p class="copia-sep">¿Quieres las imágenes de todos los tweets? Se hace una por tweet y te llegan todas juntas en un .zip.</p>
            <div class="fila-btns fila-izq">
                <button class="mini-btn" data-accion="descargar-todos">🖼 Descargar tweets</button>
            </div>
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
        <button class="tb" data-accion="descargar-todos" title="Una imagen por cada tweet, todas en un .zip">Descargar tweets</button>
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
        <button class="tb" data-accion="seguimientos" data-id="${p.id}">Seguimientos</button>
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
            ${rtPorHTML(t)}
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
   PÁGINAS: MENSAJES DIRECTOS
   (En 2015 Twitter tenía mensajes directos, y desde enero de 2015 también de grupo)
   --------------------------------------------------------------------- */

let chatActual = null;
const remitenteChat = new Map();   // id de chat → quién va a enviar el próximo mensaje
const horaChat = new Map();        // id de chat → última hora escrita

const yoDe = c => pj(c.yo) || pj(c.miembros[0]);
const otrosDe = c => c.miembros.filter(id => id !== c.yo).map(pj).filter(Boolean);

// "Ane", "Ane y Jon", "Ane, Jon y Miren"
function listaNombres(lista) {
    const n = lista.map(p => esc(p.nombre));
    return n.length <= 1 ? (n[0] || '') : n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
}

function avataresChat(c, clase) {
    const otros = otrosDe(c);
    if (otros.length <= 1) return `<div class="av ${clase}" ${fondoPj(otros[0])}></div>`;
    return `<div class="av ${clase} av-grupo">${otros.slice(0, 4).map(p => `<span ${fondoPj(p)}></span>`).join('')}</div>`;
}

function vistaMensajes() {
    document.title = 'Mensajes directos';
    const lista = chats.filter(c => c.miembros.filter(id => pj(id)).length >= 2);
    const filas = lista.map(c => {
        const otros = otrosDe(c);
        const ultimo = c.mensajes[c.mensajes.length - 1];
        const resumen = ultimo
            ? (ultimo.texto.trim() ? esc(ultimo.texto.split('\n')[0]) : (ultimo.imagen ? '📷 Foto' : ''))
            : '<span class="ph">Sin mensajes todavía</span>';
        const quien = ultimo && ultimo.autorId === c.yo ? 'Tú: ' : (ultimo && otros.length > 1 && pj(ultimo.autorId) ? esc(pj(ultimo.autorId).nombre.split(' ')[0]) + ': ' : '');
        return `
        <a class="dm-fila" href="#/chat/${c.id}">
            ${avataresChat(c, 'dm-fila-av')}
            <div class="dm-fila-info">
                <div class="dm-fila-cab">
                    <b>${otros.length === 1 ? nombreHTML(otros[0]) : (c.nombre ? esc(c.nombre) : listaNombres(otros))}</b>
                    ${otros.length === 1 ? `<span class="handle">${esc(otros[0].usuario)}</span>` : ''}
                    <span class="gris dm-fila-hora">${esc(ultimo ? ultimo.hora : '')}</span>
                </div>
                <div class="dm-fila-txt">${quien}${resumen}</div>
                <div class="dm-fila-yo">Visto como ${esc(yoDe(c)?.usuario || '')}</div>
            </div>
        </a>`;
    }).join('');

    return `
    <div class="barra-pag barra-dm no-captura">
        <span class="pista-izq">Conversaciones entre tus personajes, de dos o en grupo.</span>
        <button class="tb tb-azul" data-accion="nuevo-chat">+ Nuevo mensaje</button>
    </div>
    <div class="dm caja">
        <div class="dm-tit">
            <h2>Mensajes directos</h2>
        </div>
        ${filas || `
        <div class="vacio-tl">
            <span class="icono dm-vacio-ico">${ICONO.sobre}</span>
            <p>${personajes.length < 2 ? 'Para hacer un chat necesitas al menos dos personajes.' : 'Todavía no hay mensajes.'}</p>
            ${personajes.length < 2
                ? '<a class="enlace" href="#/perfiles">Crear personajes</a>'
                : '<button class="btn" data-accion="nuevo-chat">Empezar una conversación</button>'}
        </div>`}
    </div>`;
}

function mensajeHTML(c, m, i) {
    const lista = c.mensajes;
    const mio = m.autorId === c.yo;
    const a = pj(m.autorId);
    const grupo = c.miembros.length > 2;
    const anterior = lista[i - 1];
    const siguiente = lista[i + 1];
    const empiezaTanda = !anterior || anterior.autorId !== m.autorId;
    const acabaTanda = !siguiente || siguiente.autorId !== m.autorId;
    return `
    <div class="dm-m ${mio ? 'mio' : 'otro'} ${empiezaTanda ? 'tanda-ini' : ''} ${acabaTanda ? 'tanda-fin' : ''}" data-mid="${m.id}">
        ${mio ? '' : `<div class="dm-m-av">${acabaTanda ? `<div class="av" data-accion="ir-perfil" data-id="${a?.id}" ${fondoPj(a)}></div>` : ''}</div>`}
        <div class="dm-m-col">
            ${grupo && !mio && empiezaTanda ? `<div class="dm-quien">${a ? esc(a.nombre) : '¿Quién?'}</div>` : ''}
            <div class="dm-burbuja ${m.imagen ? 'con-foto' : ''} ${!m.texto && m.imagen ? 'solo-foto' : ''}">
                ${m.imagen ? `<img src="${urlImg(m.imagen)}" alt="">` : ''}
                <span class="ed dm-txt" data-bind="msg:${m.id}:texto" data-multi data-ph="${m.imagen ? '' : 'Mensaje'}"></span>
            </div>
            <div class="dm-hora ed" data-bind="msg:${m.id}:hora" data-ph="hora"></div>
        </div>
        <button class="dm-mas no-captura" data-accion="msg-opciones" title="Opciones">${ICONO.more}</button>
    </div>`;
}

function vistaChat(c) {
    chatActual = c;
    const yo = yoDe(c);
    const otros = otrosDe(c);
    const uno = otros.length === 1 ? otros[0] : null;
    document.title = `Mensajes directos${uno ? ' con ' + uno.nombre : ''}`;
    if (!remitenteChat.has(c.id) || !c.miembros.includes(remitenteChat.get(c.id))) remitenteChat.set(c.id, c.yo);
    const remitente = pj(remitenteChat.get(c.id));

    return `
    <div class="barra-pag no-captura">
        <a class="tb" href="#/mensajes">← Mensajes</a>
        <button class="tb" data-accion="chat-personas">Personas</button>
        <button class="tb" data-accion="chat-yo">Ver como…</button>
        <button class="tb tb-rojo" data-accion="chat-vaciar" ${c.mensajes.length ? '' : 'disabled'} title="Borra los mensajes, pero deja el chat">Vaciar</button>
        <button class="tb tb-rojo" data-accion="borrar-chat">Borrar chat</button>
        <button class="tb tb-azul" data-accion="descargar">Descargar</button>
    </div>
    <p class="pista no-captura">Tus mensajes (los de ${esc(yo?.usuario || '')}) salen a la derecha, en color. Toca un mensaje para cambiar el texto; con ⋯ le pones hora o foto, lo mueves o lo borras.${uno ? '' : ' Toca el título para ponerle nombre al grupo.'}</p>

    <article class="dm-chat capturable" style="--tema:${yo ? yo.color : COLOR_DEFECTO}">
        <div class="dm-chat-cab">
            <span class="dm-volver">‹</span>
            ${avataresChat(c, 'dm-cab-av')}
            <div class="dm-cab-nombres">
                ${uno
                    ? `<b>${nombreHTML(uno)}</b><span class="handle">${esc(uno.usuario)}</span>`
                    : `<b class="ed dm-grupo-nom" data-bind="chat:nombre" data-ph="${listaNombres(otros)}" title="Toca para ponerle nombre al grupo"></b><span class="handle">${c.miembros.length} personas</span>`}
            </div>
        </div>

        <div class="dm-msgs">
            ${c.mensajes.length ? c.mensajes.map((m, i) => mensajeHTML(c, m, i)).join('') : '<div class="dm-sin no-captura">Escribe el primer mensaje abajo ↓</div>'}
        </div>

        <div class="dm-pie">
            <div class="dm-pie-falso">Escribe un mensaje</div>
            <div class="dm-escribir no-captura">
                <div class="dm-envia-caja">
                    <button class="dm-envia" data-accion="chat-remitente-menu" title="Elegir quién lo envía" aria-haspopup="listbox">
                        <span class="av" ${fondoPj(remitente)}></span>
                        <span class="dm-envia-txt"><small>Lo envía</small><b>${remitente ? esc(remitente.nombre) : '¿Quién?'}</b></span>
                        <span class="dm-envia-flecha">▾</span>
                    </button>
                    <div class="dm-menu" role="listbox" hidden>
                        ${c.miembros.map(pj).filter(Boolean).map(p => `
                        <button class="dm-menu-op ${p.id === remitente?.id ? 'sel' : ''}" data-accion="chat-remitente" data-id="${p.id}" role="option">
                            <span class="av" ${fondoPj(p)}></span>
                            <span class="dm-menu-txt"><b>${nombreHTML(p)}</b><span class="handle">${esc(p.usuario)}${p.id === c.yo ? ' · tú' : ''}</span></span>
                        </button>`).join('')}
                    </div>
                </div>
                <textarea id="dm-texto" rows="2" placeholder="Escribe un mensaje"></textarea>
                <div class="dm-escribir-fila">
                    <button class="mini-btn" data-accion="chat-foto" id="dm-btn-foto">${fotoPendienteChat?.chatId === c.id ? '📷 Foto ✓' : '📷 Foto'}</button>
                    <button class="mini-btn dm-auto ${horaAuto() ? 'act' : ''}" data-accion="chat-hora-auto" title="Poner la hora de ahora a cada mensaje">🕐 Auto</button>
                    <input type="text" id="dm-hora" ${horaAuto() ? `disabled placeholder="Hora automática"` : `placeholder="Hora (opcional)" value="${esc(horaChat.get(c.id) || '')}"`}>
                    <button class="btn dm-enviar" data-accion="chat-enviar">Enviar</button>
                </div>
            </div>
        </div>
    </article>`;
}

let fotoPendienteChat = null;   // foto elegida para el próximo mensaje

// Hora automática: cada mensaje lleva la hora a la que se envía (se puede quitar con el botón "Auto")
const horaAuto = () => app.horaAuto !== false;
const horaAhora = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };

/* ---------------------------------------------------------------------
   TEXTOS EDITABLES (se ven con colores; al tocarlos se editan)
   --------------------------------------------------------------------- */

function objetoBind(bind) {
    const partes = bind.split(':');
    if (partes[0] === 'chat') {
        return chatActual ? { obj: chatActual, campo: partes[1], c: chatActual } : null;
    }
    if (partes[0] === 'msg') {
        const c = chatActual;
        const m = c && c.mensajes.find(x => x.id === partes[1]);
        return m ? { obj: m, campo: partes[2], c } : null;
    }
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
    if (b.c) guardarChat(b.c);
    else guardarTweet(b.t);
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
    if (!confirm(`¿Borrar a ${p.nombre}?\n\nSe borrarán también ${suyos === 1 ? 'su tweet' : `sus ${suyos} tweets`}, sus respuestas en otros tweets, sus mensajes directos y sus fotos.`)) return;

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
    // Y de los chats: se va del chat con sus mensajes; si el chat se queda con una sola persona, se borra
    const chatsCambiados = [], chatsBorrados = [];
    chats.forEach(c => {
        if (!c.miembros.includes(p.id) && !c.mensajes.some(m => m.autorId === p.id)) return;
        c.miembros = c.miembros.filter(x => x !== p.id);
        c.mensajes = c.mensajes.filter(m => m.autorId !== p.id);
        if (c.yo === p.id) c.yo = c.miembros[0] || null;
        (c.miembros.length < 2 ? chatsBorrados : chatsCambiados).push(c);
    });
    try {
        await Promise.all(cambiados.map(t => apiJSON('tweets.php', { accion: 'guardar', id: t.id, autor_id: t.autor_id, datos: t.datos })));
        await Promise.all(chatsCambiados.map(c => apiJSON('chats.php', datosChat(c))));
        await Promise.all(chatsBorrados.map(c => apiJSON('chats.php', { accion: 'borrar', id: c.id })));
        chats = chats.filter(c => !chatsBorrados.includes(c));
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


/* ---------- Acciones de los mensajes directos ---------- */

async function nuevoChat() {
    if (personajes.length < 2) {
        aviso('Para un chat hacen falta al menos dos personajes', true);
        location.hash = '#/perfiles';
        return;
    }
    const v = mirador();
    elegirVarios('Nuevo mensaje', v ? [v.id] : [], 20, async sel => {
        if (sel.length < 2) return aviso('Elige al menos dos personas', true);
        const yo = v && sel.includes(v.id) ? v.id : sel[0];
        try {
            const res = await apiJSON('chats.php', { accion: 'crear', miembros: sel, yo });
            chats.unshift(normalizarChat(res.chat));
            location.hash = `#/chat/${res.chat.id}`;
        } catch (e) { aviso(e.message, true); }
    }, { texto: '¿Quién está en la conversación? Dos personas, o hasta 20 para un mensaje de grupo.' });
}

function pintarRemitente(c) {
    const p = pj(remitenteChat.get(c.id));
    const boton = $('.dm-envia');
    if (!boton) return;
    $('.av', boton).style.backgroundImage = p ? `url("${urlImg(p.foto)}")` : '';
    $('b', boton).textContent = p ? p.nombre : '¿Quién?';
    $$('.dm-menu-op').forEach(o => o.classList.toggle('sel', Number(o.dataset.id) === p?.id));
}

function cerrarMenuRemitente() {
    const menu = $('.dm-menu');
    if (menu) menu.hidden = true;
}

// Al tocar fuera del desplegable, se cierra
document.addEventListener('click', e => {
    if (!e.target.closest('.dm-envia-caja')) cerrarMenuRemitente();
}, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenuRemitente(); });

async function enviarMensaje(c) {
    const caja = $('#dm-texto');
    const texto = caja.value.replace(/\s+$/, '');
    const foto = fotoPendienteChat?.chatId === c.id ? fotoPendienteChat.blob : null;
    if (!texto.trim() && !foto) { caja.focus(); return aviso('Escribe algo', true); }
    let imagen = '';
    if (foto) {
        try { imagen = await subirImagen(foto); }
        catch (e) { return aviso(e.message, true); }
    }
    let hora;
    if (horaAuto()) hora = horaAhora();
    else {
        hora = $('#dm-hora').value.trim();
        horaChat.set(c.id, hora);
    }
    c.mensajes.push({ id: nuevoId(), autorId: remitenteChat.get(c.id), texto: texto.trim() ? texto : '', hora, imagen });
    fotoPendienteChat = null;
    guardarChat(c);
    pintarPagina();
    window.scrollTo(0, document.body.scrollHeight);
    // En el ordenador se sigue escribiendo directamente; en el móvil no, para no tapar la pantalla con el teclado
    if (!matchMedia('(pointer: coarse)').matches) $('#dm-texto')?.focus();
}

function opcionesMensaje(c, m) {
    const i = c.mensajes.indexOf(m);
    const total = c.mensajes.length;
    abrirModal('Mensaje', `
        <div class="opciones">
            <button data-op="autor">👤 Cambiar quién lo envía</button>
            <button data-op="hora">🕐 ${m.hora ? 'Cambiar la hora' : 'Poner la hora'}</button>
            <button data-op="foto">${m.imagen ? '⊘ Quitar la foto' : '📷 Añadir foto'}</button>
            <button data-op="subir" ${i === 0 ? 'disabled' : ''}>▲ Subir</button>
            <button data-op="bajar" ${i === total - 1 ? 'disabled' : ''}>▼ Bajar</button>
            <button data-op="borrar" class="rojo">✕ Borrar mensaje</button>
        </div>`);
    $('#modal-cuerpo').onclick = async e => {
        const b = e.target.closest('[data-op]');
        if (!b || b.disabled) return;
        const op = b.dataset.op;
        if (op === 'hora') {
            cerrarModal();
            const ed = $(`.dm-m[data-mid="${m.id}"] .dm-hora`);
            if (ed) { ed.classList.add('editando'); empezarEdicion(ed); }
            return;
        }
        if (op === 'autor') {
            return elegirUno('¿Quién lo envía?', m.autorId, id => {
                if (!id) return;
                m.autorId = id;
                guardarChat(c);
                pintarPagina();
            }, { excluir: personajes.filter(p => !c.miembros.includes(p.id)).map(p => p.id) });
        }
        if (op === 'foto') {
            if (m.imagen) {
                m.imagen = '';
            } else {
                const blob = await pedirImagen(1200);
                if (!blob) return;
                try { m.imagen = await subirImagen(blob); }
                catch (err) { return aviso(err.message, true); }
            }
        }
        if (op === 'subir' || op === 'bajar') {
            const j = i + (op === 'subir' ? -1 : 1);
            if (j < 0 || j >= total) return;
            [c.mensajes[i], c.mensajes[j]] = [c.mensajes[j], c.mensajes[i]];
        }
        if (op === 'borrar') {
            if ((m.texto.trim() || m.imagen) && !confirm('¿Borrar este mensaje?')) return;
            c.mensajes.splice(i, 1);
        }
        cerrarModal();
        guardarChat(c);
        pintarPagina();
    };
}

async function accionChat(accion, el, c) {
    switch (accion) {
        case 'chat-remitente-menu': {
            const menu = $('.dm-menu');
            menu.hidden = !menu.hidden;
            if (!menu.hidden) $('.dm-menu-op.sel', menu)?.scrollIntoView({ block: 'nearest' });
            return;
        }
        case 'chat-remitente':
            remitenteChat.set(c.id, Number(el.dataset.id));
            pintarRemitente(c);
            cerrarMenuRemitente();
            if (!matchMedia('(pointer: coarse)').matches) $('#dm-texto')?.focus();
            return;
        case 'chat-foto': {
            if (fotoPendienteChat?.chatId === c.id) {
                fotoPendienteChat = null;
            } else {
                const blob = await pedirImagen(1200);
                if (!blob) return;
                fotoPendienteChat = { chatId: c.id, blob };
            }
            $('#dm-btn-foto').textContent = fotoPendienteChat ? '📷 Foto ✓' : '📷 Foto';
            return;
        }
        case 'chat-enviar':
            return enviarMensaje(c);
        case 'chat-vaciar': {
            const n = c.mensajes.length;
            if (!n) return;
            if (!confirm(`¿Borrar ${n === 1 ? 'el mensaje' : `los ${n} mensajes`} de este chat?\n\nEl chat se queda, con su gente y su nombre.`)) return;
            c.mensajes = [];
            guardarChat(c);
            pintarPagina();
            return aviso('Chat vaciado');
        }
        case 'chat-hora-auto': {
            app.horaAuto = !horaAuto();
            guardarApp();
            const input = $('#dm-hora');
            el.classList.toggle('act', horaAuto());
            input.disabled = horaAuto();
            input.placeholder = horaAuto() ? 'Hora automática' : 'Hora (opcional)';
            input.value = horaAuto() ? '' : (horaChat.get(c.id) || '');
            if (!horaAuto()) input.focus();
            return aviso(horaAuto() ? 'Cada mensaje llevará la hora de ahora' : 'Ahora la hora la escribes tú');
        }
        case 'msg-opciones': {
            const m = c.mensajes.find(x => x.id === el.closest('.dm-m')?.dataset.mid);
            return m && opcionesMensaje(c, m);
        }
        case 'chat-personas':
            return elegirVarios('Personas en el chat', c.miembros, 20, sel => {
                if (sel.length < 2) return aviso('Un chat necesita al menos dos personas', true);
                c.miembros = sel;
                if (!sel.includes(c.yo)) c.yo = sel[0];
                guardarChat(c);
                pintarPagina();
            }, { texto: 'Dos personas, o hasta 20 para un grupo. Los mensajes de quien quites se quedan.' });
        case 'chat-yo':
            return elegirUno('¿Quién eres tú en este chat?', c.yo, id => {
                if (!id) return;
                c.yo = id;
                remitenteChat.set(c.id, id);
                guardarChat(c);
                pintarPagina();
            }, {
                excluir: personajes.filter(p => !c.miembros.includes(p.id)).map(p => p.id),
                texto: 'Es la cuenta con la sesión iniciada: sus mensajes salen a la derecha y en su color.'
            });
        case 'borrar-chat': {
            if (!confirm('¿Borrar este chat con todos sus mensajes?')) return;
            clearTimeout(temporizadoresChat.get(c.id));
            temporizadoresChat.delete(c.id);
            try {
                await apiJSON('chats.php', { accion: 'borrar', id: c.id });
                chats = chats.filter(x => x !== c);
                location.hash = '#/mensajes';
            } catch (e) { aviso(e.message, true); }
            return;
        }
    }
}

// Enter envía el mensaje en el ordenador (Mayús+Enter hace salto de línea)
document.addEventListener('keydown', e => {
    if (e.target.id !== 'dm-texto' || e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    if (matchMedia('(pointer: coarse)').matches || !chatActual) return;
    e.preventDefault();
    enviarMensaje(chatActual);
});

/* ---------------------------------------------------------------------
   CAPTURA
   --------------------------------------------------------------------- */

// Hace la imagen PNG de un elemento (siempre en tamaño PC, aunque sea desde el móvil)
async function capturar(objetivo) {
    // Espera a que estén cargadas las fotos de dentro
    await Promise.all($$('img', objetivo).map(img => (img.decode ? img.decode() : Promise.resolve()).catch(() => {})));
    return htmlToImage.toBlob(objetivo, {
        // En pantallas anchas el margen que centra la página se copiaba a la imagen
        // y lo dejaba todo desplazado (o en blanco): en la copia se quita
        width: objetivo.offsetWidth,
        height: objetivo.offsetHeight,
        style: { margin: '0' },
        pixelRatio: 2,
        backgroundColor: getComputedStyle(objetivo).backgroundColor || '#ffffff',
        skipFonts: true,
        filter: n => !(n.classList && n.classList.contains('no-captura'))
    });
}

const dos = n => String(n).padStart(2, '0');

async function prepararCaptura() {
    if (document.activeElement) document.activeElement.blur();
    document.documentElement.classList.add('ancho', 'capturando');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}

function terminarCaptura() {
    document.documentElement.classList.remove('capturando');
    actualizarAncho();
}

async function descargar() {
    const objetivo = $('.capturable');
    if (!objetivo) return;
    if (typeof htmlToImage === 'undefined') return aviso('No se ha cargado la librería de capturas (¿hay internet?)', true);
    await prepararCaptura();
    try {
        const blob = await capturar(objetivo);
        const ahora = new Date();
        const tipo = objetivo.classList.contains('perfil') ? 'perfil'
            : objetivo.classList.contains('home') ? 'inicio'
            : objetivo.classList.contains('dm-chat') ? 'chat' : 'tweet';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tipo}_${dos(ahora.getDate())}-${dos(ahora.getMonth() + 1)}_${dos(ahora.getHours())}-${dos(ahora.getMinutes())}-${dos(ahora.getSeconds())}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
        aviso('No se pudo hacer la captura: ' + (e && e.message ? e.message : e), true);
    } finally {
        terminarCaptura();
    }
}

/* ---------- Descargar todos los tweets (uno por imagen, en un .zip) ---------- */

// ZIP sin comprimir (los PNG ya van comprimidos), hecho aquí para no depender de nada de fuera
const CRC_TABLA = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLA[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

function crearZip(archivos) {   // [{nombre, datos: Uint8Array}]
    const ahora = new Date();
    const hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
    const fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();
    const partes = [], central = [];
    let posicion = 0;
    for (const { nombre, datos } of archivos) {
        const n = new TextEncoder().encode(nombre);
        const crc = crc32(datos);
        const cab = new DataView(new ArrayBuffer(30));
        [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, hora, 2], [12, fecha, 2],
         [14, crc, 4], [18, datos.length, 4], [22, datos.length, 4], [26, n.length, 2], [28, 0, 2]]
            .forEach(([o, v, l]) => l === 4 ? cab.setUint32(o, v, true) : cab.setUint16(o, v, true));
        const cen = new DataView(new ArrayBuffer(46));
        [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, hora, 2], [14, fecha, 2],
         [16, crc, 4], [20, datos.length, 4], [24, datos.length, 4], [28, n.length, 2], [30, 0, 2], [32, 0, 2],
         [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, posicion, 4]]
            .forEach(([o, v, l]) => l === 4 ? cen.setUint32(o, v, true) : cen.setUint16(o, v, true));
        partes.push(cab, n, datos);
        central.push(cen, n);
        posicion += 30 + n.length + datos.length;
    }
    const tamCentral = central.reduce((s, x) => s + x.byteLength, 0);
    const fin = new DataView(new ArrayBuffer(22));
    [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, archivos.length, 2], [10, archivos.length, 2],
     [12, tamCentral, 4], [16, posicion, 4], [20, 0, 2]]
        .forEach(([o, v, l]) => l === 4 ? fin.setUint32(o, v, true) : fin.setUint16(o, v, true));
    return new Blob([...partes, ...central, fin], { type: 'application/zip' });
}

function progreso(texto) {
    let el = $('#progreso');
    if (!texto) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'progreso';
        el.className = 'progreso';
        el.innerHTML = '<div class="progreso-caja"><div class="progreso-rueda"></div><p></p></div>';
        document.body.appendChild(el);
    }
    $('p', el).textContent = texto;
}

let descargandoTodos = false;

// La app se apunta qué tweets ya se han descargado (y cómo estaban), para poder bajar solo los nuevos.
// app.descargados = { idTweet: huella }; la huella cambia si se edita el tweet, sus respuestas o el autor.
function huellaTweet(t) {
    const txt = JSON.stringify([t.autor_id, t.datos, (t.datos.respuestas || []).map(r => pj(r.autorId)?.usuario), pj(t.autor_id)?.usuario]);
    let h = 5381;
    for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}

// Todos los tweets del más viejo al más nuevo (así el 001 es el primero que se hizo)
const tweetsEnOrden = () => tweets.filter(t => pj(t.autor_id)).sort((a, b) => a.orden - b.orden || a.id - b.id);

function descargarTodos() {
    if (descargandoTodos) return;
    const todosT = tweetsEnOrden();
    if (!todosT.length) return aviso('Todavía no hay tweets', true);
    const hechos = app.descargados && typeof app.descargados === 'object' ? app.descargados : {};
    const nuevos = todosT.filter(t => !hechos[t.id]);
    const cambiados = todosT.filter(t => hechos[t.id] && hechos[t.id] !== huellaTweet(t));
    const yaHay = Object.keys(hechos).length > 0;

    const opcion = (clave, titulo, texto, n) => `
        <button class="op-desc" data-op="${clave}" ${n ? '' : 'disabled'}>
            <b>${titulo} <span class="op-n">${n}</span></b>
            <span>${texto}</span>
        </button>`;
    abrirModal('Descargar tweets', `
        <p class="destino">Cada tweet sale en su propia imagen, y te llegan todas juntas en un .zip.</p>
        <div class="opciones-desc">
            ${yaHay ? opcion('nuevos', 'Solo los nuevos', 'Los que has hecho desde la última vez que descargaste.', nuevos.length) : ''}
            ${yaHay ? opcion('cambiados', 'Nuevos y cambiados', 'También los que has editado o tienen respuestas nuevas.', nuevos.length + cambiados.length) : ''}
            ${opcion('todos', 'Todos', 'Todos los tweets otra vez, desde el primero.', todosT.length)}
        </div>
        ${yaHay && !nuevos.length && !cambiados.length ? '<p class="gris">No hay nada nuevo desde la última descarga.</p>' : ''}
        <button class="mini-btn op-marcar" data-op="marcar">${yaHay ? 'Marcar todos como ya descargados' : 'Ya los tengo: marcarlos como descargados sin bajarlos'}</button>`);
    $('#modal-cuerpo').onclick = e => {
        const b = e.target.closest('[data-op]');
        if (!b || b.disabled) return;
        const op = b.dataset.op;
        if (op === 'marcar') {
            apuntarDescargados(todosT);
            cerrarModal();
            return aviso('Hecho: la próxima vez solo saldrán los nuevos');
        }
        cerrarModal();
        const lista = op === 'nuevos' ? nuevos : op === 'cambiados' ? todosT.filter(t => nuevos.includes(t) || cambiados.includes(t)) : todosT;
        hacerZipTweets(lista, todosT, op);
    };
}

function apuntarDescargados(lista) {
    if (!app.descargados || typeof app.descargados !== 'object') app.descargados = {};
    lista.forEach(t => { app.descargados[t.id] = huellaTweet(t); });
    guardarApp();
}

async function hacerZipTweets(lista, todosT, tipo) {
    if (typeof htmlToImage === 'undefined') return aviso('No se ha cargado la librería de capturas', true);
    descargandoTodos = true;
    guardarTodoYa();
    const vista = $('#vista');
    const archivos = [];
    await prepararCaptura();
    try {
        for (let i = 0; i < lista.length; i++) {
            const t = lista[i];
            progreso(`Haciendo las imágenes… ${i + 1} de ${lista.length}`);
            vista.className = 'pag-tweet';
            vista.innerHTML = vistaTweet(t);
            $$('.ed', vista).forEach(pintarEditable);
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            const blob = await capturar($('.capturable', vista));
            const usuario = String(pj(t.autor_id).usuario).replace(/[^\p{L}\p{N}_-]/gu, '') || 'tweet';
            // El número es su puesto entre TODOS los tweets, así los nuevos siguen la numeración (052, 053…)
            const num = todosT.indexOf(t) + 1;
            archivos.push({ nombre: `tweet_${String(num).padStart(3, '0')}_${usuario}.png`, datos: new Uint8Array(await blob.arrayBuffer()) });
        }
        progreso('Preparando el archivo…');
        const hoy = new Date();
        const zip = crearZip(archivos);
        terminarCaptura();
        progreso('');
        pintarPagina();
        const sufijo = tipo === 'todos' ? '' : '_nuevos';
        if (await entregarArchivo(zip, `twt2015-tweets${sufijo}_${hoy.getFullYear()}-${dos(hoy.getMonth() + 1)}-${dos(hoy.getDate())}_${dos(hoy.getHours())}${dos(hoy.getMinutes())}.zip`)) {
            apuntarDescargados(lista);
            aviso(`${archivos.length} ${archivos.length === 1 ? 'tweet descargado' : 'tweets descargados'}`);
        }
    } catch (e) {
        aviso('No se pudieron hacer las imágenes: ' + (e && e.message ? e.message : e), true);
    } finally {
        descargandoTodos = false;
        terminarCaptura();
        progreso('');
        pintarPagina();
    }
}

/* ---------------------------------------------------------------------
   COPIA DE SEGURIDAD
   --------------------------------------------------------------------- */

// En el móvil se abre el menú de compartir (Archivos, Drive, WhatsApp…); en el PC se descarga
async function entregarArchivo(blob, nombre) {
    const archivo = new File([blob], nombre, { type: blob.type });
    const movil = matchMedia('(pointer: coarse)').matches;
    if (movil && navigator.canShare && navigator.canShare({ files: [archivo] })) {
        try {
            await navigator.share({ files: [archivo], title: nombre });
            return true;
        } catch (e) {
            if (e && e.name === 'AbortError') return false;
        }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return true;
}

async function exportarCopia() {
    guardarTodoYa();
    try {
        const blob = await Almacen.exportar();
        const hoy = new Date();
        const nombre = `twt2015-copia_${hoy.getFullYear()}-${dos(hoy.getMonth() + 1)}-${dos(hoy.getDate())}.json`;
        if (await entregarArchivo(blob, nombre)) aviso('Copia lista');
    } catch (e) {
        aviso('No se pudo hacer la copia: ' + e.message, true);
    }
}

function importarCopia() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
        const f = input.files[0];
        if (!f) return;
        if (personajes.length && !confirm('Se va a sustituir TODO lo que hay ahora en este dispositivo por lo que trae la copia.\n\n¿Seguro?')) return;
        try {
            await Almacen.importar(f);
            await cargarTodo();
            if (!app.tutorialVisto) { app.tutorialVisto = true; guardarApp(); }   // quien carga una copia ya conoce la app
            aviso('Copia cargada');
            location.hash = '#/perfiles';
            pintarPagina();
        } catch (e) {
            aviso(e.message, true);
        }
    };
    input.click();
}

/* ---------------------------------------------------------------------
   INSTALAR COMO APP
   --------------------------------------------------------------------- */

let avisoInstalar = null;   // lo que da Chrome/Edge para enseñar su ventana de "Instalar"

const yaInstalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function prepararInstalacion() {
    // Guarda los archivos de la app para que abra aunque no haya internet
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        const yaHabiaVersion = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
            // Al volver a la app (aunque estuviera en segundo plano), mira si hay versión nueva
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') reg.update().catch(() => {});
            });
        }).catch(() => {});
        // Cuando llega una versión nueva, se recarga sola (cuando no estás escribiendo nada)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!yaHabiaVersion) return;   // primera instalación: no hace falta recargar
            const recargar = () => {
                if (hayPendientes() || !$('#modal').hidden || document.activeElement?.isContentEditable || descargandoTodos) {
                    return setTimeout(recargar, 3000);
                }
                guardarTodoYa();
                location.reload();
            };
            recargar();
        });
    }
    // El botón "Instalar" está siempre (menos dentro de la app ya instalada)
    const boton = $('#btn-instalar');
    if (yaInstalada()) return;
    boton.hidden = false;
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        avisoInstalar = e;   // Chrome/Edge dejan instalarla con un botón
        if (!$('#modal').hidden && $('.inst')) pintarInstalacion();
    });
    window.addEventListener('appinstalled', () => {
        boton.hidden = true;
        avisoInstalar = null;
        if (!$('#modal').hidden && $('.inst')) cerrarModal();
        aviso('¡App instalada!');
    });
}

const esAndroid = () => /android/i.test(navigator.userAgent);
// En el iPhone solo Safari tiene "Añadir a pantalla de inicio" seguro
const esSafariIOS = () => esIOS() && !/crios|fxios|edgios|opios|gsa\//i.test(navigator.userAgent);

let sistemaInstalar = null;   // 'android' | 'ios' | 'pc'

const ICONO_COMPARTIR_IOS = '<svg class="ico-paso" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9H6.5A1.5 1.5 0 0 0 5 10.5v9A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 17.5 9H16"/><path d="M12 3v11M8.5 6.5 12 3l3.5 3.5"/></g></svg>';

function pasosInstalacion(sistema) {
    const boton = avisoInstalar && sistema !== 'ios'
        ? `<button class="btn btn-ancho inst-ya" data-inst="ahora">Instalar ahora</button>
           <p class="gris inst-o">o, si prefieres hacerlo a mano:</p>` : '';
    if (sistema === 'android') return `${boton}
        <ol class="pasos">
            <li>Abre <b>poufortnite.github.io/twt2015</b> en <b>Chrome</b>.</li>
            <li>Toca el menú de los tres puntos <b>⋮</b> (arriba a la derecha).</li>
            <li>Toca <b>Instalar app</b> o <b>Añadir a pantalla de inicio</b>, y luego <b>Instalar</b>.</li>
        </ol>
        <p class="gris">Te sale el icono en el móvil como cualquier otra app, y funciona también sin internet.</p>`;
    if (sistema === 'ios') return `
        ${esIOS() && !esSafariIOS() ? '<p class="inst-ojo">Ahora no estás en Safari. Copia el enlace y ábrelo en <b>Safari</b>: en otros navegadores del iPhone puede no salir la opción.</p>' : ''}
        <ol class="pasos">
            <li>Abre <b>poufortnite.github.io/twt2015</b> en <b>Safari</b>.</li>
            <li>Toca el botón <b>Compartir</b> ${ICONO_COMPARTIR_IOS} (el cuadrado con la flecha hacia arriba, abajo en el centro).</li>
            <li>Baja y toca <b>Añadir a pantalla de inicio</b>.</li>
            <li>Toca <b>Añadir</b>, arriba a la derecha.</li>
        </ol>
        <p class="inst-ojo">En el iPhone, la app instalada y Safari guardan los datos por separado. Instálala <b>antes</b> de crear nada, o pásate lo de Safari con <b>Guardar copia</b> / <b>Cargar copia</b>.</p>`;
    return `${boton}
        <ol class="pasos">
            <li>Ábrela en <b>Chrome</b> o <b>Edge</b>.</li>
            <li>Toca el iconito de instalar a la derecha de la barra de direcciones (una pantalla con una flecha), o abre el menú <b>⋮</b> → <b>Instalar twt2015</b> (en Chrome puede estar en <b>Enviar, guardar y compartir</b>).</li>
            <li>Confirma con <b>Instalar</b>.</li>
        </ol>`;
}

function pintarInstalacion() {
    const opcion = (clave, texto) => `<button class="${sistemaInstalar === clave ? 'act' : ''}" data-sistema="${clave}">${texto}</button>`;
    $('#modal-cuerpo').innerHTML = `
        <div class="inst">
            <p class="destino">¿Dónde la quieres instalar?</p>
            <div class="seg-sentido inst-sistemas">
                ${opcion('android', 'Android')}${opcion('ios', 'iPhone')}${opcion('pc', 'Ordenador')}
            </div>
            <div class="inst-pasos">${pasosInstalacion(sistemaInstalar)}</div>
        </div>`;
}

function instalarApp() {
    if (!sistemaInstalar) sistemaInstalar = esIOS() ? 'ios' : esAndroid() ? 'android' : 'pc';
    abrirModal('Instalar la app', '');
    pintarInstalacion();
    $('#modal-cuerpo').onclick = async e => {
        const s = e.target.closest('[data-sistema]');
        if (s) { sistemaInstalar = s.dataset.sistema; return pintarInstalacion(); }
        if (e.target.closest('[data-inst="ahora"]') && avisoInstalar) {
            avisoInstalar.prompt();
            const { outcome } = await avisoInstalar.userChoice;
            avisoInstalar = null;
            if (outcome === 'accepted') cerrarModal();
            else pintarInstalacion();
        }
    };
}

/* ---------------------------------------------------------------------
   TUTORIAL (sale la primera vez; luego, con el botón "?" de arriba)
   --------------------------------------------------------------------- */

const chip = t => `<span class="chip">${t}</span>`;

const PASOS_TUTORIAL = [
    {
        ico: '<span class="tuto-logo">twt</span>',
        titulo: '¡Hola! Esto es twt2015',
        texto: `<p>Aquí te inventas cuentas de Twitter con el aspecto de 2015 y les haces tweets, respuestas y mensajes directos. Luego lo descargas todo como imagen.</p>
                <p>Lo que hagas se queda <b>solo en este móvil u ordenador</b>. Se guarda solo, no hay que darle a ningún botón.</p>`
    },
    {
        ico: ICONO.seguir,
        titulo: '1. Crea tus personajes',
        texto: `<p>Ve a ${chip('Perfiles')} y toca ${chip('+ Nuevo personaje')}.</p>
                <p>Le pones foto, nombre, @usuario, portada y color. También puedes marcarla como <b>verificada</b> ${ICONO.verificado} o <b>privada</b> ${ICONO.candado}.</p>
                <p>Los números (seguidores, siguiendo…) los escribes tú. Si los dejas vacíos, se cuentan solos.</p>`
    },
    {
        ico: '<span class="tuto-mirador"><span></span></span>',
        titulo: '2. "Viendo como"',
        texto: `<p>Arriba a la derecha eliges <b>desde qué cuenta miras</b> la app, como si tuvieras la sesión iniciada con ella.</p>
                <p>Eso decide qué sale en ${chip('Inicio')} (los tweets de las cuentas que sigue), si en un perfil pone <b>Seguir</b> o <b>Siguiendo</b>, quién responde por defecto y quién eres tú en los mensajes.</p>
                <p>Al principio todos se siguen entre sí. Para cambiarlo de golpe, ve a ${chip('Perfiles')} → ${chip('👥 Quién sigue a quién')}.</p>`
    },
    {
        ico: ICONO.reply,
        titulo: '3. Haz un tweet',
        texto: `<p>En ${chip('Inicio')} toca <b>¿Qué está pasando?</b>, o en un perfil toca ${chip('+ Tweet')}.</p>
                <p>Dentro del tweet <b>todo se cambia tocándolo</b>: el texto, los números de RETWEETS y FAVORITOS, la fecha… Toca la foto o el nombre para cambiar quién lo ha escrito.</p>
                <p>Con ${chip('+ Foto')} le pones una imagen.</p>`
    },
    {
        ico: ICONO.fav,
        titulo: '4. Las fotitos de favoritos',
        texto: `<p>Al lado de RETWEETS y FAVORITOS salían las caritas de quienes le habían dado a favorito.</p>
                <div class="tuto-demo"><span><small>RETWEETS</small><b>12</b></span><span><small>FAVORITOS</small><b>48</b></span><span class="tuto-caras"><i></i><i></i><i></i></span></div>
                <p>Toca ${chip('+ fotitos')} para elegir qué perfiles salen ahí (hasta 9). Si eliges a la cuenta desde la que miras, la estrella sale amarilla.</p>`
    },
    {
        ico: ICONO.retweet,
        titulo: '5. Retwitteado por',
        texto: `<p>En un tweet, toca ${chip('Retwitteado por…')} y elige quién lo ha retwitteado.</p>
                <p>Saldrá <b>"Retwitteado por…"</b> encima del tweet, y el tweet aparecerá también en el perfil de esa gente (y en el inicio de quien las sigue).</p>
                <p>Los tweets de cuentas privadas no se pueden retwittear, como en Twitter.</p>`
    },
    {
        ico: ICONO.reply,
        titulo: '6. Respuestas',
        texto: `<p>Toca ${chip('+ Añadir respuesta')} debajo del tweet. Eliges quién responde, el texto, una foto y hace cuánto (1h, 2 min…).</p>
                <p>Para responder a una respuesta (y hacer hilo), toca su flechita de responder.</p>
                <p>Al lado de cada respuesta tienes ▲ ▼ para ordenarlas, 📷 para la foto y ✕ para borrarla.</p>`
    },
    {
        ico: ICONO.sobre,
        titulo: '7. Mensajes directos',
        texto: `<p>En ${chip('Mensajes')} haces chats entre tus personajes: de dos, o de grupo (Twitter los estrenó en enero de 2015).</p>
                <p>Con ${chip('Lo envía ▾')} eliges quién escribe. ${chip('Ver como…')} decide quién eres tú: tus mensajes salen a la derecha y en tu color.</p>
                <p>En los grupos, toca el título para ponerle nombre. Con ${chip('🕐 Auto')} cada mensaje lleva la hora de ahora; quítalo si prefieres escribirla tú.</p>`
    },
    {
        ico: ICONO.camara,
        titulo: '8. Descárgalo como imagen',
        texto: `<p>El botón azul ${chip('Descargar')} hace una imagen de lo que estás viendo: un tweet, un perfil, el inicio o un chat. Desde el móvil sale igual que en el ordenador.</p>
                <p>En ${chip('Inicio')} tienes ${chip('Descargar tweets')}: hace una imagen de cada tweet y te las da todas juntas en un .zip. La próxima vez puedes bajar <b>solo los nuevos</b>.</p>`
    },
    {
        ico: ICONO.candadoGrande,
        titulo: '9. Guarda una copia',
        texto: `<p>Como todo está en este dispositivo, de vez en cuando ve a ${chip('Perfiles')} → <b>Tus datos</b> → ${chip('⬇ Guardar copia')}.</p>
                <p>Ese archivo te sirve si cambias de móvil o se borra el navegador: lo cargas con ${chip('⬆ Cargar copia')}.</p>
                <p>Para tenerla como una app más en el móvil, toca ${chip('Instalar')} arriba y elige Android o iPhone.</p>
                <p>Y si quieres volver a ver esta guía, toca el <span class="chip chip-redondo">?</span> de arriba.</p>
                <p class="gris">twt2015 está hecha por <a class="enlace" href="https://github.com/poufortnite" target="_blank" rel="noopener">@poufortnite</a>.</p>`
    }
];

function abrirTutorial(primeraVez = false) {
    let paso = 0;
    if (!app.tutorialVisto) {
        app.tutorialVisto = true;
        guardarApp();
    }
    const pintar = () => {
        const p = PASOS_TUTORIAL[paso];
        const ultimo = paso === PASOS_TUTORIAL.length - 1;
        $('#modal-cuerpo').innerHTML = `
            <div class="tuto">
                <div class="tuto-ico">${p.ico}</div>
                <h3>${p.titulo}</h3>
                <div class="tuto-texto">${p.texto}</div>
                <div class="tuto-puntos">${PASOS_TUTORIAL.map((_, i) => `<button data-paso="${i}" class="${i === paso ? 'act' : ''}" aria-label="Paso ${i + 1}"></button>`).join('')}</div>
                <div class="fila-btns">
                    ${paso > 0 ? '<button class="btn btn-gris" data-tuto="atras">Anterior</button>' : '<button class="btn btn-gris" data-tuto="saltar">Saltar</button>'}
                    <button class="btn" data-tuto="${ultimo ? 'fin' : 'siguiente'}">${ultimo ? (primeraVez ? '¡A empezar!' : 'Entendido') : 'Siguiente'}</button>
                </div>
            </div>`;
        $('#modal-cuerpo').scrollTop = 0;
    };
    abrirModal('Cómo se usa', '', () => {
        if (primeraVez && !personajes.length) formPersonaje();
    });
    pintar();
    $('#modal-cuerpo').onclick = e => {
        const punto = e.target.closest('[data-paso]');
        if (punto) { paso = Number(punto.dataset.paso); return pintar(); }
        const b = e.target.closest('[data-tuto]');
        if (!b) return;
        const que = b.dataset.tuto;
        if (que === 'siguiente') { paso++; return pintar(); }
        if (que === 'atras') { paso--; return pintar(); }
        cerrarModal();
    };
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
    chatActual = null;
    let html;

    if (r.pag === 'perfil' && pj(r.id)) {
        const pestana = ['respuestas', 'fotos'].includes(r.extra) ? r.extra : 'tweets';
        html = vistaPerfil(pj(r.id), pestana);
        vista.className = 'pag-perfil';
    } else if (r.pag === 'tweet' && tweetPorId(r.id)) {
        html = vistaTweet(tweetPorId(r.id));
        vista.className = 'pag-tweet';
    } else if (r.pag === 'chat' && chatPorId(r.id)) {
        html = vistaChat(chatPorId(r.id));
        vista.className = 'pag-chat';
    } else if (r.pag === 'mensajes') {
        html = vistaMensajes();
        vista.className = 'pag-mensajes';
    } else if (r.pag === 'perfiles') {
        html = vistaPerfiles();
        vista.className = 'pag-perfiles';
    } else {
        if (r.pag !== 'inicio' && location.hash) history.replaceState(null, '', '#/');
        html = vistaInicio();
        vista.className = 'pag-inicio';
    }
    const navAct = { 'pag-perfiles': 'perfiles', 'pag-inicio': 'inicio', 'pag-mensajes': 'mensajes', 'pag-chat': 'mensajes' }[vista.className] || '';
    $$('.topnav a').forEach(a => a.classList.toggle('act', a.dataset.pag === navAct));
    vista.innerHTML = html;
    $$('.ed', vista).forEach(pintarEditable);
    pintarMirador();

    const clave = location.hash;
    if (clave !== rutaAnterior) {
        // En un chat se empieza por abajo, como en Twitter (lo último es lo más nuevo)
        if (vista.className === 'pag-chat') requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
        else window.scrollTo(0, 0);
    }
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
        case 'descargar-todos': return descargarTodos();
        case 'nuevo-chat': return nuevoChat();
        case 'exportar': return exportarCopia();
        case 'importar': return importarCopia();
        case 'instalar': return instalarApp();
        case 'tutorial': return abrirTutorial();
        case 'seguimientos': return abrirSeguimientos(Number(el.dataset.id) || null);

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

    // ----- Acciones dentro de un chat -----
    if (chatActual && (accion.startsWith('chat-') || accion === 'msg-opciones' || accion === 'borrar-chat')) {
        return accionChat(accion, el, chatActual);
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
                aviso(sel.length ? 'Sale encima del tweet y en sus perfiles' : 'Ya no sale como retweet');
            }, { excluir: [t.autor_id], texto: 'Saldrá "Retwitteado por…" encima del tweet, y el tweet aparecerá también en sus perfiles.' });

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

// Al volver a la pestaña, recargar por si se ha cambiado algo desde otra pestaña
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') return guardarTodoYa();
    if (hayPendientes() || !$('#modal').hidden || document.activeElement?.isContentEditable) return;
    try {
        await cargarTodo();
        pintarPagina();
    } catch { /* seguimos con lo que hay */ }
});

/* ---------------------------------------------------------------------
   ARRANQUE
   --------------------------------------------------------------------- */

(async function iniciar() {
    actualizarAncho();
    try {
        await Almacen.limpiarHuerfanas();
        await cargarTodo();
        marcarGuardado('Guardado');
    } catch (e) {
        marcarGuardado('No se pueden guardar datos', true);
        aviso(e.message, true);
    }
    pintarPagina();
    // La primera vez sale la guía (también a quien ya usaba la app antes de que existiera)
    if (!app.tutorialVisto) abrirTutorial(true);
    else if (!personajes.length) formPersonaje();
    Almacen.pedirPersistencia();
    prepararInstalacion();
})();
