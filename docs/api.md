# API REST de SIGEB

Base URL local: `http://localhost:3000/api`

Las rutas privadas requieren:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

## Respuestas y errores

Las respuestas exitosas contienen el recurso o arreglo solicitado. Los errores usan:

```json
{ "message": "Descripción clara del error" }
```

| Código | Uso |
|---:|---|
| 200 | Consulta o actualización exitosa |
| 201 | Recurso creado |
| 400 | Formato o validación inválida |
| 401 | Sesión ausente, inválida o expirada |
| 403 | Rol o propiedad insuficiente |
| 404 | Recurso o ruta inexistente |
| 409 | Duplicado o conflicto con reglas del negocio |
| 500 | Error interno sin detalles sensibles |

## Autenticación

| Método | Endpoint | Acceso | Parámetros |
|---|---|---|---|
| POST | `/auth/register` | Público | Body: `name`, `email`, `password` |
| POST | `/auth/login` | Público | Body: `email`, `password` |
| GET | `/auth/me` | Autenticado | JWT |

Registro siempre crea un lector activo:

```json
{
  "name": "María Lectora",
  "email": "maria@example.com",
  "password": "Clave123*"
}
```

Login responde:

```json
{
  "token": "jwt...",
  "user": {
    "id": 4,
    "name": "María Lectora",
    "email": "maria@example.com",
    "role": 3,
    "roleName": "reader",
    "status": 1
  }
}
```

## Libros

| Método | Endpoint | Acceso | Parámetros / resultado |
|---|---|---|---|
| GET | `/books` | Todos autenticados | Query opcional: `search`, `status` |
| GET | `/books/:id` | Todos autenticados | ID entero positivo |
| POST | `/books` | Admin, bibliotecario | Body completo; responde 201 |
| PUT | `/books/:id` | Admin, bibliotecario | Body completo |
| DELETE | `/books/:id` | Admin, bibliotecario | Cambia `status` a 0 |

Body de creación/actualización:

```json
{
  "title": "Cien años de soledad",
  "author": "Gabriel García Márquez",
  "isbn": "9780307474728",
  "category": "Novela",
  "publisher": "Sudamericana",
  "year": 1967,
  "totalCopies": 5,
  "description": "Novela latinoamericana."
}
```

Al crear, la API fija `availableCopies = totalCopies` y `status = 1`. Al cambiar el total conserva la cantidad de ejemplares prestados.

## Usuarios

| Método | Endpoint | Acceso | Parámetros / resultado |
|---|---|---|---|
| GET | `/users` | Admin, bibliotecario | Query opcional `status` |
| GET | `/users/:id` | Personal o propietario | ID entero positivo |
| POST | `/users` | Admin | Body completo; responde 201 |
| PUT | `/users/:id` | Admin | Contraseña opcional |
| DELETE | `/users/:id` | Admin | Cambia `status` a 0 |

Body administrado:

```json
{
  "name": "Ana Bibliotecaria",
  "email": "ana@example.com",
  "password": "Clave123*",
  "role": 2,
  "status": 1
}
```

`role`: 1 administrador, 2 bibliotecario, 3 lector. Las respuestas nunca contienen `password`.

## Préstamos

| Método | Endpoint | Acceso | Parámetros / resultado |
|---|---|---|---|
| GET | `/loans` | Autenticado | Personal ve todos; lector ve propios. Query `search`, `status` |
| GET | `/loans/:id` | Autenticado | Personal o propietario |
| POST | `/loans` | Admin, bibliotecario | `bookId`, `userId`, `dueDate` |
| PUT | `/loans/:id` | Admin, bibliotecario | `dueDate` |
| PUT | `/loans/:id/return` | Admin, bibliotecario | Sin body |
| DELETE | `/loans/:id` | Admin, bibliotecario | Cancela un préstamo activo |

Creación:

```json
{
  "bookId": 3,
  "userId": 4,
  "dueDate": "2026-08-01"
}
```

Respuesta:

```json
{
  "id": 9,
  "bookId": 3,
  "userId": 4,
  "loanDate": "2026-07-17",
  "dueDate": "2026-08-01",
  "returnDate": null,
  "status": 1,
  "bookTitle": "Clean Code",
  "userName": "María Lectora"
}
```

Crear descuenta una copia. Devolver o cancelar restaura una copia. Cada flujo usa una transacción Sequelize.

## Health check

`GET /health` es público y responde:

```json
{ "status": "ok" }
```
