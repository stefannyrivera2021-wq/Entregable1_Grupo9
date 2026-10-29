import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
    uploadPet
} from "../middlewares/multer.middleware.js";

import {
    getDataFile,
    getUploadedFilePath
} from "../utils/storage.js";


const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    path.dirname(
        __filename
    );


const router =
    express.Router();


// Los JSON se leen/escriben donde indique storage.js
// (src/data en local, /tmp en Vercel)


// =======================================
// FUNCIONES AUXILIARES
// =======================================

// Devuelve el texto sin espacios al inicio/final,
// o "" si el valor no es texto (evita errores 500
// cuando un campo llega como número, objeto o no llega).
function toText(value) {

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    return "";
}


// La edad debe ser un número entero mayor o igual a 0.
function isValidAge(age) {

    return Number.isInteger(age) &&
        age >= 0;
}


// Valores permitidos para el campo sexo.
const SEXOS_VALIDOS = [
    "macho",
    "hembra"
];

function isValidSex(sexo) {

    return SEXOS_VALIDOS.includes(sexo);
}



async function readPets() {

    const data =
        await fs.readFile(
            await getDataFile("pets.json"),
            "utf8"
        );


    if (!data.trim()) {
        return [];
    }


    return JSON.parse(
        data
    );
}


async function writePets(pets) {

    await fs.writeFile(
        await getDataFile("pets.json"),

        JSON.stringify(
            pets,
            null,
            2
        ),

        "utf8"
    );
}


function getPublicFilePath(fileUrl) {

    return getUploadedFilePath(fileUrl);
}


async function deleteFileSafe(fileUrl) {

    if (!fileUrl) {
        return;
    }


    try {

        await fs.unlink(
            getPublicFilePath(
                fileUrl
            )
        );

    } catch (error) {

        console.log(
            `No se pudo eliminar el archivo: ${fileUrl}`
        );
    }
}


async function deleteUploadedFiles(
    files = []
) {

    for (
        const file
        of files
    ) {

        try {

            await fs.unlink(
                file.path
            );

        } catch (error) {

            console.log(
                "No se pudo eliminar un archivo temporal"
            );
        }
    }
}


// =======================================
// GET /api/pets
// =======================================

router.get(
    "/",
    async (req, res) => {

        try {

            const pets =
                await readPets();


            res
                .status(200)
                .json(
                    pets
                );

        } catch (error) {

            console.error(
                error
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al leer las mascotas"
                });
        }
    }
);


// =======================================
// GET /api/pets/:id
// =======================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const pets =
                await readPets();


            const pet =
                pets.find(
                    pet =>
                        pet.id === id
                );


            if (!pet) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Mascota no encontrada"
                    });
            }


            res
                .status(200)
                .json(
                    pet
                );

        } catch (error) {

            console.error(
                error
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al consultar la mascota"
                });
        }
    }
);


// =======================================
// POST /api/pets
// =======================================

router.post(

    "/",

    uploadPet.array(
        "img",
        5
    ),

    async (req, res) => {

        try {

            const body =
                req.body ?? {};

            const especie =
                toText(body.especie);

            const color =
                toText(body.color);

            const edad =
                toText(body.edad);

            const sexo =
                toText(body.sexo).toLowerCase();


            if (
                !especie ||
                !color ||
                !edad ||
                !sexo
            ) {

                await deleteUploadedFiles(
                    req.files
                );


                return res
                    .status(400)
                    .json({
                        error:
                            "Especie, color, edad y sexo son obligatorios"
                    });
            }


            const numericAge =
                Number(
                    edad
                );


            if (!isValidAge(numericAge)) {

                await deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "La edad debe ser un número entero mayor o igual a 0"
                    });
            }


            if (!isValidSex(sexo)) {

                await deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "El sexo debe ser 'macho' o 'hembra'"
                    });
            }


            const pets =
                await readPets();


            const newId =
                pets.length === 0
                    ? 1
                    : Math.max(
                        ...pets.map(
                            pet =>
                                pet.id
                        )
                    ) + 1;


            const images =
                req.files

                    ? req.files.map(
                        file =>
                            `/img/pets/${file.filename}`
                    )

                    : [];


            const newPet = {

                id:
                    newId,

                especie:
                    especie.trim(),

                color:
                    color.trim(),

                edad:
                    numericAge,

                sexo:
                    sexo.trim(),

                img:
                    images
            };


            pets.push(
                newPet
            );


            await writePets(
                pets
            );


            res
                .status(201)
                .json({

                    message:
                        "Mascota creada correctamente",

                    pet:
                        newPet
                });

        } catch (error) {

            console.error(
                error
            );


            await deleteUploadedFiles(
                req.files || []
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al crear la mascota"
                });
        }
    }
);

// =======================================
// PUT /api/pets/:id
// =======================================

