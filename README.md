# SIGEB Backend

API REST del Sistema de Gestión Bibliotecaria, desarrollada con Node.js, Express, PostgreSQL y Sequelize.

## Arquitectura

El proyecto usa una arquitectura por capas:

```text
routes -> controllers -> services -> models -> PostgreSQL
                 |            |
                 +-> errores  +-> reglas y transacciones
```

- `routes/`: endpoints y middlewares de autenticación/autorización.
- `controllers/`: traducción entre HTTP y servicios.
- `services/`: validaciones y reglas de negocio.
- `models/`: entidades y relaciones Sequelize.
- `config/`: variables y conexión PostgreSQL.
- `middlewares/`: CORS, JWT, roles, 404 y errores.
- `migrations/`: estructura, llaves y restricciones.
- `seeders/`: roles, administrador y catálogo inicial.
- `tests/`: pruebas con `node:test`.

## Requisitos

- Node.js 22 o posterior.
- PostgreSQL 14 o posterior.
- npm.

## Instalación

```bash
npm install
cp .env.example .env
```

Crear una base de datos vacía:

```sql
CREATE DATABASE sigeb;
```

Editar `.env` con las credenciales locales y ejecutar:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

La API queda disponible en `http://localhost:3000/api` y el health check en `GET /api/health`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `NODE_ENV` | Entorno | `development` |
| `DB_HOST` | Servidor PostgreSQL | `127.0.0.1` |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `DB_NAME` | Base de datos | `sigeb` |
| `DB_USER` | Usuario PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña PostgreSQL | Valor local |
| `JWT_SECRET` | Secreto largo para firmar JWT | Valor aleatorio |
| `FRONTEND_URL` | Origen permitido por CORS | `http://localhost:5173` |

## Usuario inicial

Después de ejecutar seeders:

- Correo: `admin@biblioteca.com`
- Contraseña: `Admin123*`

Esta contraseña es únicamente para demostración y debe cambiarse fuera del entorno académico.

## Roles

| Rol | Libros | Préstamos | Usuarios |
|---|---|---|---|
| Administrador | Consultar y gestionar | Consultar y gestionar | Consultar y gestionar |
| Bibliotecario | Consultar y gestionar | Consultar y gestionar | Consultar para prestar |
| Lector | Consultar | Consultar los propios | Consultar el propio |

## Comandos

```bash
npm start                 # Producción
npm run dev               # Desarrollo con nodemon
npm test                  # Pruebas automatizadas
npm run db:migrate        # Aplicar migraciones
npm run db:migrate:undo   # Revertir todas las migraciones
npm run db:seed           # Insertar datos demo
npm run db:seed:undo      # Revertir seeders
```

## Documentación

- [Modelo y diccionario de datos](docs/database.md)
- [Contrato de la API](docs/api.md)
- [Diseño aprobado](docs/plans/2026-07-17-sigeb-full-stack-design.md)
- [Plan de implementación](docs/plans/2026-07-17-sigeb-full-stack-implementation.md)

## Decisiones principales

- Sequelize es la única capa de persistencia; no se mezclan consultas SQL directas.
- Usuarios y libros se inactivan mediante `DELETE` lógico.
- Los préstamos se crean, devuelven y cancelan dentro de transacciones.
- El registro público crea exclusivamente lectores.
- Las contraseñas se cifran con bcrypt y nunca aparecen en respuestas.
- La API devuelve errores uniformes con códigos HTTP apropiados.
