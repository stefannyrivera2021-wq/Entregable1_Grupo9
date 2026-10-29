// =============================================
// PET MANAGER · LÓGICA DE LA INTERFAZ
// Consume la API REST: /api/users y /api/pets
// =============================================


// =============================================
// ÍCONOS (SVG en línea)
// =============================================

const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    paw: '<g fill="currentColor" stroke="none"><ellipse cx="12" cy="16.2" rx="5" ry="4.2"/><ellipse cx="5.4" cy="10.6" rx="2.1" ry="2.7"/><ellipse cx="18.6" cy="10.6" rx="2.1" ry="2.7"/><ellipse cx="9" cy="5.8" rx="2.1" ry="2.8"/><ellipse cx="15" cy="5.8" rx="2.1" ry="2.8"/></g>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
    imagePlus: '<rect x="2.5" y="4" width="16" height="13" rx="2"/><circle cx="7.5" cy="8.5" r="1.6"/><path d="m18.5 13-4-4-9 8"/><circle cx="18.5" cy="17.5" r="4.2" fill="currentColor" stroke="none"/><path d="M18.5 15.5v4M16.5 17.5h4" stroke="#fff"/>'
};

function icon(name) {
    return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

// Rellena todos los <span data-icon="..."> vacíos
function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach(el => {
        if (!el.firstElementChild) {
            el.innerHTML = icon(el.dataset.icon);
        }
    });
}


