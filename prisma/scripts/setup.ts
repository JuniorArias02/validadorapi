/**
 * Script maestro de configuración de base de datos.
 *
 * Ejecuta en orden:
 *   1. Crear la BD si no existe
 *   2. Aplicar migraciones
 *   3. Poblar con datos iniciales (seed)
 *
 * Uso:  npm run db:setup
 */

import { execSync } from 'child_process';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function ejecutar(comando: string, descripcion: string): void {
  console.log(`\n⏳ ${descripcion}...`);
  try {
    execSync(comando, { stdio: 'inherit', cwd: path.resolve(__dirname, '../..') });
    console.log(`✅ ${descripcion} completado`);
  } catch (error) {
    console.error(`❌ Falló: ${descripcion}`);
    process.exit(1);
  }
}

async function crearBdSiNoExiste(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no definida en .env');
    process.exit(1);
  }

  const urlObj = new URL(databaseUrl);
  const nombreBd = urlObj.pathname.replace('/', '');

  console.log(`\n⏳ Verificando base de datos "${nombreBd}"...`);

  let conexion: mysql.Connection | null = null;

  try {
    conexion = await mysql.createConnection({
      host: urlObj.hostname,
      port: parseInt(urlObj.port || '3306'),
      user: urlObj.username,
      password: decodeURIComponent(urlObj.password),
    });

    const [rows] = await conexion.execute<mysql.RowDataPacket[]>(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [nombreBd],
    );

    if (rows.length > 0) {
      console.log(`✅ La base de datos "${nombreBd}" ya existe`);
    } else {
      await conexion.execute(
        `CREATE DATABASE \`${nombreBd}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log(`✅ Base de datos "${nombreBd}" creada con utf8mb4_unicode_ci`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ No se pudo conectar a MySQL:', error.message);
      if (error.message.includes('ECONNREFUSED')) {
        console.error('   → Verifica que MySQL esté corriendo');
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        console.error('   → Verifica usuario y contraseña en DATABASE_URL (.env)');
      }
    }
    process.exit(1);
  } finally {
    if (conexion) await conexion.end();
  }
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════');
  console.log('  Setup completo — API Central Validador');
  console.log('═══════════════════════════════════════════');

  // Paso 1: Crear BD si no existe
  await crearBdSiNoExiste();

  // Paso 2: Aplicar migraciones
  ejecutar(
    'node node_modules/.bin/prisma migrate deploy',
    'Aplicando migraciones',
  );

  // Paso 3: Seed
  ejecutar(
    'node node_modules/.bin/ts-node -r tsconfig-paths/register prisma/seed.ts',
    'Poblando datos iniciales',
  );

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Setup completado. API lista para usar.');
  console.log('     Ejecuta: npm run start:dev');
  console.log('═══════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('❌ Error en el setup:', error);
  process.exit(1);
});
