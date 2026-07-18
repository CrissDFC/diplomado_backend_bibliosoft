# SIGEB Full Stack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir la API REST segura de SIGEB con PostgreSQL y Sequelize e integrar el frontend React existente para completar los flujos CRUD y de autenticación.

**Architecture:** Express expondrá `/api` mediante rutas, controladores, servicios y modelos Sequelize. Los servicios aplicarán reglas de negocio y transacciones; React conservará sus componentes y usará un cliente HTTP común con JWT. PostgreSQL impondrá llaves, unicidad y restricciones básicas mediante migraciones.

**Tech Stack:** Node.js, Express 5, Sequelize 6, PostgreSQL, bcrypt, JSON Web Token, React 19, React Router 7, Vite 8 y `node:test`.

---

### Task 1: Inicializar el proyecto Backend y la aplicación Express

**Files:**
- Create: `Backend/package.json`
- Create: `Backend/.gitignore`
- Create: `Backend/.env.example`
- Create: `Backend/app.js`
- Create: `Backend/server.js`
- Create: `Backend/config/env.js`
- Test: `Backend/tests/app.test.js`

**Step 1: Crear la configuración mínima del paquete**

Definir scripts `start`, `dev`, `test`, `db:migrate`, `db:migrate:undo`, `db:seed` y `db:seed:undo`. Usar CommonJS, Node 22+, Express, Sequelize, `pg`, `pg-hstore`, dotenv, bcrypt y jsonwebtoken. Usar nodemon y sequelize-cli como dependencias de desarrollo.

**Step 2: Instalar dependencias**

Run: `cd Backend && npm install`

Expected: `package-lock.json` creado y salida con código 0.

**Step 3: Escribir la prueba fallida del montaje de la aplicación**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