router.put(
    "/:id",

    uploadPet.array(
        "img",
        5
    ),

    async (req, res) => {

        try {

            const body =
                req.body ?? {};

            const id =
                Number(req.params.id);


            // Validar ID
            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                await deleteUploadedFiles(
                    req.files || []
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const pets =
                await readPets();


            const index =
                pets.findIndex(
                    pet =>
                        pet.id === id
                );


            // Mascota no existe
            if (index === -1) {

                await deleteUploadedFiles(
                    req.files || []
                );

                return res
                    .status(404)
                    .json({
                        error:
                            "Mascota no encontrada"
                    });
            }


            const currentPet =
                pets[index];


            // Validar que llegue algo para actualizar
            const hasData =
                toText(body.especie) ||
                toText(body.color) ||
                toText(body.edad) ||
                toText(body.sexo) ||
                (
                    req.files &&
                    req.files.length > 0
                );


            if (!hasData) {

                await deleteUploadedFiles(
                    req.files || []
                );


                return res
                    .status(400)
                    .json({
                        error:
                            "Debes enviar al menos un campo para actualizar"
                    });
            }


            // ===================================
            // EDAD
            // ===================================

            let newAge =
                currentPet.edad;


            if (toText(body.edad)) {

                newAge =
                    Number(
                        toText(body.edad)
                    );


                if (!isValidAge(newAge)) {

                    await deleteUploadedFiles(
                        req.files || []
                    );

                    return res
                        .status(400)
                        .json({
                            error:
                                "La edad debe ser un número entero mayor o igual a 0"
                        });
                }
            }


            // ===================================
            // SEXO
            // ===================================

            let newSex =
                currentPet.sexo;


            if (toText(body.sexo)) {

                newSex =
                    toText(body.sexo).toLowerCase();


                if (!isValidSex(newSex)) {

                    await deleteUploadedFiles(
                        req.files || []
                    );

                    return res
                        .status(400)
                        .json({
                            error:
                                "El sexo debe ser 'macho' o 'hembra'"
                        });
                }
            }


            // ===================================
            // IMÁGENES NUEVAS
            // ===================================

            const newUploadedImages =
                (
                    req.files || []
                ).map(
                    file =>
                        `/img/pets/${file.filename}`
                );


            const hasNewImages =
                newUploadedImages.length > 0;


            const replaceImages =
                body.replaceImages ===
                "true";


            let newImages =
                Array.isArray(
                    currentPet.img
                )
                    ? [
                        ...currentPet.img
                    ]
                    : [];


            // Si llegan nuevas imágenes:
            // replaceImages = true -> reemplaza
            // replaceImages = false -> agrega
            if (hasNewImages) {

                if (replaceImages) {

                    newImages =
                        newUploadedImages;

                } else {

                    newImages = [
                        ...newImages,
                        ...newUploadedImages
                    ];
                }
            }


            // Máximo 5 imágenes
            if (
                newImages.length > 5
            ) {

                await deleteUploadedFiles(
                    req.files || []
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "Una mascota puede tener máximo 5 imágenes"
                    });
            }


            // ===================================
            // OBJETO ACTUALIZADO
            // ===================================

            const updatedPet = {

                ...currentPet,

                especie:
                    toText(body.especie) ||
                    currentPet.especie,

                color:
                    toText(body.color) ||
                    currentPet.color,

                edad:
                    newAge,

                sexo:
                    newSex,

                img:
                    newImages
            };


            pets[index] =
                updatedPet;


            await writePets(
                pets
            );


            // Si se reemplazaron imágenes,
            // eliminar las anteriores físicamente
            if (
                hasNewImages &&
                replaceImages
            ) {

                for (
                    const image
                    of currentPet.img || []
                ) {

                    await deleteFileSafe(
                        image
                    );
                }
            }


            return res
                .status(200)
                .json({

                    message:
                        "Mascota actualizada correctamente",

                    pet:
                        updatedPet
                });

        } catch (error) {

            console.error(error);


            await deleteUploadedFiles(
                req.files || []
            );


            return res
                .status(500)
                .json({
                    error:
                        "Error al actualizar la mascota"
                });
        }
    }
);

// =======================================
// DELETE /api/pets/:id
// =======================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const pets =
                await readPets();


            const index =
                pets.findIndex(
                    pet =>
                        pet.id === id
                );


            if (
                index === -1
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Mascota no encontrada"
                    });
            }


            const deletedPet =
                pets[index];


            pets.splice(
                index,
                1
            );


            await writePets(
                pets
            );


            for (
                const image
                of (
                    deletedPet.img ||
                    []
                )
            ) {

                await deleteFileSafe(
                    image
                );
            }


            res
                .status(200)
                .json({
                    message:
                        "Mascota eliminada correctamente"
                });

        } catch (error) {

            console.error(
                error
            );


            res
                .status(500)
                .json({
                    error:
                        "Error al eliminar la mascota"
                });
        }
    }
);


export default router;