import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);



app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);




app.use(
    "/api/users",
    usersRouter
);

app.use(
    "/api/pets",
    petsRouter
);


app.get("/api", (req, res) => {

    res.status(200).json({
        message:
            "API funcionando correctamente"
    });

});




app.use((req, res) => {

    res.status(404).json({
        error:
            "Ruta no encontrada"
    });

});



app.use(
    (err, req, res, next) => {

        // Errores de multer (demasiados archivos,
        // archivo muy grande, campo incorrecto, etc.)
        if (
            err instanceof
            multer.MulterError
        ) {

            const multerMessages = {
                LIMIT_FILE_SIZE:
                    "La imagen supera el tamaño máximo de 5 MB",
                LIMIT_UNEXPECTED_FILE:
                    "Campo de archivo no permitido o se superó el máximo de imágenes (5)",
                LIMIT_FILE_COUNT:
                    "Se superó el número máximo de archivos"
            };

            return res
                .status(400)
                .json({
                    error:
                        multerMessages[err.code] ||
                        err.message
                });
        }

        // Archivo que no es imagen (fileFilter)
        // o JSON mal formado en el cuerpo
        if (
            err.status === 400 ||
            err.type === "entity.parse.failed"
        ) {

            return res
                .status(400)
                .json({
                    error:
                        err.type === "entity.parse.failed"
                            ? "El cuerpo de la petición no es un JSON válido"
                            : err.message
                });
        }

        console.error(err);

        res.status(500).json({
            error:
                "Error interno del servicio"
        });
    }
);



const port =
    process.env.PORT || 8080;



if (
    process.env.NODE_ENV !==
    "production"
) {

    app.listen(port, () => {

        console.log(
            `Servidor ejecutándose en http://localhost:${port}`
        );

    });

}




export default app;