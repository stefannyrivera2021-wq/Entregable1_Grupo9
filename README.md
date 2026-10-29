# API REST - Usuarios y Mascotas

## Descripción

Proyecto desarrollado en Node.js con Express para gestionar usuarios y mascotas mediante una API REST.

La información se almacena localmente en archivos JSON y se utiliza Multer para la carga de imágenes.

El proyecto implementa persistencia asíncrona, hashing de contraseñas, carga de archivos y acceso a archivos estáticos.

## Tecnologías utilizadas

- Node.js
- Express.js
- Multer
- fs.promises
- Crypto
- JSON
- HTML
- Postman

## Estructura del proyecto

```text
├── public/
│   ├── index.html        (panel web)
│   ├── css/styles.css
│   ├── js/app.js
│   └── img/
│       ├── ui/           (ilustraciones del panel)
│       ├── users/
│       └── pets/
│
├── src/
│   ├── app.js
│   ├── middlewares/
│   │   └── multer.middleware.js
│   ├── routes/
│   │   ├── users.router.js
│   │   └── pets.router.js
│   ├── utils/
│   │   ├── crypto.js
│   │   └── storage.js    (rutas de guardado: local o Vercel)
│   └── data/
│       ├── users.json
│       └── pets.json
│
├── package.json
└── README.md
```

## Instalación

Clonar o descargar el proyecto y abrir una terminal dentro de la carpeta principal.

Instalar las dependencias:

```bash
npm install
```

## Ejecutar el proyecto

Ejecutar:

```bash
npm start
```

(equivale a `node src/app.js`). Para desarrollo, con reinicio automático al guardar cambios:

```bash
npm run dev
```

El servidor se inicia en:

```text
http://localhost:8080
```

## Archivos estáticos

La carpeta `public` se encuentra configurada mediante `express.static`.

Las imágenes almacenadas pueden consultarse directamente desde el navegador.

Ejemplo:

```text
http://localhost:8080/img/users/avatar-nombre.png
```

## Endpoints de usuarios

### Obtener todos los usuarios

```http
GET /api/users
```

Retorna todos los usuarios sin mostrar sus contraseñas.

### Obtener usuario por ID

```http
GET /api/users/:id
```

Ejemplo:

```text
GET http://localhost:8080/api/users/1
```

### Crear usuario

```http
POST /api/users
```

La petición debe utilizar `multipart/form-data`.

Campos:

```text
firstname
lastname
username
password
avatar
```

El campo `avatar` debe enviarse como archivo (opcional).

Validaciones:

- `firstname`, `lastname`, `username` y `password` son obligatorios.
- El `username` no puede estar repetido.
- `avatar` solo acepta imágenes (jpg, png, webp, gif o avif) de máximo 5 MB.

La contraseña es procesada con el módulo `crypto` antes de almacenarse.

### Actualizar usuario

```http
PUT /api/users/:id
```

Permite modificar:

```text
firstname
lastname
username
password
avatar
```

Si se modifica la contraseña, esta se procesa nuevamente mediante hashing.

Si se proporciona un nuevo avatar, se reemplaza el archivo anterior.

### Eliminar usuario

```http
DELETE /api/users/:id
```

Elimina el usuario correspondiente del archivo `users.json`.

## Endpoints de mascotas

### Obtener todas las mascotas

```http
GET /api/pets
```

### Obtener mascota por ID

```http
GET /api/pets/:id
```

Ejemplo:

```text
GET http://localhost:8080/api/pets/1
```

### Crear mascota

```http
POST /api/pets
```

La petición debe utilizar `multipart/form-data`.

Campos:

```text
especie
color
edad
sexo
img
```

El campo `img` permite cargar hasta cinco imágenes.

Validaciones:

- `especie`, `color`, `edad` y `sexo` son obligatorios.
- `edad` debe ser un número entero mayor o igual a 0.
- `sexo` debe ser `macho` o `hembra`.
- `img` solo acepta imágenes (jpg, png, webp, gif o avif) de máximo 5 MB cada una.

### Actualizar mascota

```http
PUT /api/pets/:id
```

