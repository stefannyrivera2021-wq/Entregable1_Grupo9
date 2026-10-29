// =============================================
// RUTAS DE ALMACENAMIENTO
// En tu computador: src/data y public/img (como pide el enunciado).
// En Vercel el disco es de solo lectura, excepto /tmp, así que allí
// los JSON y las imágenes subidas se guardan en /tmp (son temporales).
// =============================================

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel define automáticamente la variable VERCEL=1
export const IS_VERCEL = Boolean(process.env.VERCEL);

const PUBLIC_DIR = path.join(__dirname, "../../public");
const TMP_DIR = "/tmp/api-pet-manager";

export const TMP_IMG_DIR = path.join(TMP_DIR, "img");

// Archivos JSON originales del proyecto
const DATA_FILES = {
    "users.json": path.join(__dirname, "../data/users.json"),
    "pets.json": path.join(__dirname, "../data/pets.json")
};


// Devuelve la ruta del JSON donde se lee y escribe.
// En Vercel, la primera vez copia el JSON original a /tmp.
export async function getDataFile(name) {

    const original = DATA_FILES[name];

    if (!IS_VERCEL) {
        return original;
    }

    const target = path.join(TMP_DIR, "data", name);

    try {
        await fs.access(target);
    } catch {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(original, target);
    }

    return target;
}


// Carpeta donde multer guarda las imágenes ("users" o "pets")
export function getUploadDir(folder) {

    return IS_VERCEL
        ? path.join(TMP_IMG_DIR, folder)
        : path.join(PUBLIC_DIR, "img", folder);
}


// Ruta física de una imagen a partir de su URL ("/img/users/x.png")
export function getUploadedFilePath(fileUrl) {

    const relative = fileUrl.replace(/^\/+/, "");

    return IS_VERCEL
        ? path.join(TMP_DIR, relative)
        : path.join(PUBLIC_DIR, relative);
}
