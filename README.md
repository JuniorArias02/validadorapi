# API Central — Validador de Contactos

API REST para la validación masiva de contactos de WhatsApp.  
Construida con **NestJS · TypeScript · Prisma ORM · MySQL**.

---

## Tecnologías

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| NestJS | v10 | Framework principal |
| TypeScript | v5 | Lenguaje (modo strict) |
| Prisma ORM | v5.22 | Acceso a base de datos |
| MySQL | v8+ | Base de datos |
| bcrypt | v6 | Hash de secretos |
| class-validator | v0.15 | Validación de DTOs |

---

## Estructura del proyecto

```
src/
├── app.module.ts                         # Módulo raíz
├── main.ts                               # Bootstrap
│
├── compartido/
│   ├── decoradores/
│   │   └── api-key.guard.ts             # Guard X-API-KEY + X-API-SECRET
│   ├── errores/
│   │   ├── errores-aplicacion.ts        # Jerarquía de errores de dominio
│   │   └── filtro-excepciones-global.ts # Convierte errores a JSON estándar
│   └── respuestas/
│       └── respuesta-api.ts             # Formato de respuesta consistente
│
├── infraestructura/
│   └── prisma/
│       ├── prisma.module.ts             # Módulo global de Prisma
│       └── prisma.service.ts            # PrismaClient con lifecycle
│
└── modulos/
    ├── contactos/                        # Números a validar
    │   ├── dominio/                      # Entidades y enums puros
    │   ├── aplicacion/                   # Casos de uso + DTOs
    │   ├── infraestructura/              # Repositorios + Prisma
    │   └── presentacion/                 # Controllers
    ├── clientes/                         # Instancias del validador externo
    ├── validaciones/                     # Trabajos de validación
    └── estadisticas/                     # Métricas del sistema

prisma/
├── schema.prisma                         # Esquema de base de datos
├── seed.ts                               # Seeder con datos iniciales
└── scripts/
    ├── crear-base-de-datos.ts            # Crea la BD si no existe
    └── setup.ts                          # Script maestro de configuración
```

---

## Configuración inicial (paso a paso)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus datos:

```bash
cp .env.example .env
```

Edita `.env`:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/validador_db"
PORT=3000
TIEMPO_BLOQUEO_VALIDACION=15
NODE_ENV=development
```

### 3. Setup completo (BD + migraciones + seed)

Un solo comando que hace todo:

```bash
npm run db:setup
```

Esto ejecuta en orden:
1. ✅ Crea la base de datos `validador_db` si no existe
2. ✅ Aplica todas las migraciones
3. ✅ Pobla con datos iniciales (credenciales de prueba + clientes + contactos)

> **O paso a paso:**
> ```bash
> npm run db:crear           # Solo crear la BD
> npm run db:migrate:dev     # Solo migraciones
> npm run db:seed            # Solo seed
> ```

### 4. Levantar el servidor

```bash
# Modo desarrollo (hot-reload)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

---

## Autenticación

Todos los endpoints requieren estas cabeceras HTTP:

```http
X-API-KEY: ADMIN-KEY-001
X-API-SECRET: admin-secreto-seguro-2024
```

Las credenciales de prueba se crean automáticamente con el seeder.

### Credenciales por defecto (solo desarrollo)

| Nombre | X-API-KEY | X-API-SECRET |
|--------|-----------|--------------|
| Administración | `ADMIN-KEY-001` | `admin-secreto-seguro-2024` |
| Pruebas | `TEST-KEY-001` | `test-secreto-seguro-2024` |

> ⚠️ **Cambiar estas credenciales antes de usar en producción.**

---

## Endpoints

### Contactos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/contactos` | Listar contactos con filtros y paginación |
| `GET` | `/contactos/:id` | Obtener contacto por ID |
| `POST` | `/contactos` | Crear nuevo contacto |

**Filtros disponibles** (`GET /contactos`):

