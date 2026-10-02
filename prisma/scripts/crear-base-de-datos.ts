/**
 * Script: Crear base de datos MySQL si no existe.
 *
 * Uso:  npx ts-node -r tsconfig-paths/register prisma/scripts/crear-base-de-datos.ts
 * O:    npm run db:crear
 *
 * Lee DATABASE_URL del .env y crea la BD si no existe.
 * No modifica ninguna BD existente.
 */

import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function crearBaseDeDatos(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está definida en .env');
    process.exit(1);
  }

  // Parsear la URL para extraer componentes sin el nombre de BD
  // mysql://usuario:password@host:puerto/nombre_bd
  const urlObj = new URL(databaseUrl);
  const nombreBd = urlObj.pathname.replace('/', '');
  const hostSinBd = `mysql://${urlObj.username}:${urlObj.password}@${urlObj.hostname}:${urlObj.port || 3306}`;

  if (!nombreBd) {
    console.error('❌ No se pudo extraer el nombre de la base de datos de DATABASE_URL');
    process.exit(1);
  }

  console.log(`\n🔌 Conectando a MySQL en ${urlObj.hostname}:${urlObj.port || 3306}...`);

  let conexion: mysql.Connection | null = null;

  try {
    // Conectar sin especificar BD para poder crearla
    conexion = await mysql.createConnection({
      host: urlObj.hostname,
      port: parseInt(urlObj.port || '3306'),
      user: urlObj.username,
      password: decodeURIComponent(urlObj.password),
    });

    console.log('✅ Conexión establecida');

    // Verificar si la BD ya existe
    const [rows] = await conexion.execute<mysql.RowDataPacket[]>(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [nombreBd],
    );

    if (rows.length > 0) {
      console.log(`ℹ️  La base de datos "${nombreBd}" ya existe. No se realizaron cambios.`);
      return;
    }

    // Crear la BD con utf8mb4 para soporte completo de caracteres
    await conexion.execute(
      `CREATE DATABASE \`${nombreBd}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );

    console.log(`✅ Base de datos "${nombreBd}" creada con utf8mb4_unicode_ci`);
    console.log(`\n📌 Próximo paso: ejecutar las migraciones con:`);
    console.log(`   npm run db:migrate:dev\n`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error al crear la base de datos:', error.message);

      if (error.message.includes('ECONNREFUSED')) {
        console.error('   → MySQL no está corriendo o el host/puerto es incorrecto');
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        console.error('   → Usuario o contraseña incorrectos en DATABASE_URL');
      }
    } else {
      console.error('❌ Error desconocido:', error);
    }
    process.exit(1);
  } finally {
    if (conexion) {
      await conexion.end();
    }
  }
}

crearBaseDeDatos();