// =============================================
// UTILIDADES
// =============================================

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const ILLUSTRATION_USER = "/img/ui/persona.webp";
const ILLUSTRATION_PETS = "/img/ui/mascotas.webp";
const MAX_PET_IMAGES = 5;
const MAX_FILE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// Escapa texto antes de insertarlo como HTML
function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function capitalize(text) {
    const value = String(text ?? "").trim();
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function normalize(text) {
    return String(text ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

function storageGet(key, fallback) {
    try {
        return localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* sin almacenamiento disponible: no pasa nada */
    }
}


// =============================================
// API
// =============================================

async function api(url, options = {}) {

    let response;

    try {
        response = await fetch(url, options);
    } catch {
        throw new Error("No se pudo conectar con el servidor. ¿Está encendido?");
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        /* respuesta sin JSON */
    }

    if (!response.ok) {
        const error = new Error(data?.error || `Error ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return data;
}


// =============================================
// ESTADO
// =============================================

const state = {
    users: [],
    pets: [],
    loaded: false,
    viewMode: {
        usuarios: storageGet("pm-view-usuarios", "cards"),
        mascotas: storageGet("pm-view-mascotas", "cards")
    },
    query: {
        usuarios: "",
        mascotas: ""
    },
    // Resultado de la búsqueda por ID (GET /api/.../:id)
    idSearch: {
        usuarios: null,
        mascotas: null
    },
    highlight: null,
    currentRoute: null
};

// Si ya hay una carga en curso, se reutiliza la misma promesa
let loadingPromise = null;

function loadData() {

    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {

        const [users, pets] = await Promise.all([
            api("/api/users"),
            api("/api/pets")
        ]);

        state.users = Array.isArray(users) ? users : [];
        state.pets = Array.isArray(pets) ? pets : [];
        state.loaded = true;

        updateStats();

    })().finally(() => {
        loadingPromise = null;
    });

    return loadingPromise;
}

function updateStats() {
    $("#stat-users").textContent = state.users.length;
    $("#stat-pets").textContent = state.pets.length;
}


// =============================================
// TEXTOS Y FRAGMENTOS COMUNES
// =============================================

function fullName(user) {
    return `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "Sin nombre";
}

function initials(user) {
    const a = (user.firstname || "").trim().charAt(0);
    const b = (user.lastname || "").trim().charAt(0);
    return (a + b).toUpperCase() || "?";
}

function avatarHTML(user, size = "") {

    const sizeClass = size ? ` avatar--${size}` : "";

    if (user.avatar) {
        return `<span class="avatar${sizeClass}"><img src="${esc(user.avatar)}" alt="Foto de ${esc(fullName(user))}" data-fallback="user" loading="lazy"></span>`;
    }

    return `<span class="avatar${sizeClass}" aria-hidden="true">${esc(initials(user))}</span>`;
}

function petTitle(pet) {
    return capitalize(pet.especie) || "Mascota";
}

function ageText(edad) {
    const n = Number(edad);
    if (!Number.isFinite(n) || edad === "" || edad === null || edad === undefined) return "";
    if (n === 0) return "Menos de 1 año";
    return `${n} ${n === 1 ? "año" : "años"}`;
}

function sexTag(sexo) {
    const value = normalize(sexo);
    if (value === "macho") return `<span class="tag tag--macho">♂ Macho</span>`;
    if (value === "hembra") return `<span class="tag tag--hembra">♀ Hembra</span>`;
    return sexo ? `<span class="tag">${esc(capitalize(sexo))}</span>` : "";
}

function petThumbHTML(pet) {
    const src = pet.img?.[0];
    if (src) {
        return `<span class="avatar avatar--photo-thumb"><img src="${esc(src)}" alt="" data-fallback="pet" loading="lazy"></span>`;
    }
    return `<span class="avatar avatar--photo-thumb" style="background:var(--coral-100);color:var(--coral)">${icon("paw")}</span>`;
}

const PAW_LOADER = `
<svg class="paw-loader" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
    <ellipse class="toe t1" cx="12" cy="28" rx="6" ry="7.5"/>
    <ellipse class="toe t2" cx="23.5" cy="14" rx="6" ry="8"/>
    <ellipse class="toe t3" cx="40.5" cy="14" rx="6" ry="8"/>
    <ellipse class="toe t4" cx="52" cy="28" rx="6" ry="7.5"/>
    <path class="pad" d="M32 30c-9 0-17 9-17 17 0 6 5 9 10 8 3-.5 4.5-2 7-2s4 1.5 7 2c5 1 10-2 10-8 0-8-8-17-17-17Z"/>
</svg>`;

const PEEK_DOG = `
<div class="peek-dog" aria-hidden="true">
    <svg viewBox="0 0 170 120">
        <path d="M50 40c-14 2-22 22-18 44 2 10 12 10 16 2 6-12 10-30 10-42Z" fill="#6b4129"/>
        <path d="M120 40c14 2 22 22 18 44-2 10-12 10-16 2-6-12-10-30-10-42Z" fill="#6b4129"/>
        <ellipse cx="85" cy="72" rx="40" ry="38" fill="#9a6644"/>
        <path d="M85 36c-6 0-9 8-9 16 0 6 4 10 9 10s9-4 9-10c0-8-3-16-9-16Z" fill="#b98059" opacity=".7"/>
        <ellipse cx="85" cy="90" rx="22" ry="17" fill="#f1dcc4"/>
        <g class="blink">
            <circle cx="70" cy="68" r="5" fill="#1b2a2c"/>
            <circle cx="100" cy="68" r="5" fill="#1b2a2c"/>
        </g>
        <circle cx="71.6" cy="66.3" r="1.6" fill="#fff"/>
        <circle cx="101.6" cy="66.3" r="1.6" fill="#fff"/>
        <path d="M81 97c0 5 2 7 4 7s4-2 4-7" fill="#e36f57"/>
        <path d="M77 82c0-3 4-4 8-4s8 1 8 4-4 7-8 7-8-4-8-7Z" fill="#1b2a2c"/>
        <path d="M85 89v5M85 94c-2 3-7 3-9 0M85 94c2 3 7 3 9 0" stroke="#1b2a2c" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="117" rx="13" ry="8" fill="#9a6644"/>
        <ellipse cx="120" cy="117" rx="13" ry="8" fill="#9a6644"/>
        <path d="M44 114v5M50 113v6M56 114v5M114 114v5M120 113v6M126 114v5" stroke="#6b4129" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
</div>`;

function loaderHTML(kind) {

    if (kind === "usuarios") {
        return `
        <div class="state">
            <div class="person-loader"><img src="${ILLUSTRATION_USER}" alt=""></div>
            <p>Buscando a las personas registradas…</p>
        </div>`;
    }

    return `
    <div class="state">
        ${PAW_LOADER}
        <p>Siguiendo las huellas…</p>
    </div>`;
}

function emptyHTML({ title, text, action = "" }) {
    return `
    <div class="state">
        ${PEEK_DOG}
        <h3>${title}</h3>
        <p>${text}</p>
        ${action}
    </div>`;
}

function errorHTML(message) {
    return `
    <div class="state">
        ${PEEK_DOG}
        <h3>Algo no salió bien</h3>
        <p>${esc(message)}</p>
        <button type="button" class="btn btn--ghost" data-action="retry">${icon("refresh")} Reintentar</button>
    </div>`;
}


// =============================================
// GALERÍA DE FOTOS
// =============================================

function galleryHTML(images, { alt = "", example = false } = {}) {

    const list = (images || []).filter(Boolean);
    const count = list.length;

    const slides = count
        ? list.map((src, i) => `<img src="${esc(src)}" alt="${esc(alt)} · foto ${i + 1}" data-fallback="pet" loading="lazy" draggable="false">`).join("")
        : `<div class="gallery__placeholder"><img src="${ILLUSTRATION_PETS}" alt=""></div>`;

    const controls = count > 1
        ? `
        <button type="button" class="gallery__nav gallery__nav--prev" data-dir="-1" aria-label="Foto anterior" disabled>${icon("chevL")}</button>
        <button type="button" class="gallery__nav gallery__nav--next" data-dir="1" aria-label="Foto siguiente">${icon("chevR")}</button>
        <div class="gallery__dots">${list.map((_, i) => `<span class="${i === 0 ? "is-active" : ""}"></span>`).join("")}</div>`
        : "";

    const badge = count
        ? `<span class="gallery__count">${icon("camera")}<span><span data-current>1</span>/${count}</span></span>`
        : "";

    const exampleTag = !count && example
        ? `<span class="gallery__example">Imagen de ejemplo</span>`
        : "";

    return `
    <div class="gallery" data-index="0" data-count="${count}">
        <div class="gallery__track">${slides}</div>
        ${controls}
        ${badge}
        ${exampleTag}
    </div>`;
}

function setGalleryIndex(gallery, index) {

    const count = Number(gallery.dataset.count) || 0;
    if (count < 2) return;

    const i = Math.max(0, Math.min(count - 1, index));
    gallery.dataset.index = i;

    $(".gallery__track", gallery).style.transform = `translateX(-${i * 100}%)`;

    $$(".gallery__dots span", gallery).forEach((dot, n) => dot.classList.toggle("is-active", n === i));

    const current = $("[data-current]", gallery);
    if (current) current.textContent = i + 1;

    $(".gallery__nav--prev", gallery).disabled = i === 0;
    $(".gallery__nav--next", gallery).disabled = i === count - 1;

    // Miniaturas de la ficha (si existen)
    const thumbs = gallery.closest(".modal__box")?.querySelectorAll(".ficha__thumbs button");
    thumbs?.forEach((thumb, n) => thumb.classList.toggle("is-active", n === i));
}

// Deslizar con el dedo en pantallas táctiles
let swipeStart = null;

document.addEventListener("touchstart", event => {
    const gallery = event.target.closest(".gallery");
    if (gallery) {
        swipeStart = { x: event.touches[0].clientX, y: event.touches[0].clientY, gallery };
    }
}, { passive: true });

document.addEventListener("touchend", event => {
    if (!swipeStart) return;
    const dx = event.changedTouches[0].clientX - swipeStart.x;
    const dy = event.changedTouches[0].clientY - swipeStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        const { gallery } = swipeStart;
        setGalleryIndex(gallery, Number(gallery.dataset.index) + (dx < 0 ? 1 : -1));
    }
    swipeStart = null;
});

// Si una imagen no carga, se muestra la ilustración
document.addEventListener("error", event => {
    const img = event.target;
    if (img.tagName !== "IMG" || !img.dataset.fallback || img.dataset.failed) return;
    img.dataset.failed = "1";
    img.src = img.dataset.fallback === "user" ? ILLUSTRATION_USER : ILLUSTRATION_PETS;
    img.style.objectFit = "contain";
    img.style.background = img.dataset.fallback === "user" ? "var(--sage)" : "var(--coral-100)";
}, true);


// =============================================
// NOTIFICACIONES
// =============================================

function toast(message, type = "success") {

    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.setAttribute("role", type === "error" ? "alert" : "status");
    el.innerHTML = `<span class="toast__icon">${icon(type === "error" ? "alert" : "check")}</span><span>${esc(message)}</span>`;

    $("#toasts").appendChild(el);

    setTimeout(() => {
        el.classList.add("is-leaving");
        el.addEventListener("animationend", () => el.remove(), { once: true });
    }, type === "error" ? 4800 : 3200);
}


// =============================================
// MODALES
// =============================================

let lastFocus = null;

function openModal(modal) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
        const target = modal.querySelector("[data-autofocus]") || modal.querySelector("button");
        target?.focus();
    });
}

function closeModal(modal) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    if ($$(".modal").every(m => m.hidden)) {
        document.body.style.overflow = "";
    }
    lastFocus?.focus?.();
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        const open = $$(".modal").filter(m => !m.hidden).pop();
        closeModal(open);
    }
});


// ---------- Confirmar eliminación ----------

let pendingDelete = null;

function askDelete(kind, record) {

    pendingDelete = { kind, record };

    const isUser = kind === "usuarios";
    const media = $("#delete-media");

    if (isUser) {
        media.innerHTML = avatarHTML(record, "xl");
    } else if (record.img?.[0]) {
        media.innerHTML = `<img class="delete-photo" src="${esc(record.img[0])}" alt="" data-fallback="pet">`;
    } else {
        media.innerHTML = `<img class="delete-photo" src="${ILLUSTRATION_PETS}" alt="" style="object-fit:contain;background:var(--coral-100)">`;
    }

    media.insertAdjacentHTML("beforeend", `<span class="delete-media__badge">${icon("trash")}</span>`);

    $("#delete-title").textContent = isUser
        ? `¿Eliminar a ${fullName(record)}?`
        : `¿Eliminar la mascota #${record.id} (${petTitle(record)})?`;

    const photos = isUser
        ? (record.avatar ? " También se borrará su foto de perfil." : "")
        : (record.img?.length ? ` También se ${record.img.length === 1 ? "borrará su foto" : `borrarán sus ${record.img.length} fotos`}.` : "");

    $("#delete-text").textContent = `Esta acción no se puede deshacer.${photos}`;

    const confirmBtn = $("#delete-confirm");
    confirmBtn.disabled = false;

    openModal($("#modal-delete"));
    $("#modal-delete [data-close].btn").focus();
}

