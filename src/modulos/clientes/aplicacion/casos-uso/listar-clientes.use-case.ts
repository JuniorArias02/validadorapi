import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infraestructura/prisma/prisma.service';

/**
 * Caso de uso: Listar todos los clientes con su estado.
 */
@Injectable()
export class ListarClientesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar() {
    const clientes = await this.prisma.cliente.findMany({
      orderBy: { id: 'asc' },
    });

    return clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      identificador: c.identificador,
      activa: c.activa,
      ultimoLatido: c.ultimoLatido,
      ultimoAcceso: c.ultimoAcceso,
      creadoEn: c.creadoEn,
    }));
  }
}
