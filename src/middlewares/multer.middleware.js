import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// =======================================
// CONFIGURACIÓN GENERAL
// =======================================

// Tamaño máximo por imagen: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Formatos de imagen permitidos
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif"
];


// Crea la carpeta de destino si no existe
// (git no guarda carpetas vacías, así que
// public/img/users o public/img/pets podrían faltar).
function createDestination(folder) {

    return async function (req, file, cb) {

        const destination = path.join(
            __dirname,
            "../../public/img",
            folder
        );

        try {
            await fs.mkdir(destination, { recursive: true });

            cb(null, destination);

        } catch (error) {
            cb(error);
        }

    };

}


// Renombra el archivo para evitar colisiones:
// prefijo-fecha-aleatorio.extensión
function createFilename(prefix) {

    return function (req, file, cb) {

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const random = crypto
            .randomBytes(6)
            .toString("hex");

        const filename =
            `${prefix}-${Date.now()}-${random}${extension}`;

        cb(null, filename);

    };

}


// Solo acepta imágenes
function imageFilter(req, file, cb) {

    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(null, true);
    }

    const error = new Error(
        "Solo se permiten imágenes (jpg, png, webp, gif o avif)"
    );

    error.status = 400;

    cb(error);

}


// =======================================
// STORAGE (multer.diskStorage)
// =======================================

const usersStorage = multer.diskStorage({

    destination: createDestination("users"),

    filename: createFilename("avatar")

});


const petsStorage = multer.diskStorage({

    destination: createDestination("pets"),

    filename: createFilename("pet")

});


// =======================================
// MIDDLEWARES DE CARGA
// =======================================

const uploadUser = multer({
    storage: usersStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

const uploadPet = multer({
    storage: petsStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});


export {
    uploadUser,
    uploadPet
};