test('la aplicación expone health check y middleware de errores', () => {
  const app = require('../app');
  assert.equal(typeof app, 'function');
  assert.ok(app.router.stack.some((layer) => layer.route?.path === '/api/health'));
});
```

**Step 4: Ejecutar la prueba y verificar RED**

Run: `cd Backend && npm test -- tests/app.test.js`

Expected: FAIL porque `app.js` todavía no existe.

**Step 5: Implementar la aplicación mínima**

Crear `app.js` sin abrir puerto, con `express.json()`, health check y exportación de `app`. Crear `server.js` para validar la conexión Sequelize y escuchar el puerto configurado. Configurar variables obligatorias sin incluir secretos reales.

**Step 6: Ejecutar la prueba y verificar GREEN**

Run: `cd Backend && npm test -- tests/app.test.js`

Expected: PASS.

**Step 7: Commit**

```bash
git -C Backend add package.json package-lock.json .gitignore .env.example app.js server.js config tests/app.test.js
git -C Backend commit -m "chore: initialize Express API"
```

### Task 2: Definir modelos, relaciones, migraciones y seeders

**Files:**
- Create: `Backend/.sequelizerc`
- Create: `Backend/config/config.js`
- Create: `Backend/config/database.js`
- Create: `Backend/models/Role.js`
- Create: `Backend/models/User.js`
- Create: `Backend/models/Book.js`
- Create: `Backend/models/Loan.js`
- Create: `Backend/models/index.js`
- Create: `Backend/migrations/202607170001-create-roles.js`
- Create: `Backend/migrations/202607170002-create-users.js`
- Create: `Backend/migrations/202607170003-create-books.js`
- Create: `Backend/migrations/202607170004-create-loans.js`
- Create: `Backend/seeders/202607170001-roles.js`
- Create: `Backend/seeders/202607170002-admin.js`
- Create: `Backend/seeders/202607170003-demo-data.js`
- Test: `Backend/tests/database-structure.test.js`

**Step 1: Escribir pruebas fallidas de estructura**

Comprobar que cada migración crea su tabla, que `users.role_id`, `loans.user_id` y `loans.book_id` tienen referencias, que roles/ISBN/correo son únicos y que el seeder crea `admin`, `librarian` y `reader`.

**Step 2: Ejecutar y verificar RED**

Run: `cd Backend && npm test -- tests/database-structure.test.js`

Expected: FAIL por módulos inexistentes.

**Step 3: Implementar migraciones y modelos mínimos**

Mapear propiedades camelCase a columnas snake_case con `field`. Declarar `Role.hasMany(User)`, `User.belongsTo(Role)`, `User.hasMany(Loan)`, `Book.hasMany(Loan)` y sus relaciones inversas. Agregar checks de estados, cantidades y fechas en las migraciones.

**Step 4: Implementar seeders**

Crear roles con IDs estables 1, 2 y 3; crear administrador `admin@biblioteca.com` con hash de `Admin123*`; migrar como datos de demostración los libros y el préstamo presentes en `Frontend/db.json` sin almacenar contraseñas planas.

**Step 5: Ejecutar y verificar GREEN**

Run: `cd Backend && npm test -- tests/database-structure.test.js`

Expected: PASS.

**Step 6: Commit**

```bash
git -C Backend add .sequelizerc config models migrations seeders tests/database-structure.test.js
git -C Backend commit -m "feat: add relational database model"
```

### Task 3: Implementar validación, errores, autenticación de token y autorización

**Files:**
- Create: `Backend/utils/AppError.js`
- Create: `Backend/utils/validators.js`
- Create: `Backend/middlewares/authenticate.js`
- Create: `Backend/middlewares/authorize.js`
- Create: `Backend/middlewares/notFound.js`
- Create: `Backend/middlewares/errorHandler.js`
- Create: `Backend/middlewares/cors.js`
- Test: `Backend/tests/validators.test.js`
- Test: `Backend/tests/authorization.test.js`
- Test: `Backend/tests/error-handler.test.js`

**Step 1: Escribir pruebas fallidas**

Cubrir correo inválido, contraseña débil, entero positivo, fecha inválida, ausencia de token, JWT inválido, rol permitido/prohibido, error 404, conflicto Sequelize y error 500 sanitizado.

**Step 2: Ejecutar y verificar RED**

Run: `cd Backend && npm test -- tests/validators.test.js tests/authorization.test.js tests/error-handler.test.js`

Expected: FAIL por funciones inexistentes.

**Step 3: Implementar el mínimo**

`AppError` llevará `status` y detalles opcionales. `authenticate` validará `Bearer`; `authorize(...roles)` comprobará `req.user.role`. CORS aceptará únicamente `FRONTEND_URL`. `errorHandler` traducirá errores Sequelize a 400/409 y ocultará el detalle de 500.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Backend && npm test -- tests/validators.test.js tests/authorization.test.js tests/error-handler.test.js`

Expected: PASS.

**Step 5: Montar middlewares en `app.js` y ejecutar toda la suite**

Run: `cd Backend && npm test`

Expected: PASS.

**Step 6: Commit**

```bash
git -C Backend add app.js middlewares utils tests
git -C Backend commit -m "feat: add validation and security middleware"
```

### Task 4: Implementar registro, login y sesión actual

**Files:**
- Create: `Backend/services/auth.service.js`
- Create: `Backend/controllers/auth.controller.js`
- Create: `Backend/routes/auth.routes.js`
- Modify: `Backend/app.js`
- Test: `Backend/tests/auth.test.js`

**Step 1: Escribir pruebas fallidas**

Probar que registro fuerza `reader`, cifra contraseña y no devuelve hash; login rechaza usuario inexistente, contraseña incorrecta e inactivo; login correcto devuelve JWT y DTO; `/me` exige autenticación.

**Step 2: Ejecutar y verificar RED**

Run: `cd Backend && npm test -- tests/auth.test.js`

Expected: FAIL por servicio y rutas inexistentes.

