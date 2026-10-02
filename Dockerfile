# ─────────────────────────────────────────────
# Stage 1: Builder — instala dependencias y compila TypeScript
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero para aprovechar cache de capas
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: Runner — imagen final liviana
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && \
    npx prisma generate && \
    # Limpiar cache de npm para reducir tamaño
    npm cache clean --force

# Copiar el build compilado desde el stage anterior
COPY --from=builder /app/dist ./dist

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

USER nestjs

# Exponer el puerto configurado
EXPOSE 3000

# Healthcheck para que Docker/orquestadores sepan si la app está lista
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health 2>/dev/null || exit 1

# Arrancar la aplicación compilada
CMD ["node", "dist/main"]