$("#delete-confirm").addEventListener("click", async () => {

    if (!pendingDelete) return;

    const { kind, record } = pendingDelete;
    const button = $("#delete-confirm");
    button.disabled = true;

    const endpoint = kind === "usuarios" ? "users" : "pets";

    try {
        await api(`/api/${endpoint}/${record.id}`, { method: "DELETE" });

        closeModal($("#modal-delete"));
        closeModal($("#modal-ficha"));

        toast(kind === "usuarios"
            ? `${fullName(record)} fue eliminado`
            : `La mascota #${record.id} fue eliminada`);

        await loadData();
        state.idSearch[kind] = null;
        refreshCurrentView();

    } catch (error) {
        toast(error.message, "error");
        button.disabled = false;
    } finally {
        pendingDelete = null;
    }
});


// ---------- Ficha del registro ----------

function openUserFicha(user) {

    $("#ficha-content").innerHTML = `
    <div class="ficha ficha--user">
        <div class="ficha__hero"></div>
        <div class="ficha__body">
            ${avatarHTML(user, "xl")}
            <h2 id="ficha-title">${esc(fullName(user))}</h2>
            <p class="muted">@${esc(user.username)}</p>
            <dl class="data-table">
                <div><dt>ID</dt><dd>#${esc(user.id)}</dd></div>
                <div><dt>Nombre</dt><dd>${esc(user.firstname)}</dd></div>
                <div><dt>Apellido</dt><dd>${esc(user.lastname)}</dd></div>
                <div><dt>Usuario</dt><dd>${esc(user.username)}</dd></div>
                <div><dt>Foto</dt><dd>${user.avatar ? `<a href="${esc(user.avatar)}" target="_blank" rel="noopener">Ver imagen original</a>` : "Sin foto"}</dd></div>
            </dl>
            <div class="ficha__actions">
                <a href="#editar-usuario/${user.id}" class="btn btn--primary" data-close>${icon("edit")} Editar</a>
                <button type="button" class="btn btn--ghost" data-action="delete" data-kind="usuarios" data-id="${user.id}">${icon("trash")} Eliminar</button>
            </div>
        </div>
    </div>`;

    openModal($("#modal-ficha"));
}

function openPetFicha(pet) {

    const images = pet.img || [];

    const thumbs = images.length > 1
        ? `<div class="ficha__thumbs">${images.map((src, i) => `<button type="button" class="${i === 0 ? "is-active" : ""}" data-thumb="${i}" aria-label="Ver foto ${i + 1}"><img src="${esc(src)}" alt="" data-fallback="pet"></button>`).join("")}</div>`
        : "";

    $("#ficha-content").innerHTML = `
    <div class="ficha">
        <div>
            ${galleryHTML(images, { alt: petTitle(pet) })}
        </div>
        <div class="ficha__body">
            <h2 id="ficha-title">${esc(petTitle(pet))}</h2>
            <p class="pet-color">${esc(capitalize(pet.color))}</p>
            <div class="tags">
                ${ageText(pet.edad) ? `<span class="tag">${esc(ageText(pet.edad))}</span>` : ""}
                ${sexTag(pet.sexo)}
            </div>
            <dl class="data-table" style="margin-top:18px">
                <div><dt>ID</dt><dd>#${esc(pet.id)}</dd></div>
                <div><dt>Especie</dt><dd>${esc(capitalize(pet.especie))}</dd></div>
                <div><dt>Color</dt><dd>${esc(capitalize(pet.color))}</dd></div>
                <div><dt>Edad</dt><dd>${esc(ageText(pet.edad))}</dd></div>
                <div><dt>Sexo</dt><dd>${esc(capitalize(pet.sexo))}</dd></div>
                <div><dt>Fotos</dt><dd>${images.length || "Sin fotos"}</dd></div>
            </dl>
            <div class="ficha__actions">
                <a href="#editar-mascota/${pet.id}" class="btn btn--accent" data-close>${icon("edit")} Editar</a>
                <button type="button" class="btn btn--ghost" data-action="delete" data-kind="mascotas" data-id="${pet.id}">${icon("trash")} Eliminar</button>
            </div>
        </div>
    </div>
    ${thumbs}
    <div style="height:${thumbs ? 18 : 0}px"></div>`;

    openModal($("#modal-ficha"));
}


// =============================================
// INICIO
// =============================================

function renderHome() {

    // El resumen es opcional: si no está en la página, no se hace nada
    if (!$("#hero-summary")) return;

    const u = state.users.length;
    const p = state.pets.length;

    $("#hero-summary").textContent = !u && !p
        ? "Aún no hay registros. Empieza agregando la primera persona o la primera mascota."
        : `Hay ${u} ${u === 1 ? "usuario" : "usuarios"} y ${p} ${p === 1 ? "mascota registrada" : "mascotas registradas"}. Todo listo para seguir sumando huellas.`;
}

// Tarjetas giratorias: hover en escritorio, toque o teclado en el resto
$$("[data-flip]").forEach(card => {

    card.addEventListener("click", event => {
        if (event.target.closest("a, button")) return;
        if (!matchMedia("(hover: hover)").matches) {
            card.classList.toggle("is-flipped");
        }
    });

    card.addEventListener("keydown", event => {
        if ((event.key === "Enter" || event.key === " ") && event.target === card) {
            event.preventDefault();
            card.classList.toggle("is-flipped");
        }
    });

    // En pantallas táctiles el navegador simula "mouseleave" justo
    // después del toque, así que solo se aplica con mouse real.
    card.addEventListener("mouseleave", () => {
        if (matchMedia("(hover: hover)").matches) {
            card.classList.remove("is-flipped");
        }
    });
});


// =============================================
// LISTADOS (USUARIOS Y MASCOTAS)
// =============================================

function filteredRecords(kind) {

    const records = kind === "usuarios" ? state.users : state.pets;
    const query = state.query[kind].trim();

    // Búsqueda por ID: usa la respuesta de GET /api/.../:id
    if (/^#?\d+$/.test(query)) {
        const search = state.idSearch[kind];
        if (search?.query === query) {
            return search.result ? [search.result] : [];
        }
        return null; // todavía cargando
    }

    if (!query) return records;

    const q = normalize(query);

    return records.filter(record => {
        const haystack = kind === "usuarios"
            ? `${record.firstname} ${record.lastname} ${record.username}`
            : `${record.especie} ${record.color} ${record.sexo}`;
        return normalize(haystack).includes(q);
    });
}

