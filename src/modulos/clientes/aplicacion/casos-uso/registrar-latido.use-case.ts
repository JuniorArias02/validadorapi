import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infraestructura/prisma/prisma.service';
import { ErrorNoEncontrado } from 'compartido/errores/errores-aplicacion';

/**
 * Caso de uso: Registrar el latido de un cliente.
 * Actualiza ultimo_latido para indicar que el cliente sigue activo.
 */
@Injectable()
export class RegistrarLatidoUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(clienteId: bigint): Promise<void> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new ErrorNoEncontrado('Cliente');
    }

    await this.prisma.cliente.update({
      where: { id: clienteId },
      data: { ultimoLatido: new Date(), actualizadoEn: new Date() },
    });
  }
}
