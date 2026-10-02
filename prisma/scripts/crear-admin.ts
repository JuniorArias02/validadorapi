import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123**', 10);
  const usuario = await prisma.usuario.upsert({
    where: { usuario: 'admin' },
    update: { passwordHash },
    create: {
      usuario: 'admin',
      nombre: 'Administrador',
      passwordHash,
    },
  });
  console.log('✅ Usuario administrador creado/actualizado: admin / Admin123**');
}

main().catch(console.error).finally(() => prisma.$disconnect());