function renderList(kind) {

    const container = $(`#list-${kind}`);
    const records = filteredRecords(kind);
    const mode = state.viewMode[kind];
    const isUser = kind === "usuarios";

    // Botones de vista
    $$(`[data-viewmode][data-target="${kind}"]`).forEach(btn => {
        const active = btn.dataset.viewmode === mode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active);
    });

    // Nota de búsqueda por ID
    const note = $(`#note-${kind}`);
    const query = state.query[kind].trim();
    if (/^#?\d+$/.test(query)) {
        const id = query.replace("#", "");
        note.hidden = false;
        note.innerHTML = `Búsqueda por ID usando <code>GET /api/${isUser ? "users" : "pets"}/${esc(id)}</code>`;
    } else {
        note.hidden = true;
    }

    if (records === null) {
        container.innerHTML = loaderHTML(kind);
        return;
    }

    if (!records.length) {

        if (query) {
            const byId = /^#?\d+$/.test(query);
            container.innerHTML = emptyHTML({
                title: byId ? `No hay ${isUser ? "un usuario" : "una mascota"} con ID ${esc(query.replace("#", ""))}` : "Sin resultados",
                text: byId ? "Revisa el número e intenta de nuevo." : `No encontramos coincidencias para “${esc(query)}”.`,
                action: `<button type="button" class="btn btn--ghost" data-action="clear-search" data-kind="${kind}">Limpiar búsqueda</button>`
            });
        } else {
            container.innerHTML = emptyHTML({
                title: isUser ? "Aún no hay usuarios" : "Aún no hay mascotas",
                text: isUser
                    ? "Cuando registres a la primera persona aparecerá aquí."
                    : "Este perrito está esperando compañía. Registra la primera mascota.",
                action: `<a href="${isUser ? "#nuevo-usuario" : "#nueva-mascota"}" class="btn ${isUser ? "btn--primary" : "btn--accent"}">${icon("plus")} ${isUser ? "Registrar usuario" : "Registrar mascota"}</a>`
            });
        }
        return;
    }

    if (isUser) {
        container.innerHTML = mode === "list" ? userListHTML(records) : userCardsHTML(records);
    } else {
        container.innerHTML = mode === "list" ? petListHTML(records) : petCardsHTML(records);
    }

    // Resaltar el registro recién creado o editado
    if (state.highlight?.kind === kind) {
        const el = container.querySelector(`[data-id="${state.highlight.id}"]`);
        if (el) {
            el.animate(
                [
                    { boxShadow: "0 0 0 0 rgba(227,111,87,.6)" },
                    { boxShadow: "0 0 0 10px rgba(227,111,87,0)" }
                ],
                { duration: 900, iterations: 2 }
            );
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        state.highlight = null;
    }
}

function userCardsHTML(users) {
    return `<div class="grid">${users.map((user, i) => `
        <article class="card user-card" data-open="usuarios" data-id="${user.id}" style="animation-delay:${Math.min(i, 12) * 40}ms">
            <span class="chip-id">#${esc(user.id)}</span>
            <div class="user-card__banner"></div>
            <div class="user-card__body">
                ${avatarHTML(user, "lg")}
                <h3>${esc(fullName(user))}</h3>
                <p class="username">@${esc(user.username)}</p>
                <div class="card__actions">
                    <button type="button" class="btn btn--ghost" data-action="open" data-kind="usuarios" data-id="${user.id}">${icon("eye")} Ver</button>
                    <a href="#editar-usuario/${user.id}" class="icon-btn" aria-label="Editar a ${esc(fullName(user))}">${icon("edit")}</a>
                    <button type="button" class="icon-btn icon-btn--danger" data-action="delete" data-kind="usuarios" data-id="${user.id}" aria-label="Eliminar a ${esc(fullName(user))}">${icon("trash")}</button>
                </div>
            </div>
        </article>`).join("")}</div>`;
}

function userListHTML(users) {
    return `
    <div class="list list--users">
        <div class="list__head"><span></span><span>Nombre</span><span>Usuario</span><span></span></div>
        ${users.map((user, i) => `
        <div class="list__row" data-open="usuarios" data-id="${user.id}" style="animation-delay:${Math.min(i, 15) * 25}ms">
            ${avatarHTML(user)}
            <div class="truncate"><strong class="truncate">${esc(fullName(user))}</strong><small>ID #${esc(user.id)}</small></div>
            <div class="truncate">@${esc(user.username)}</div>
            <div class="list__actions">
                <a href="#editar-usuario/${user.id}" class="icon-btn" aria-label="Editar">${icon("edit")}</a>
                <button type="button" class="icon-btn icon-btn--danger" data-action="delete" data-kind="usuarios" data-id="${user.id}" aria-label="Eliminar">${icon("trash")}</button>
            </div>
        </div>`).join("")}
    </div>`;
}

function petCardsHTML(pets) {
    return `<div class="grid">${pets.map((pet, i) => `
        <article class="card pet-card" data-open="mascotas" data-id="${pet.id}" style="animation-delay:${Math.min(i, 12) * 40}ms">
            <span class="chip-id">#${esc(pet.id)}</span>
            ${galleryHTML(pet.img, { alt: petTitle(pet) })}
            <div class="pet-card__body">
                <h3>${esc(petTitle(pet))}</h3>
                <p class="pet-color">${esc(capitalize(pet.color))}</p>
                <div class="tags">
                    ${ageText(pet.edad) ? `<span class="tag">${esc(ageText(pet.edad))}</span>` : ""}
                    ${sexTag(pet.sexo)}
                </div>
                <div class="card__actions">
                    <button type="button" class="btn btn--ghost" data-action="open" data-kind="mascotas" data-id="${pet.id}">${icon("eye")} Ver ficha</button>
                    <a href="#editar-mascota/${pet.id}" class="icon-btn" aria-label="Editar">${icon("edit")}</a>
                    <button type="button" class="icon-btn icon-btn--danger" data-action="delete" data-kind="mascotas" data-id="${pet.id}" aria-label="Eliminar">${icon("trash")}</button>
                </div>
            </div>
        </article>`).join("")}</div>`;
}

function petListHTML(pets) {
    return `
    <div class="list list--pets">
        <div class="list__head"><span></span><span>Especie</span><span>Color</span><span>Edad</span><span>Sexo</span><span class="col-photos">Fotos</span><span></span></div>
        ${pets.map((pet, i) => `
        <div class="list__row" data-open="mascotas" data-id="${pet.id}" style="animation-delay:${Math.min(i, 15) * 25}ms">
            ${petThumbHTML(pet)}
            <div class="truncate"><strong class="truncate">${esc(petTitle(pet))}</strong><small>ID #${esc(pet.id)}</small></div>
            <div class="truncate">${esc(capitalize(pet.color))} <small class="col-label">· ${esc(ageText(pet.edad))}</small></div>
            <div class="col-hide-sm">${esc(ageText(pet.edad))}</div>
            <div class="col-hide-sm">${sexTag(pet.sexo)}</div>
            <div class="col-hide-sm col-photos">${pet.img?.length || 0}</div>
            <div class="list__actions">
                <a href="#editar-mascota/${pet.id}" class="icon-btn" aria-label="Editar">${icon("edit")}</a>
                <button type="button" class="icon-btn icon-btn--danger" data-action="delete" data-kind="mascotas" data-id="${pet.id}" aria-label="Eliminar">${icon("trash")}</button>
            </div>
        </div>`).join("")}
    </div>`;
}