**Step 3: Implementar servicio, controlador y rutas**

Usar bcrypt con costo 10. Firmar JWT con `{ id, role }` y expiración `1h`. Devolver usuario como `{ id, name, email, role, roleName, status }`.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Backend && npm test -- tests/auth.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git -C Backend add app.js services/auth.service.js controllers/auth.controller.js routes/auth.routes.js tests/auth.test.js
git -C Backend commit -m "feat: add JWT authentication"
```

### Task 5: Implementar CRUD de libros

**Files:**
- Create: `Backend/services/book.service.js`
- Create: `Backend/controllers/book.controller.js`
- Create: `Backend/routes/book.routes.js`
- Modify: `Backend/app.js`
- Test: `Backend/tests/books.test.js`

**Step 1: Escribir pruebas fallidas**

Cubrir lista/detalle, creación válida, ISBN duplicado, año/cantidades inválidas, actualización inexistente e inactivación lógica. Verificar permisos de lector frente a escritura.

**Step 2: Ejecutar y verificar RED**

Run: `cd Backend && npm test -- tests/books.test.js`

Expected: FAIL.

**Step 3: Implementar CRUD mínimo**

Crear DTO compatible con React. Al crear, `availableCopies = totalCopies` y estado disponible. Al eliminar, cambiar estado a inactivo; no destruir. Responder 201, 200, 204/200 según contrato documentado, 404 y 409 correctamente.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Backend && npm test -- tests/books.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git -C Backend add app.js services/book.service.js controllers/book.controller.js routes/book.routes.js tests/books.test.js
git -C Backend commit -m "feat: add books CRUD"
```

### Task 6: Implementar CRUD de usuarios

**Files:**
- Create: `Backend/services/user.service.js`
- Create: `Backend/controllers/user.controller.js`
- Create: `Backend/routes/user.routes.js`
- Modify: `Backend/app.js`
- Test: `Backend/tests/users.test.js`

**Step 1: Escribir pruebas fallidas**

Cubrir listado para personal, acceso propio del lector, creación solo por administrador, edición con contraseña opcional, correo duplicado, DTO sin contraseña e inactivación lógica.

**Step 2: Ejecutar y verificar RED**

Run: `cd Backend && npm test -- tests/users.test.js`

Expected: FAIL.

**Step 3: Implementar CRUD mínimo**

El bibliotecario podrá leer usuarios activos para crear préstamos, pero solo el administrador escribirá. Toda contraseña nueva o modificada será cifrada. Ningún `findAll` expondrá `password`.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Backend && npm test -- tests/users.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git -C Backend add app.js services/user.service.js controllers/user.controller.js routes/user.routes.js tests/users.test.js
git -C Backend commit -m "feat: add users CRUD and role rules"
```

### Task 7: Implementar CRUD transaccional de préstamos

**Files:**
- Create: `Backend/services/loan.service.js`
- Create: `Backend/controllers/loan.controller.js`
- Create: `Backend/routes/loan.routes.js`
- Modify: `Backend/app.js`
- Test: `Backend/tests/loans.test.js`

**Step 1: Escribir pruebas fallidas**

Cubrir alcance por rol/propietario, usuario inactivo, libro inexistente/inactivo/sin copias, decremento al crear, cambio de fecha límite, incremento único al devolver, cancelación activa e intentos repetidos. Confirmar `transaction.commit` y `rollback`.

**Step 2: Ejecutar y verificar RED**

Run: `cd Backend && npm test -- tests/loans.test.js`

Expected: FAIL.

**Step 3: Implementar reglas y transacciones**

Bloquear la fila del libro dentro de la transacción. Crear préstamo y actualizar inventario juntos. Devolver/cancelar solo estados activos, incrementar sin superar `totalCopies` y recalcular estado del libro sin reactivar libros inactivos.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Backend && npm test -- tests/loans.test.js`

Expected: PASS.