```
?estadoValidacion=pendiente|validando|completado|error
?estadoWhatsapp=desconocido|activo|inactivo|invalido
?pagina=1
?limite=50
```

**Crear contacto** (`POST /contactos`):
```json
{
  "telefono": "573001234567",
  "nombre": "Juan Pérez"
}
```

---

### Validaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/validaciones/siguiente` | Obtener próximo contacto a validar |
| `POST` | `/validaciones/:id/resultado` | Reportar resultado de validación |

**Solicitar trabajo** (`POST /validaciones/siguiente`):
```http
X-CLIENTE-ID: 1
```

Respuesta:
```json
{
  "exito": true,
  "mensaje": "Trabajo asignado correctamente",
  "datos": {
    "validacionId": 42,
    "contactoId": 100,
    "telefono": "573001234567",
    "nombre": "Juan Pérez"
  }
}
```

**Reportar resultado** (`POST /validaciones/42/resultado`):
```json
{
  "estado": "completado",
  "estadoWhatsapp": "activo",
  "respuesta": { "raw": "..." }
}
```

---

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/clientes` | Listar todos los clientes |
| `POST` | `/clientes/:id/latido` | Registrar heartbeat del cliente |

---

### Estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/estadisticas` | Métricas generales del sistema |

Respuesta:
```json
{
  "exito": true,
  "datos": {
    "contactos": {
      "total": 10000,
      "pendientes": 7500,
      "validando": 3,
      "completados": 2450,
      "errores": 47
    },
    "whatsapp": {
      "conWhatsapp": 1800,
      "sinWhatsapp": 650
    },
    "clientes": { "activos": 3 },
    "validaciones": { "activas": 3 },
    "progreso": 24
  }
}
```

---

## Formato de respuestas

Todas las respuestas siguen el mismo contrato:

**Exitosa:**
```json
{
  "exito": true,
  "mensaje": "Descripción de lo que ocurrió",
  "datos": { ... }
}
```

**Error:**
```json
{
  "exito": false,
  "mensaje": "Descripción del error",
  "error": "CODIGO_ERROR"
}
```

---

## Docker

La API se ejecuta en un contenedor Docker. La base de datos MySQL **no** está en Docker — el contenedor se conecta al MySQL que ya está corriendo en el servidor.

### Archivos generados

| Archivo | Descripción |
|---------|-------------|
| [`Dockerfile`](Dockerfile) | Build multi-stage (builder + runner) basado en Node 20 Alpine |
| [`docker-compose.yml`](docker-compose.yml) | Orquestación del contenedor API |
| [`.dockerignore`](.dockerignore) | Excluye node_modules, dist, .env y tests del build |

### Configurar .env para Docker

Cuando la API corre dentro de Docker y el MySQL está en el servidor host, **no puedes usar `localhost`**. Usa alguna de estas opciones:

```env
# Opción 1 — host.docker.internal (Linux moderno / Docker Desktop)
DATABASE_URL="mysql://usuario:contraseña@host.docker.internal:3306/validador_db"

# Opción 2 — IP de la interfaz docker0 del host (Linux clásico)
DATABASE_URL="mysql://usuario:contraseña@172.17.0.1:3306/validador_db"

# El puerto debe coincidir con el puerto MySQL en tu servidor
PORT=3000
NODE_ENV=production
```

> Para encontrar la IP del host desde el contenedor:
> ```bash
> docker run --rm alpine ip route | grep default | awk '{print $3}'
> ```

### Comandos Docker

```bash
# Construir la imagen
docker compose build

# Levantar la API en segundo plano
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f api

# Detener
docker compose down

# Reconstruir y levantar (tras cambios en código)
docker compose up -d --build

# Ver estado de los contenedores
docker compose ps
```

### Ejecutar migraciones y seed desde Docker

Antes de levantar la API en producción, aplica las migraciones:

```bash
# Aplicar migraciones (dentro del contenedor)
docker compose exec api node node_modules/.bin/prisma migrate deploy

# Poblar con datos iniciales
docker compose exec api node node_modules/.bin/ts-node \
  -r tsconfig-paths/register prisma/seed.ts
```