// Búsqueda
async function runIdSearch(kind, query) {

    const id = query.replace("#", "");
    const endpoint = kind === "usuarios" ? "users" : "pets";

    try {
        const result = await api(`/api/${endpoint}/${id}`);
        state.idSearch[kind] = { query, result };
    } catch {
        state.idSearch[kind] = { query, result: null };
    }

    // Solo pinta si la búsqueda sigue siendo la misma
    if (state.query[kind].trim() === query) {
        renderList(kind);
    }
}

["usuarios", "mascotas"].forEach(kind => {

    const input = $(`#search-${kind}`);

    const onSearch = debounce(() => {
        const query = input.value.trim();
        state.query[kind] = query;
        renderList(kind);
        if (/^#?\d+$/.test(query)) {
            runIdSearch(kind, query);
        }
    }, 220);

    input.addEventListener("input", onSearch);
});


// =============================================
// ZONA PARA ARRASTRAR FOTOS
// =============================================

class Dropzone {

    constructor(root, { max = 5, single = false, onChange = () => {} } = {}) {
        this.root = root;
        this.max = max;
        this.single = single;
        this.onChange = onChange;
        this.items = []; // { file, url }
        this.fullMessage = "";

        root.innerHTML = `
        <div class="dropzone__area">
            <span class="dropzone__icon">${icon("imagePlus")}</span>
            <strong>${single ? "Arrastra aquí una foto" : "Arrastra aquí tus fotografías"}</strong>
            <small data-dz-limit></small>
            <button type="button" class="btn btn--accent" data-dz-pick>${single ? "Seleccionar foto" : "Seleccionar imágenes"}</button>
            <input class="dropzone__input" type="file" accept="${IMAGE_TYPES.join(",")}" ${single ? "" : "multiple"} tabindex="-1">
        </div>
        <div class="dropzone__meta" hidden>
            <span class="counter" data-dz-counter></span>
            <button type="button" class="link-btn" data-dz-clear>${single ? "Quitar foto" : "Quitar todas"}</button>
        </div>
        <div class="thumbs" data-dz-thumbs></div>`;

        this.area = $(".dropzone__area", root);
        this.input = $(".dropzone__input", root);

        $("[data-dz-pick]", root).addEventListener("click", () => this.input.click());

        this.input.addEventListener("change", () => {
            this.add([...this.input.files]);
            this.input.value = "";
        });

        ["dragenter", "dragover"].forEach(type => this.area.addEventListener(type, event => {
            event.preventDefault();
            this.area.classList.add("is-over");
        }));

        ["dragleave", "drop"].forEach(type => this.area.addEventListener(type, event => {
            event.preventDefault();
            if (type === "dragleave" && this.area.contains(event.relatedTarget)) return;
            this.area.classList.remove("is-over");
        }));

        this.area.addEventListener("drop", event => this.add([...event.dataTransfer.files]));

        $("[data-dz-clear]", root).addEventListener("click", () => this.clear());

        $("[data-dz-thumbs]", root).addEventListener("click", event => {
            const btn = event.target.closest("[data-remove]");
            if (btn) this.remove(Number(btn.dataset.remove));
        });

        this.render();
    }

    setMax(max, fullMessage = "") {
        this.max = Math.max(0, max);
        this.fullMessage = fullMessage;
        while (this.items.length > this.max) {
            URL.revokeObjectURL(this.items.pop().url);
        }
        this.render();
        this.onChange();
    }

    add(files) {

        const valid = [];
        let rejected = 0;
        let tooBig = 0;

        for (const file of files) {
            if (!IMAGE_TYPES.includes(file.type)) {
                rejected++;
            } else if (file.size > MAX_FILE_MB * 1024 * 1024) {
                tooBig++;
            } else {
                valid.push(file);
            }
        }

        if (rejected) toast(`${rejected === 1 ? "Un archivo no es" : `${rejected} archivos no son`} imagen (jpg, png, webp, gif o avif).`, "error");
        if (tooBig) toast(`${tooBig === 1 ? "Una imagen supera" : `${tooBig} imágenes superan`} los ${MAX_FILE_MB} MB.`, "error");

        if (!valid.length) return;

        if (this.single) {
            this.clear(false);
            valid.length = 1;
        }

        const space = this.max - this.items.length;

        if (space <= 0) {
            toast(this.fullMessage || `Ya alcanzaste el máximo de ${this.max} fotos.`, "error");
            return;
        }

        if (valid.length > space) {
            toast(`Solo se agregaron ${space} de ${valid.length} fotos: el máximo es ${this.max}.`, "error");
        }

        valid.slice(0, space).forEach(file => {
            this.items.push({ file, url: URL.createObjectURL(file) });
        });

        this.render();
        this.onChange();
    }

    remove(index) {
        const [item] = this.items.splice(index, 1);
        if (item) URL.revokeObjectURL(item.url);
        this.render();
        this.onChange();
    }

    clear(notify = true) {
        this.items.forEach(item => URL.revokeObjectURL(item.url));
        this.items = [];
        this.render();
        if (notify) this.onChange();
    }

    get files() {
        return this.items.map(item => item.file);
    }

    get urls() {
        return this.items.map(item => item.url);
    }

    render() {

        const n = this.items.length;
        const full = n >= this.max;

        $("[data-dz-limit]", this.root).textContent = this.max === 0
            ? (this.fullMessage || "No se pueden agregar más fotos.")
            : this.single
                ? `JPG, PNG, WEBP, GIF o AVIF · máximo ${MAX_FILE_MB} MB`
                : `Hasta ${this.max} ${this.max === 1 ? "imagen" : "imágenes"} · máximo ${MAX_FILE_MB} MB cada una`;

        this.area.classList.toggle("is-full", this.max === 0);
        $("[data-dz-pick]", this.root).disabled = this.max === 0;

        const meta = $(".dropzone__meta", this.root);
        meta.hidden = n === 0;

        const counter = $("[data-dz-counter]", this.root);
        counter.innerHTML = `${icon("camera")} ${n} / ${this.max} ${this.single ? "foto" : "fotos"}`;
        counter.classList.toggle("is-full", full);

        $("[data-dz-thumbs]", this.root).innerHTML = this.items.map((item, i) => `
            <div class="thumb">
                <img src="${item.url}" alt="Foto seleccionada ${i + 1}">
                <button type="button" class="thumb__remove" data-remove="${i}" aria-label="Quitar foto ${i + 1}">${icon("x")}</button>
                <span class="thumb__badge">Nueva</span>
            </div>`).join("");
    }
}


// =============================================
// FORMULARIO DE USUARIO
// =============================================

const userForm = {
    el: $("#form-usuario"),
    editing: null, // usuario en edición
    dz: null
};

userForm.dz = new Dropzone($("#dz-usuario"), {
    max: 1,
    single: true,
    onChange: () => renderUserPreview()
});

const userFields = {
    firstname: $("#u-firstname"),
    lastname: $("#u-lastname"),
    username: $("#u-username"),
    password: $("#u-password")
};

