/**
 * Seeder de Prisma — API Central de Validación de Contactos
 *
 * Pobla la base de datos con datos reales iniciales.
 *
 * Uso:
 *   npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Datos iniciales
// ─────────────────────────────────────────────

const API_CLAVES_SEED = [
  {
    nombre: 'Acceso API Producción',
    clave: 'DKD-API-PROD-2026',
    secreto: 'DkDup3rS3cr3t0-2026',
  }
];

const CLIENTES_SEED = [
  {
    nombre: 'Validador Principal',
    identificador: 'VALIDADOR-PRINCIPAL-01',
  }
];

// ─────────────────────────────────────────────
// Funciones de seeding
// ─────────────────────────────────────────────

async function seedApiClaves(): Promise<void> {
  console.log('\n🔑 Seeding api_claves...');

  const SALT_ROUNDS = 10;

  for (const datos of API_CLAVES_SEED) {
    const existente = await prisma.apiClave.findUnique({
      where: { clave: datos.clave },
    });

    if (existente) {
      console.log(`   ⏭️  "${datos.nombre}" ya existe, omitiendo`);
      continue;
    }

    const secretoHash = await bcrypt.hash(datos.secreto, SALT_ROUNDS);
    const ahora = new Date();

    await prisma.apiClave.create({
      data: {
        nombre: datos.nombre,
        clave: datos.clave,
        secretoHash,
        activa: true,
        creadoEn: ahora,
        actualizadoEn: ahora,
      },
    });

    console.log(`   ✅ "${datos.nombre}" creada`);
    console.log(`      API Key:    ${datos.clave}`);
    console.log(`      API Secret: ${datos.secreto}`);
  }
}

async function seedClientes(): Promise<void> {
  console.log('\n💻 Seeding clientes...');

  const ahora = new Date();

  for (const datos of CLIENTES_SEED) {
    const existente = await prisma.cliente.findUnique({
      where: { identificador: datos.identificador },
    });

    if (existente) {
      console.log(`   ⏭️  "${datos.nombre}" ya existe, omitiendo`);
      continue;
    }

    await prisma.cliente.create({
      data: {
        nombre: datos.nombre,
        identificador: datos.identificador,
        activa: true,
        creadoEn: ahora,
        actualizadoEn: ahora,
      },
    });

    console.log(`   ✅ "${datos.nombre}" (${datos.identificador}) creado`);
  }
}

// ─────────────────────────────────────────────
// Ejecución principal
// ─────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱 Iniciando seeder...');
  console.log('   Entorno:', process.env.NODE_ENV ?? 'development');

  await seedApiClaves();
  await seedClientes();

  console.log('\n✅ Seeding completado exitosamente');
  console.log('\n📋 Credenciales reales para usar la API:');
  console.log('   ┌─────────────────────────────────────────────────────┐');

  for (const k of API_CLAVES_SEED) {
    console.log(`   │  ${k.nombre.padEnd(30)}            │`);
    console.log(`   │  X-API-KEY:    ${k.clave.padEnd(35)} │`);
    console.log(`   │  X-API-SECRET: ${k.secreto.padEnd(35)} │`);
    console.log(`   │                                                     │`);
  }

  console.log('   └─────────────────────────────────────────────────────┘\n');
}

main()
  .catch((error) => {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