### Healthcheck

El contenedor incluye un healthcheck automático en `GET /health`.  
Docker marca el contenedor como **healthy** cuando la API responde y la conexión a MySQL está activa.

```bash
# Ver estado de salud
docker compose ps
# CONTAINER        STATUS
# validador-api    Up 2 minutes (healthy)
```

---



| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm run start:prod` | Producción (requiere build) |
| `npm run db:setup` | **Setup completo** (BD + migraciones + seed) |
| `npm run db:crear` | Crear BD si no existe |
| `npm run db:migrate:dev` | Crear y aplicar migración de desarrollo |
| `npm run db:migrate:deploy` | Aplicar migraciones en producción |
| `npm run db:seed` | Poblar con datos iniciales |
| `npm run prisma:generate` | Regenerar Prisma Client |
| `npm test` | Tests unitarios |
| `npm run test:e2e` | Tests end-to-end |
| `npm run test:cov` | Cobertura de tests |

---

## Base de datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `api_claves` | Credenciales de acceso a la API |
| `clientes` | Instancias del programa validador |
| `contactos` | Números de teléfono a validar |
| `validaciones` | Historial de trabajos de validación |

### Migraciones

```bash
# Desarrollo: crear nueva migración
npm run db:migrate:dev
# Preguntará el nombre de la migración, ej: "agregar-campo-region"

# Producción: aplicar migraciones existentes
npm run db:migrate:deploy
```

---

## Seguridad

- Los API Secrets se almacenan hasheados con **bcrypt** (nunca en texto plano).
- Nunca se devuelven secretos en respuestas HTTP.
- Los errores internos (Prisma, SQL) nunca se exponen al cliente.
- Usar **HTTPS** en producción.
- Cambiar las credenciales del seeder antes de producción.

## 🚀 Guía de Despliegue (Producción en Servidor)

Sigue estos pasos cuando clones el proyecto por primera vez en tu VPS o servidor de producción (Ubuntu/Debian recomendado):

### 1. Clonar y preparar
```bash
git clone <URL_DEL_REPOSITORIO>
cd validador/api
cp .env.example .env
```
*(Edita el `.env` con las credenciales de tu MySQL y la JWT_SECRET).*

### 2. Levantar la Base de Datos con Docker
Si no tienes MySQL instalado nativamente en el servidor, puedes levantarlo muy rápido con Docker. Asegúrate de tener un archivo `docker-compose.yml` que incluya el servicio de MySQL.

```bash
docker compose up -d db
```

### 3. Instalar, Migrar y Poblar
Instala las dependencias y prepara la base de datos (migraciones + seed de credenciales y usuario administrador).

```bash
npm install
npm run db:setup
# O manualmente: npx prisma migrate deploy && npx ts-node prisma/seed.ts
```
> **Usuario Dashboard por defecto:** `admin` | **Clave:** `Admin123**`

### 4. (Opcional) Carga Inicial de Números
Si tienes tu archivo `numeros.txt` en el servidor (recuerda que como lo ignoramos en Git, debes subirlo por FTP o SFTP), puedes subir todos esos números a la base de datos de forma masiva ejecutando:
```bash
npx ts-node prisma/scripts/subir-numeros.ts
```

### 5. Compilar y Ejecutar la API
Nunca corras `npm run start:dev` en producción, ya que consume mucha memoria. Debes compilar el proyecto a código nativo de Node (JavaScript plano) y ejecutarlo.

```bash
npm run build
npm run start:prod
```
> **Tip para Producción:** Te recomendamos usar **PM2** para que la API se mantenga encendida en segundo plano y se reinicie sola si el servidor se apaga:
> ```bash
> npm install -g pm2
> pm2 start dist/main.js --name "dkd-api"
> pm2 save
> pm2 startup
> ```

---

## Licencia

Proyecto privado — DKD Ingenierías Software.
