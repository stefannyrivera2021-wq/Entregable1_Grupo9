import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
    uploadUser
} from "../middlewares/multer.middleware.js";

import {
    getDataFile,
    getUploadedFilePath
} from "../utils/storage.js";

import {
    hashPassword
} from "../utils/crypto.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

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


// La contraseña no se recorta para no alterarla,
// pero debe ser texto y no solo espacios.
function getPassword(value) {

    return typeof value === "string" &&
        value.trim()
        ? value
        : "";
}


async function readUsers() {

    const data =
        await fs.readFile(
            await getDataFile("users.json"),
            "utf8"
        );

    if (!data.trim()) {
        return [];
    }

    return JSON.parse(data);
}


async function writeUsers(users) {

    await fs.writeFile(
        await getDataFile("users.json"),
        JSON.stringify(
            users,
            null,
            2
        ),
        "utf8"
    );
}


function hidePassword(user) {

    const {
        password,
        ...safeUser
    } = user;

    return safeUser;
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
            `No se pudo eliminar: ${fileUrl}`
        );
    }
}


async function deleteUploadedFile(file) {

    if (!file) {
        return;
    }

    try {

        await fs.unlink(
            file.path
        );

    } catch (error) {

        console.log(
            "No se pudo eliminar el archivo temporal"
        );
    }
}


// =======================================
// GET /api/users
// =======================================

router.get(
    "/",
    async (req, res) => {

        try {

            const users =
                await readUsers();

            const safeUsers =
                users.map(
                    hidePassword
                );

            res
                .status(200)
                .json(safeUsers);

        } catch (error) {

            console.error(error);

            res
                .status(500)
                .json({
                    error:
                        "Error al leer los usuarios"
                });
        }
    }
);


// =======================================
// GET /api/users/:id
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
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const users =
                await readUsers();


            const user =
                users.find(
                    user =>
                        user.id === id
                );


            if (!user) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Usuario no encontrado"
                    });
            }


            res
                .status(200)
                .json(
                    hidePassword(
                        user
                    )
                );

        } catch (error) {

            console.error(error);

            res
                .status(500)
                .json({
                    error:
                        "Error al consultar el usuario"
                });
        }
    }
);


// =======================================
// POST /api/users
// =======================================

router.post(
    "/",

    uploadUser.single(
        "avatar"
    ),

    async (req, res) => {

        try {

            const body =
                req.body ?? {};

            const firstname =
                toText(body.firstname);

            const lastname =
                toText(body.lastname);

            const username =
                toText(body.username);

            const password =
                getPassword(body.password);


            if (
                !firstname ||
                !lastname ||
                !username ||
                !password
            ) {

                await deleteUploadedFile(
                    req.file
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "Firstname, lastname, username y password son obligatorios"
                    });
            }


            const users =
                await readUsers();


            const usernameExists =
                users.some(
                    user =>
                        user.username
                            .toLowerCase() ===
                        username
                            .trim()
                            .toLowerCase()
                );


            if (usernameExists) {

                await deleteUploadedFile(
                    req.file
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "El username ya está registrado"
                    });
            }


            const newId =
                users.length === 0
                    ? 1
                    : Math.max(
                        ...users.map(
                            user =>
                                user.id
                        )
                    ) + 1;


            const hashedPassword =
                await hashPassword(
                    password
                );


            const newUser = {

                id:
                    newId,

                firstname:
                    firstname.trim(),

                lastname:
                    lastname.trim(),

                username:
                    username.trim(),

                password:
                    hashedPassword,

                avatar:
                    req.file
                        ? `/img/users/${req.file.filename}`
                        : null
            };


            users.push(
                newUser
            );


            await writeUsers(
                users
            );


            res
                .status(201)
                .json({

                    message:
                        "Usuario creado correctamente",

                    user:
                        hidePassword(
                            newUser
                        )
                });

        } catch (error) {

            console.error(error);

            await deleteUploadedFile(
                req.file
            );

            res
                .status(500)
                .json({
                    error:
                        "Error al crear el usuario"
                });
        }
    }
);


// =======================================
// PUT /api/users/:id
// =======================================

router.put(
    "/:id",

    uploadUser.single("avatar"),

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

                await deleteUploadedFile(
                    req.file
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const users =
                await readUsers();


            const index =
                users.findIndex(
                    user =>
                        user.id === id
                );


            // Usuario no existe
            if (index === -1) {

                await deleteUploadedFile(
                    req.file
                );

                return res
                    .status(404)
                    .json({
                        error:
                            "Usuario no encontrado"
                    });
            }


            const currentUser =
                users[index];


            // Validar que realmente llegue algo para actualizar
            const hasData =
                toText(body.firstname) ||
                toText(body.lastname) ||
                toText(body.username) ||
                getPassword(body.password) ||
                req.file;


            if (!hasData) {

                await deleteUploadedFile(
                    req.file
                );

                return res
                    .status(400)
                    .json({
                        error:
                            "Debes enviar al menos un campo para actualizar"
                    });
            }


            // Validar username duplicado
            if (toText(body.username)) {

                const newUsername =
                    toText(body.username);


                const usernameExists =
                    users.some(
                        user =>
                            user.id !== id &&
                            user.username
                                .toLowerCase() ===
                            newUsername
                                .toLowerCase()
                    );


                if (usernameExists) {

                    await deleteUploadedFile(
                        req.file
                    );

                    return res
                        .status(400)
                        .json({
                            error:
                                "El username ya está registrado"
                        });
                }
            }


            // Contraseña
            let newPassword =
                currentUser.password;


            if (getPassword(body.password)) {

                newPassword =
                    await hashPassword(
                        body.password
                    );
            }


            // Avatar
            const newAvatar =
                req.file
                    ? `/img/users/${req.file.filename}`
                    : currentUser.avatar;


            // Usuario actualizado
            const updatedUser = {

                ...currentUser,

                firstname:
                    toText(body.firstname) ||
                    currentUser.firstname,

                lastname:
                    toText(body.lastname) ||
                    currentUser.lastname,

                username:
                    toText(body.username) ||
                    currentUser.username,

                password:
                    newPassword,

                avatar:
                    newAvatar
            };


            users[index] =
                updatedUser;


            await writeUsers(
                users
            );


            // Eliminar avatar anterior
            if (
                req.file &&
                currentUser.avatar
            ) {

                await deleteFileSafe(
                    currentUser.avatar
                );
            }


            return res
                .status(200)
                .json({

                    message:
                        "Usuario actualizado correctamente",

                    user:
                        hidePassword(
                            updatedUser
                        )
                });

        } catch (error) {

            console.error(error);


            await deleteUploadedFile(
                req.file
            );


            return res
                .status(500)
                .json({
                    error:
                        "Error al actualizar el usuario"
                });
        }
    }
);

// =======================================
// DELETE /api/users/:id
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
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "ID inválido"
                    });
            }


            const users =
                await readUsers();


            const index =
                users.findIndex(
                    user =>
                        user.id === id
                );


            if (index === -1) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Usuario no encontrado"
                    });
            }


            const deletedUser =
                users[index];


            users.splice(
                index,
                1
            );


            await writeUsers(
                users
            );


            if (
                deletedUser.avatar
            ) {

                await deleteFileSafe(
                    deletedUser.avatar
                );
            }


            res
                .status(200)
                .json({
                    message:
                        "Usuario eliminado correctamente"
                });

        } catch (error) {

            console.error(error);

            res
                .status(500)
                .json({
                    error:
                        "Error al eliminar el usuario"
                });
        }
    }
);


export default router;