function renderUserPreview() {

    const editing = userForm.editing;
    const first = userFields.firstname.value.trim();
    const last = userFields.lastname.value.trim();
    const username = userFields.username.value.trim();

    const photo = userForm.dz.urls[0] || editing?.avatar || "";
    const name = `${first} ${last}`.trim();

    const avatar = photo
        ? `<span class="avatar avatar--xl"><img src="${esc(photo)}" alt="" data-fallback="user"></span>`
        : (first || last)
            ? `<span class="avatar avatar--xl">${esc((first.charAt(0) + last.charAt(0)).toUpperCase())}</span>`
            : `<span class="avatar avatar--xl avatar--illustration"><img src="${ILLUSTRATION_USER}" alt=""></span>`;

    $("#preview-usuario").innerHTML = `
    <div class="preview-card">
        <div class="user-preview">
            <div class="user-card__banner"></div>
            ${avatar}
            <h3>${name ? esc(name) : '<span style="color:var(--muted)">Nombre Apellido</span>'}</h3>
            <p>@${username ? esc(username) : "usuario"}</p>
            ${editing ? `<div class="tags" style="justify-content:center"><span class="tag">ID #${esc(editing.id)}</span></div>` : ""}
        </div>
    </div>
    <dl class="data-table">
        <div><dt>Nombre</dt><dd class="${first ? "" : "is-empty"}">${first ? esc(first) : "—"}</dd></div>
        <div><dt>Apellido</dt><dd class="${last ? "" : "is-empty"}">${last ? esc(last) : "—"}</dd></div>
        <div><dt>Usuario</dt><dd class="${username ? "" : "is-empty"}">${username ? esc(username) : "—"}</dd></div>
        <div><dt>Contraseña</dt><dd class="${userFields.password.value ? "" : "is-empty"}">${userFields.password.value ? "•".repeat(Math.min(userFields.password.value.length, 12)) + " (se cifra)" : editing ? "Sin cambios" : "—"}</dd></div>
    </dl>`;
}

Object.values(userFields).forEach(input => input.addEventListener("input", () => {
    clearFieldError(input);
    renderUserPreview();
}));

$("#toggle-password").addEventListener("click", event => {
    const input = userFields.password;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    event.currentTarget.innerHTML = icon(show ? "eyeOff" : "eye");
    event.currentTarget.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
});

async function openUserForm(id = null) {

    resetFormErrors(userForm.el);
    userForm.dz.clear(false);
    userForm.editing = null;
    userForm.el.reset();
    userFields.password.type = "password";
    $("#toggle-password").innerHTML = icon("eye");

    const isEdit = id !== null;

    $("#form-usuario-title").textContent = isEdit ? "Editar usuario" : "Nuevo usuario";
    $("#form-usuario-sub").textContent = isEdit ? "Cambia solo lo que necesites." : "Completa la información del usuario.";
    $("#submit-usuario .btn__label").textContent = isEdit ? "Guardar cambios" : "Registrar usuario";
    $("#password-hint").textContent = isEdit
        ? "Déjala vacía para mantener la actual."
        : "Se guarda cifrada, nunca en texto plano.";
    $("[data-form-reset]", userForm.el).textContent = isEdit ? "Deshacer cambios" : "Limpiar formulario";

    if (isEdit) {
        try {
            const user = state.users.find(u => u.id === id) || await api(`/api/users/${id}`);
            userForm.editing = user;
            userFields.firstname.value = user.firstname || "";
            userFields.lastname.value = user.lastname || "";
            userFields.username.value = user.username || "";
        } catch (error) {
            toast(error.status === 404 ? "Ese usuario ya no existe." : error.message, "error");
            location.hash = "#usuarios";
            return;
        }
    }

    renderUserPreview();
}

$("[data-form-reset]", userForm.el).addEventListener("click", () => {
    openUserForm(userForm.editing ? userForm.editing.id : null);
});

userForm.el.addEventListener("submit", async event => {

    event.preventDefault();
    resetFormErrors(userForm.el);

    const editing = userForm.editing;
    const values = {
        firstname: userFields.firstname.value.trim(),
        lastname: userFields.lastname.value.trim(),
        username: userFields.username.value.trim(),
        password: userFields.password.value
    };

    // Validación en el navegador (el servidor valida de nuevo)
    let valid = true;
    if (!values.firstname) valid = fieldError(userFields.firstname, "Escribe el nombre.");
    if (!values.lastname) valid = fieldError(userFields.lastname, "Escribe el apellido.");
    if (!values.username) valid = fieldError(userFields.username, "Escribe un nombre de usuario.");
    else if (/\s/.test(values.username)) valid = fieldError(userFields.username, "El usuario no puede tener espacios.");
    if (!editing && !values.password.trim()) valid = fieldError(userFields.password, "Escribe una contraseña.");
    else if (values.password && values.password.trim().length < 4) valid = fieldError(userFields.password, "Usa al menos 4 caracteres.");

    if (!valid) {
        $(".has-error input", userForm.el)?.focus();
        return;
    }

    const data = new FormData();
    data.append("firstname", values.firstname);
    data.append("lastname", values.lastname);
    data.append("username", values.username);
    if (values.password) data.append("password", values.password);
    if (userForm.dz.files[0]) data.append("avatar", userForm.dz.files[0]);

    const button = $("#submit-usuario");
    button.disabled = true;

    try {
        const result = await api(editing ? `/api/users/${editing.id}` : "/api/users", {
            method: editing ? "PUT" : "POST",
            body: data
        });

        toast(editing ? "Usuario actualizado correctamente" : `¡Bienvenido, ${values.firstname}! Usuario creado.`);

        await loadData();
        state.highlight = { kind: "usuarios", id: result.user?.id ?? editing?.id };
        state.query.usuarios = "";
        $("#search-usuarios").value = "";
        userForm.dz.clear(false);
        userForm.el.reset();
        location.hash = "#usuarios";

    } catch (error) {
        showFormError(userForm.el, error.message);
        if (/username/i.test(error.message)) fieldError(userFields.username, error.message);
    } finally {
        button.disabled = false;
    }
});


// =============================================
// FORMULARIO DE MASCOTA
// =============================================

const petForm = {
    el: $("#form-mascota"),
    editing: null,
    dz: null
};

const petFields = {
    especie: $("#p-especie"),
    especieOtra: $("#p-especie-otra"),
    color: $("#p-color"),
    edad: $("#p-edad"),
    sexo: $("#p-sexo")
};

const replaceToggle = $("#replace-images");

petForm.dz = new Dropzone($("#dz-mascota"), {
    max: MAX_PET_IMAGES,
    onChange: () => renderPetPreview()
});

function especieValue() {
    return petFields.especie.value === "__otra"
        ? petFields.especieOtra.value.trim()
        : petFields.especie.value;
}

function syncSelectPlaceholder() {
    [petFields.especie, petFields.sexo].forEach(select => {
        select.classList.toggle("is-placeholder", !select.value);
    });
}

function existingImages() {
    return petForm.editing?.img || [];
}

function updatePetLimit() {

    if (!petForm.editing) {
        petForm.dz.setMax(MAX_PET_IMAGES);
        return;
    }

    const replacing = replaceToggle.checked;
    const free = replacing ? MAX_PET_IMAGES : MAX_PET_IMAGES - existingImages().length;

    $("#current-photos").classList.toggle("is-replacing", replacing && petForm.dz.items.length > 0);

    petForm.dz.setMax(
        free,
        "Ya tiene 5 fotos. Activa «Reemplazar por las nuevas» para subir otras."
    );
}

function renderPetPreview() {

    const especie = especieValue();
    const color = petFields.color.value.trim();
    const edad = petFields.edad.value.trim();
    const sexo = petFields.sexo.value;

    const replacing = replaceToggle.checked && petForm.dz.items.length > 0;
    const images = [...(replacing ? [] : existingImages()), ...petForm.dz.urls];

    $("#current-photos").classList.toggle("is-replacing", replacing);

    const title = capitalize(especie);

    $("#preview-mascota").innerHTML = `
    <div class="preview-card pet-card">
        ${galleryHTML(images, { alt: title || "Mascota", example: true })}
        <div class="pet-card__body">
            <h3>${title ? esc(title) : '<span style="color:var(--muted)">Especie</span>'}</h3>
            <p class="pet-color">${color ? esc(capitalize(color)) : "Color"}</p>
            <div class="tags">
                ${edad !== "" ? `<span class="tag">${esc(ageText(edad))}</span>` : ""}
                ${sexTag(sexo)}
            </div>
        </div>
    </div>
    <dl class="data-table">
        <div><dt>Especie</dt><dd class="${title ? "" : "is-empty"}">${title ? esc(title) : "—"}</dd></div>
        <div><dt>Color</dt><dd class="${color ? "" : "is-empty"}">${color ? esc(capitalize(color)) : "—"}</dd></div>
        <div><dt>Edad</dt><dd class="${edad !== "" ? "" : "is-empty"}">${edad !== "" ? esc(ageText(edad)) : "—"}</dd></div>
        <div><dt>Sexo</dt><dd class="${sexo ? "" : "is-empty"}">${sexo ? esc(capitalize(sexo)) : "—"}</dd></div>
    </dl>`;
}

petFields.especie.addEventListener("change", () => {
    const other = petFields.especie.value === "__otra";
    petFields.especieOtra.hidden = !other;
    if (other) petFields.especieOtra.focus();
});

Object.values(petFields).forEach(input => {
    ["input", "change"].forEach(type => input.addEventListener(type, () => {
        clearFieldError(input);
        syncSelectPlaceholder();
        renderPetPreview();
    }));
});

replaceToggle.addEventListener("change", () => {
    updatePetLimit();
    renderPetPreview();
});

function setEspecie(value) {

    const options = [...petFields.especie.options].map(o => o.value).filter(v => v && v !== "__otra");
    const match = options.find(option => normalize(option) === normalize(value));

    if (match) {
        petFields.especie.value = match;
        petFields.especieOtra.hidden = true;
        petFields.especieOtra.value = "";
    } else if (value) {
        petFields.especie.value = "__otra";
        petFields.especieOtra.hidden = false;
        petFields.especieOtra.value = capitalize(value);
    }
}

async function openPetForm(id = null) {

    resetFormErrors(petForm.el);
    petForm.dz.clear(false);
    petForm.editing = null;
    petForm.el.reset();
    petFields.especieOtra.hidden = true;
    replaceToggle.checked = false;

    const isEdit = id !== null;

    $("#form-mascota-title").textContent = isEdit ? "Editar mascota" : "Nueva mascota";
    $("#form-mascota-sub").textContent = isEdit ? "Actualiza sus datos o agrega más fotos." : "Completa la información de la mascota.";
    $("#submit-mascota .btn__label").textContent = isEdit ? "Guardar cambios" : "Registrar mascota";
    $("[data-form-reset]", petForm.el).textContent = isEdit ? "Deshacer cambios" : "Limpiar formulario";

    if (isEdit) {
        try {
            const pet = state.pets.find(p => p.id === id) || await api(`/api/pets/${id}`);
            petForm.editing = pet;
            setEspecie(pet.especie);
            petFields.color.value = pet.color || "";
            petFields.edad.value = pet.edad ?? "";
            petFields.sexo.value = ["macho", "hembra"].includes(normalize(pet.sexo)) ? normalize(pet.sexo) : "";
        } catch (error) {
            toast(error.status === 404 ? "Esa mascota ya no existe." : error.message, "error");
            location.hash = "#mascotas";
            return;
        }
    }

    // Fotos actuales (solo edición)
    const current = existingImages();
    $("#current-photos").hidden = !isEdit || current.length === 0;
    $("#current-photos-list").innerHTML = current.map((src, i) => `
        <div class="thumb">
            <img src="${esc(src)}" alt="Foto actual ${i + 1}" data-fallback="pet">
            <span class="thumb__badge">Actual</span>
        </div>`).join("");

    syncSelectPlaceholder();
    updatePetLimit();
    renderPetPreview();
}

$("[data-form-reset]", petForm.el).addEventListener("click", () => {
    openPetForm(petForm.editing ? petForm.editing.id : null);
});

petForm.el.addEventListener("submit", async event => {

    event.preventDefault();
    resetFormErrors(petForm.el);

    const editing = petForm.editing;
    const especie = especieValue();
    const color = petFields.color.value.trim();
    const edad = petFields.edad.value.trim();
    const sexo = petFields.sexo.value;

    let valid = true;
    if (!especie) valid = fieldError(petFields.especie.value === "__otra" ? petFields.especieOtra : petFields.especie, "Elige o escribe la especie.");
    if (!color) valid = fieldError(petFields.color, "Escribe el color.");
    if (edad === "") valid = fieldError(petFields.edad, "Escribe la edad en años.");
    else if (!/^\d+$/.test(edad)) valid = fieldError(petFields.edad, "La edad debe ser un número entero (0 o más).");
    if (!sexo) valid = fieldError(petFields.sexo, "Elige macho o hembra.");

    if (!valid) {
        $(".has-error input, .has-error select", petForm.el)?.focus();
        return;
    }

    const data = new FormData();
    data.append("especie", especie);
    data.append("color", color);
    data.append("edad", edad);
    data.append("sexo", sexo);
    petForm.dz.files.forEach(file => data.append("img", file));
    if (editing && replaceToggle.checked && petForm.dz.files.length) {
        data.append("replaceImages", "true");
    }

    const button = $("#submit-mascota");
    button.disabled = true;

    try {
        const result = await api(editing ? `/api/pets/${editing.id}` : "/api/pets", {
            method: editing ? "PUT" : "POST",
            body: data
        });

        toast(editing ? "Mascota actualizada correctamente" : `Mascota registrada (${capitalize(especie)}). ¡Una huella más!`);

        await loadData();
        state.highlight = { kind: "mascotas", id: result.pet?.id ?? editing?.id };
        state.query.mascotas = "";
        $("#search-mascotas").value = "";
        petForm.dz.clear(false);
        petForm.el.reset();
        location.hash = "#mascotas";

    } catch (error) {
        showFormError(petForm.el, error.message);
    } finally {
        button.disabled = false;
    }
});


// ---------- Errores de formulario ----------

function fieldError(input, message) {
    const field = input.closest(".field");
    field.classList.add("has-error");
    $(".field__error", field).textContent = message;
    return false;
}

function clearFieldError(input) {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.remove("has-error");
    const error = $(".field__error", field);
    if (error) error.textContent = "";
}

function showFormError(form, message) {
    const box = $(".form-error", form);
    box.innerHTML = `${icon("alert")}<span>${esc(message)}</span>`;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetFormErrors(form) {
    $$(".field.has-error", form).forEach(field => field.classList.remove("has-error"));
    $$(".field__error", form).forEach(el => (el.textContent = ""));
    $(".form-error", form).hidden = true;
}


// =============================================
// EVENTOS GLOBALES (delegación)
// =============================================

document.addEventListener("click", event => {

    // Flechas de la galería
    const nav = event.target.closest(".gallery__nav");
    if (nav) {
        event.stopPropagation();
        const gallery = nav.closest(".gallery");
        setGalleryIndex(gallery, Number(gallery.dataset.index) + Number(nav.dataset.dir));
        return;
    }

    // Miniaturas de la ficha
    const thumb = event.target.closest("[data-thumb]");
    if (thumb) {
        const gallery = $("#ficha-content .gallery");
        setGalleryIndex(gallery, Number(thumb.dataset.thumb));
        return;
    }

    // Cerrar modales
    const closer = event.target.closest("[data-close]");
    if (closer) {
        closeModal(closer.closest(".modal"));
        if (closer.tagName !== "A") return;
    }

    // Cambiar vista tarjetas/lista
    const viewBtn = event.target.closest("[data-viewmode]");
    if (viewBtn) {
        const kind = viewBtn.dataset.target;
        state.viewMode[kind] = viewBtn.dataset.viewmode;
        storageSet(`pm-view-${kind}`, viewBtn.dataset.viewmode);
        renderList(kind);
        return;
    }

    // Acciones sobre registros
    const action = event.target.closest("[data-action]");
    if (action) {
        const { kind } = action.dataset;
        const id = Number(action.dataset.id);
        const records = kind === "usuarios" ? state.users : state.pets;
        const record = records.find(r => r.id === id) ||
            (state.idSearch[kind]?.result?.id === id ? state.idSearch[kind].result : null);

        switch (action.dataset.action) {
            case "open":
                if (record) kind === "usuarios" ? openUserFicha(record) : openPetFicha(record);
                break;
            case "delete":
                if (record) askDelete(kind, record);
                break;
            case "clear-search":
                state.query[kind] = "";
                $(`#search-${kind}`).value = "";
                renderList(kind);
                break;
            case "retry":
                route();
                break;
        }
        return;
    }

    // Clic en la tarjeta o fila (fuera de botones/enlaces) abre la ficha
    const card = event.target.closest("[data-open]");
    if (card && !event.target.closest("a, button")) {
        const kind = card.dataset.open;
        const id = Number(card.dataset.id);
        const records = kind === "usuarios" ? state.users : state.pets;
        const record = records.find(r => r.id === id) || state.idSearch[kind]?.result;
        if (record) kind === "usuarios" ? openUserFicha(record) : openPetFicha(record);
    }
});