Permite actualizar los datos de la mascota y sus imágenes. Todos los campos son opcionales; solo se modifican los que se envían.

Campos (`multipart/form-data`):

```text
especie
color
edad
sexo
img            (hasta 5 imágenes)
replaceImages  ("true" para reemplazar las imágenes actuales)
```

- Si se envían imágenes sin `replaceImages`, se **agregan** a las existentes.
- Si se envía `replaceImages=true`, las imágenes nuevas **reemplazan** a las anteriores y los archivos viejos se eliminan de `public/img/pets`.
- Una mascota puede tener como máximo 5 imágenes en total.

### Eliminar mascota

```http
DELETE /api/pets/:id
```

Elimina la mascota correspondiente del archivo `pets.json`.

## Persistencia

La información de los usuarios se almacena en:

```text
src/data/users.json
```

La información de las mascotas se almacena en:

```text
src/data/pets.json
```

Las operaciones de lectura y escritura se realizan utilizando `fs.promises` junto con `async/await`.

## Seguridad

Las contraseñas no se almacenan en texto plano.

Se utiliza el módulo nativo `crypto` de Node.js para realizar el hashing de las contraseñas.

Además, las respuestas de las solicitudes GET de usuarios no incluyen el campo `password`.

## Carga de imágenes

La carga de archivos se realiza mediante Multer utilizando:

```javascript
multer.diskStorage()
```

Los avatares de usuarios se almacenan en:

```text
public/img/users
```

Las imágenes de mascotas se almacenan en:

```text
public/img/pets
```

## Códigos de estado HTTP

El proyecto utiliza los siguientes códigos:

```text
200 OK
Consultas, actualizaciones y eliminaciones exitosas.

201 Created
Creación exitosa de usuarios o mascotas.

400 Bad Request
Datos faltantes o inválidos.

404 Not Found
Usuario, mascota o ruta no encontrada.

500 Internal Server Error
Error interno o problemas de lectura/escritura.
```

## Panel web

Al abrir `http://localhost:8080` se carga un panel que consume la API:

- **Inicio:** resumen, accesos para registrar usuario o mascota y tarjetas que giran (al pasar el mouse o al tocarlas) mostrando los últimos registros.
- **Usuarios y Mascotas:** vista de tarjetas o de lista, búsqueda por texto y búsqueda por ID (usa `GET /api/users/:id` y `GET /api/pets/:id`).
- **Galería:** flechas en cada tarjeta de mascota para recorrer sus fotos sin abrir la ficha.
- **Formularios con vista previa:** a la izquierda los campos y a la derecha cómo quedará la tarjeta.
- **Zona para arrastrar fotos:** miniaturas, contador y opción para quitar fotos antes de guardar.
- **Confirmación al eliminar:** ventana propia con la foto del registro.
- **Animaciones puntuales:** huella animada mientras cargan las mascotas, persona que gira mientras cargan los usuarios y un perrito que se asoma cuando no hay resultados.

## Pruebas

Los endpoints de la API pueden probarse utilizando Postman (en *Body* elegir `form-data` y marcar como *File* los campos `avatar` e `img`) o desde el panel web.

## Despliegue en Vercel

El proyecto se despliega en Vercel sin configuración adicional: Vercel detecta Express en `src/app.js` (exportado con `export default app`) y sirve la carpeta `public/` desde su CDN.

1. Entrar a [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. **Add New → Project** e importar este repositorio.
3. Dejar la configuración por defecto (*Framework Preset: Express*) y presionar **Deploy**.

**Importante:** en Vercel el sistema de archivos es de solo lectura, excepto la carpeta temporal `/tmp`. Por eso `src/utils/storage.js` hace que, solo en Vercel, los JSON y las imágenes subidas se guarden en `/tmp`. La API funciona completa (crear, editar y eliminar), pero esos cambios son **temporales**: se pierden cuando Vercel reinicia la función o se hace un nuevo despliegue, y se vuelve a los datos originales del repositorio. En local (`npm start`) todo se guarda de forma permanente en `src/data` y `public/img`, como pide el enunciado.

## Autores

Grupo 9

- Nombre Apellido
- Nombre Apellido
- Nombre Apellido