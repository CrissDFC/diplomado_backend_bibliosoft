# Diseño de integración Full Stack de SIGEB

## Objetivo

Construir una API REST para SIGEB en Node.js y Express, persistida en PostgreSQL mediante Sequelize, e integrar el frontend React existente sin reemplazar sus componentes funcionales.

## Decisiones de alcance

- El backend y la integración del frontend forman parte de esta implementación.
- La autenticación se realizará con correo, contraseña cifrada y JWT.
- La autorización será por roles: administrador, bibliotecario y lector.
- El registro público siempre creará lectores activos.
- Los administradores gestionan usuarios, libros y préstamos.
- Los bibliotecarios gestionan libros y préstamos, pero no usuarios.
- Los lectores consultan el catálogo y únicamente sus propios préstamos.
- La eliminación de usuarios y libros será lógica. Los préstamos activos podrán cancelarse, pero no se borrarán físicamente.

## Arquitectura

El backend seguirá la arquitectura por capas utilizada en `biblioteca-api`: configuración, modelos, servicios, controladores, rutas y middlewares. Sequelize será la única capa de persistencia; no se mezclarán modelos Sequelize con consultas directas mediante `pg`.

La API se publicará bajo `/api`. Los servicios concentrarán las reglas del negocio y los controladores traducirán sus resultados a respuestas HTTP. Un middleware central transformará errores de validación, autenticación, autorización, recursos inexistentes, conflictos y fallos internos.

El frontend conservará sus formularios, tablas, filtros y páginas. Un helper común de HTTP agregará el JWT, interpretará errores y será utilizado por los servicios de autenticación, libros, usuarios y préstamos.

## Modelo relacional

### Roles

- `id`: llave primaria entera.
- `name`: nombre único (`admin`, `librarian`, `reader`).
- `description`: descripción opcional.

### Users

- `id`: llave primaria entera.
- `name`: nombre completo.
- `email`: correo único.
- `password`: hash bcrypt.
- `role_id`: llave foránea hacia roles.
- `status`: `0` inactivo, `1` activo.
- Fechas de creación y actualización.

### Books

- `id`: llave primaria entera.
- `title`, `author`, `isbn`, `category`, `publisher`, `year`, `description`.
- `total_copies` y `available_copies` con restricciones de cantidad.
- `status`: `0` inactivo, `1` disponible, `2` no disponible.
- ISBN único y fechas de auditoría.

### Loans

- `id`: llave primaria entera.
- `book_id` y `user_id` como llaves foráneas.
- `loan_date`, `due_date` y `return_date`.
- `status`: `0` cancelado, `1` activo, `2` devuelto, `3` vencido.
- Fechas de auditoría.

Un rol tiene muchos usuarios; un usuario y un libro tienen muchos préstamos. Las llaves foráneas restringen eliminaciones físicas.

## Contrato REST

### Autenticación

- `POST /api/auth/register`: registra un lector.
- `POST /api/auth/login`: devuelve `{ token, user }`.
- `GET /api/auth/me`: devuelve el usuario autenticado.

### Libros

- `GET /api/books` y `GET /api/books/:id`: cualquier usuario autenticado.
- `POST /api/books`: administrador o bibliotecario.
- `PUT /api/books/:id`: administrador o bibliotecario.
- `DELETE /api/books/:id`: inactivación lógica por administrador o bibliotecario.

### Usuarios

- `GET /api/users`: administrador o bibliotecario.
- `GET /api/users/:id`: personal autorizado o propietario.
- `POST`, `PUT` y `DELETE /api/users/:id`: solo administrador.

### Préstamos

- `GET /api/loans` y `GET /api/loans/:id`: todos para personal; únicamente propios para lectores.
- `POST /api/loans`: administrador o bibliotecario.
- `PUT /api/loans/:id`: actualiza la fecha límite.
- `PUT /api/loans/:id/return`: registra la devolución.
- `DELETE /api/loans/:id`: cancela un préstamo activo.

Los JSON conservarán los atributos en camelCase que consume React. Sequelize mapeará esos atributos a columnas snake_case.

## Reglas de negocio

- Solo usuarios activos pueden iniciar sesión o recibir préstamos.
- El correo y el ISBN no pueden repetirse.
- La contraseña pública debe tener al menos ocho caracteres e incluir mayúscula, minúscula y número.
- No se presta un libro inactivo, no disponible o sin ejemplares.
- Crear, devolver y cancelar préstamos actualiza existencias en una transacción.
- Un préstamo devuelto o cancelado no puede devolverse ni cancelarse nuevamente.
- Ninguna respuesta expone hashes de contraseña.

## Integración React

- Login y registro público conectados a la API.
- Sesión guardada en `localStorage`; `ProtectedRoute` valida la presencia y vigencia del JWT.
- Menús y acciones se muestran según el rol, sin reemplazar la validación del backend.
- Los servicios existentes usarán el helper HTTP común.
- Los flujos de préstamos dejarán de modificar libros con una segunda petición.
- Las acciones de inactivación usarán `DELETE`.
- Se reutilizarán `BookForm`, `LoanForm`, `UserForm`, tablas y filtros.
- Se incorporarán Navbar, Footer, Card, Button, Alert y Loader reutilizables, además de estilos responsive globales.

## Manejo de errores

La API responderá con `{ "message": "..." }` y, cuando corresponda, detalles de validación. Se usarán códigos `400`, `401`, `403`, `404`, `409` y `500`. Los errores internos no expondrán información sensible.

## Pruebas y verificación

La implementación seguirá ciclos de prueba fallida, código mínimo y prueba aprobada con `node:test`. Se probarán validadores, autenticación, autorización, controladores, rutas, errores y reglas transaccionales de préstamos. La verificación final incluirá pruebas y arranque del backend, lint y build del frontend, y migraciones cuando haya una instancia PostgreSQL disponible.

## Alcance de entregables externos

El código incluirá documentación de arquitectura, modelo, diccionario de datos, endpoints y README. El documento APA original, el enlace del repositorio remoto y el video requieren insumos o acciones externas que no existen actualmente en el workspace.