// =============================================
// NAVEGACIÓN (rutas con #)
// =============================================

const ROUTES = {
    "inicio": {
        view: "inicio",
        nav: "inicio",
        title: "Cada historia empieza con una huella",
        subtitle: "Registra usuarios y mascotas en un solo lugar."
    },
    "usuarios": {
        view: "usuarios",
        nav: "usuarios",
        title: "Usuarios",
        subtitle: "Las personas detrás de cada huella."
    },
    "mascotas": {
        view: "mascotas",
        nav: "mascotas",
        title: "Mascotas",
        subtitle: "Cada una con su historia y sus fotos."
    },
    "nuevo-usuario": {
        view: "form-usuario",
        nav: "usuarios",
        title: "Registrar usuario",
        subtitle: "Llena los datos y mira cómo queda su tarjeta."
    },
    "editar-usuario": {
        view: "form-usuario",
        nav: "usuarios",
        title: "Editar usuario",
        subtitle: "Los cambios se ven al instante en la vista previa."
    },
    "nueva-mascota": {
        view: "form-mascota",
        nav: "mascotas",
        title: "Registrar mascota",
        subtitle: "Llena los datos y mira cómo queda su tarjeta."
    },
    "editar-mascota": {
        view: "form-mascota",
        nav: "mascotas",
        title: "Editar mascota",
        subtitle: "Los cambios se ven al instante en la vista previa."
    }
};