**Step 5: Ejecutar suite completa**

Run: `cd Backend && npm test`

Expected: todas las pruebas PASS, sin errores ni warnings.

**Step 6: Commit**

```bash
git -C Backend add app.js services/loan.service.js controllers/loan.controller.js routes/loan.routes.js tests/loans.test.js
git -C Backend commit -m "feat: add transactional loans CRUD"
```

### Task 8: Integrar autenticación y sesión en React

**Files:**
- Create: `Frontend/src/services/api.js`
- Create: `Frontend/src/features/auth/session.js`
- Create: `Frontend/src/features/auth/RegisterPage.jsx`
- Create: `Frontend/src/features/auth/components/RegisterForm.jsx`
- Create: `Frontend/src/features/auth/session.test.js`
- Modify: `Frontend/src/features/auth/authService.js`
- Modify: `Frontend/src/features/auth/components/LoginForm.jsx`
- Modify: `Frontend/src/routes/ProtectedRoute.jsx`
- Modify: `Frontend/src/routes/AppRouter.jsx`
- Modify: `Frontend/src/layouts/MainLayout.jsx`
- Modify: `Frontend/src/features/auth/auth.css`
- Modify: `Frontend/package.json`

**Step 1: Escribir pruebas fallidas de sesión**

Usar `node:test` para probar guardar/leer/cerrar sesión, JWT expirado y propagación de mensajes HTTP. Mantener la lógica pura fuera de JSX.

**Step 2: Ejecutar y verificar RED**

Run: `cd Frontend && node --test src/features/auth/session.test.js`

Expected: FAIL por módulo inexistente.

**Step 3: Implementar sesión y cliente HTTP**

`apiRequest(path, options)` usará `VITE_API_URL`, agregará `Authorization`, serializará JSON, interpretará errores y cerrará sesión ante 401. La sesión almacenará `{ token, user }`.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Frontend && node --test src/features/auth/session.test.js`

Expected: PASS.

**Step 5: Conectar formularios y rutas**

Login guardará la sesión. Registro enviará nombre, correo y contraseña y redirigirá a login. `ProtectedRoute` comprobará sesión vigente. `MainLayout` ocultará usuarios a no administradores y ofrecerá cerrar sesión.

**Step 6: Verificar frontend**

Run: `cd Frontend && npm run lint && npm run build`

Expected: ambos comandos terminan con código 0.

**Step 7: Commit**

```bash
git -C Frontend add package.json src/services src/features/auth src/routes src/layouts
git -C Frontend commit -m "feat: connect JWT authentication"
```

### Task 9: Conectar los CRUD existentes y reutilizar componentes

**Files:**
- Modify: `Frontend/src/features/books/bookService.js`
- Modify: `Frontend/src/features/books/pages/BooksListPage.jsx`
- Modify: `Frontend/src/features/loans/loanService.js`
- Modify: `Frontend/src/features/loans/pages/LoanFormPage.jsx`
- Modify: `Frontend/src/features/loans/pages/LoansListPage.jsx`
- Modify: `Frontend/src/features/loans/components/LoanTable.jsx`
- Modify: `Frontend/src/features/users/userService.js`
- Modify: `Frontend/src/features/users/UsersPage.jsx`
- Modify: `Frontend/src/features/users/components/UserForm.jsx`
- Test: `Frontend/src/services/api.test.js`

**Step 1: Escribir prueba fallida del contrato HTTP**

Probar con `fetch` simulado que se usan `/api/books`, `/api/users`, `/api/loans`, métodos PUT/DELETE y cabecera Bearer.

**Step 2: Ejecutar y verificar RED**

Run: `cd Frontend && node --test src/services/api.test.js`

Expected: FAIL con el contrato anterior.

**Step 3: Adaptar servicios y páginas**

Reemplazar `fetch` duplicado por `apiRequest`. Cambiar inactivaciones a DELETE. Crear/devolver/cancelar préstamos con una sola petición y recargar datos. Mantener formularios, tablas y filtros existentes. Hacer la contraseña opcional al editar y agregar lector al selector de rol.

**Step 4: Ejecutar y verificar GREEN**

Run: `cd Frontend && node --test src/services/api.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git -C Frontend add src/features src/services/api.test.js
git -C Frontend commit -m "feat: integrate library CRUD API"
```

### Task 10: Completar componentes reutilizables y responsive design

**Files:**
- Create: `Frontend/src/components/ui/Alert.jsx`
- Create: `Frontend/src/components/ui/Button.jsx`
- Create: `Frontend/src/components/ui/Card.jsx`
- Create: `Frontend/src/components/ui/Loader.jsx`
- Create: `Frontend/src/components/layout/Navbar.jsx`
- Create: `Frontend/src/components/layout/Footer.jsx`
- Modify: `Frontend/src/layouts/MainLayout.jsx`
- Modify: `Frontend/src/features/books/pages/*.jsx`
- Modify: `Frontend/src/features/loans/pages/*.jsx`
- Modify: `Frontend/src/features/users/UsersPage.jsx`
- Modify: `Frontend/src/styles/global.css`
- Modify: `Frontend/src/index.css`

**Step 1: Crear los componentes mínimos y reutilizarlos**

Cada componente debe representar una sola responsabilidad. Sustituir mensajes repetidos de carga/error y estructura visual sin reescribir formularios ni tablas.

**Step 2: Añadir estilos responsive**

Definir layout, navegación, cards, botones, formularios y tablas para escritorio, tablet y móvil. Mantener contraste, labels y estados de foco.

**Step 3: Verificar lint y build**

Run: `cd Frontend && npm run lint`

Expected: 0 errores.

Run: `cd Frontend && npm run build`

Expected: build de Vite con código 0.

**Step 4: Commit**

```bash
git -C Frontend add src/components src/layouts src/features src/styles src/index.css
git -C Frontend commit -m "feat: complete reusable responsive interface"
```

### Task 11: Documentar, migrar y verificar la entrega

**Files:**
- Create: `Backend/README.md`
- Create: `Backend/docs/database.md`
- Create: `Backend/docs/api.md`
- Modify: `Frontend/README.md`
- Modify: `Frontend/.env`

**Step 1: Documentar instalación y arquitectura**

Incluir requisitos, variables, comandos, credenciales demo, capas, modelo relacional, diccionario de datos, endpoints, parámetros, respuestas y códigos de error. No incluir secretos reales.

**Step 2: Preparar configuración local**

Configurar `Frontend/.env` con `VITE_API_URL=http://localhost:3000/api`. Crear `Backend/.env` local desde el ejemplo únicamente si se conocen las credenciales PostgreSQL; mantenerlo ignorado.

**Step 3: Ejecutar verificación backend**

Run: `cd Backend && npm test`

Expected: todas las pruebas PASS.

Si PostgreSQL está disponible:

```bash
cd Backend
npm run db:migrate
npm run db:seed
npm start
```

Expected: migraciones y seeders con código 0; `/api/health` responde 200.

**Step 4: Ejecutar verificación frontend**

Run: `cd Frontend && node --test src/features/auth/session.test.js src/services/api.test.js`

Expected: todas las pruebas PASS.

Run: `cd Frontend && npm run lint`

Expected: 0 errores.

Run: `cd Frontend && npm run build`

Expected: código 0.

**Step 5: Revisar estado y alcance**

Run: `git -C Backend status --short && git -C Frontend status --short`

Expected: únicamente archivos locales ignorados, o árbol limpio después del commit final.

**Step 6: Commit**

```bash
git -C Backend add README.md docs
git -C Backend commit -m "docs: add API and database guide"
git -C Frontend add README.md
git -C Frontend commit -m "docs: explain full stack setup"
```