function parseHash() {
    const [name, rawId] = location.hash.replace(/^#\/?/, "").split("/");
    const id = Number(rawId);
    return {
        name: name || "inicio",
        id: Number.isInteger(id) && id > 0 ? id : null
    };
}

function showView(config) {

    $$(".view").forEach(view => {
        view.hidden = view.id !== `view-${config.view}`;
    });

    $$(".nav__link").forEach(link => {
        const active = link.dataset.nav === config.nav;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });

    $("#page-title").textContent = config.title;
    $("#page-subtitle").textContent = config.subtitle;
    document.title = `${config.title} | API Pet Manager`;
}

async function route() {

    const { name, id } = parseHash();
    const config = ROUTES[name];

    if (!config || (name.startsWith("editar") && !id)) {
        location.hash = "#inicio";
        return;
    }

    const previous = state.currentRoute;
    state.currentRoute = name;

    closeModal($("#modal-ficha"));
    showView(config);

    if (previous !== name) {
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    }

    try {
        switch (name) {

            case "inicio":
                if (!state.loaded) await loadData();
                renderHome();
                break;

            case "usuarios":
            case "mascotas": {
                // Al entrar a la sección se muestra la animación de carga
                // (persona que gira o huella) antes de la información.
                const container = $(`#list-${name}`);
                if (previous !== name) {
                    container.innerHTML = loaderHTML(name);
                    await Promise.all([loadData(), wait(750)]);
                } else if (!state.loaded) {
                    await loadData();
                }
                renderList(name);
                break;
            }

            case "nuevo-usuario":
                await openUserForm();
                break;

            case "editar-usuario":
                if (!state.loaded) await loadData();
                await openUserForm(id);
                break;

            case "nueva-mascota":
                await openPetForm();
                break;

            case "editar-mascota":
                if (!state.loaded) await loadData();
                await openPetForm(id);
                break;
        }
    } catch (error) {
        const target = name === "usuarios" || name === "mascotas" ? $(`#list-${name}`) : null;
        if (target) target.innerHTML = errorHTML(error.message);
        toast(error.message, "error");
    }
}

function refreshCurrentView() {
    const { name } = parseHash();
    if (name === "inicio") renderHome();
    if (name === "usuarios" || name === "mascotas") renderList(name);
}


// =============================================
// ARRANQUE
// =============================================

hydrateIcons();
window.addEventListener("hashchange", route);
route();

// Contadores del encabezado aunque se entre directo a un formulario
if (!state.loaded) {
    loadData().catch(() => {});
}
