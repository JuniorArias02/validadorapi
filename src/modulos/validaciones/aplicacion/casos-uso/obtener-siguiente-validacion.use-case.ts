import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infraestructura/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ContactoRepository } from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { ErrorAplicacion } from 'compartido/errores/errores-aplicacion';
import { EstadoValidacion } from 'modulos/contactos/dominio/enums/estados.enum';
import { Prisma } from '@prisma/client';

/**
 * Caso de uso: Obtener el siguiente trabajo de validación para un cliente.
 */
@Injectable()
export class ObtenerSiguienteValidacionUseCase {
  constructor(
    private readonly contactoRepository: ContactoRepository,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async ejecutar(clienteId: bigint): Promise<{
    validacionId: bigint;
    contactoId: bigint;
    telefono: string;
    nombre: string | null;
  }> {
    await this.liberarTrabajosAbandonados();

    const contacto = await this.contactoRepository.obtenerSiguienteDisponible();

    if (!contacto) {
      throw new ErrorAplicacion(
        'No hay contactos disponibles para validar',
        'SIN_TRABAJO_DISPONIBLE',
        204,
      );
    }

    const resultado = await this.contactoRepository.reservarParaValidacion(
      contacto.id,
      clienteId,
    );

    if (!resultado) {
      throw new ErrorAplicacion(
        'El contacto ya fue tomado por otro cliente',
        'CONTACTO_NO_DISPONIBLE',
        409,
      );
    }

    return {
      validacionId: resultado.validacionId,
      contactoId: contacto.id,
      telefono: contacto.telefono,
      nombre: contacto.nombre,
    };
  }

  private async liberarTrabajosAbandonados(): Promise<void> {
    const minutosBloqueo = this.config.get<number>(
      'TIEMPO_BLOQUEO_VALIDACION',
      15,
    );

    const limiteAbandonado = new Date(
      Date.now() - minutosBloqueo * 60 * 1000,
    );

    const validacionesAbandonadas = await this.prisma.validacion.findMany({
      where: {
        estado: EstadoValidacion.Validando,
        iniciadoEn: { lt: limiteAbandonado },
      },
      select: { id: true, contactoId: true },
    });

    if (validacionesAbandonadas.length === 0) return;

    const ahora = new Date();

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const v of validacionesAbandonadas) {
        await tx.validacion.update({
          where: { id: v.id },
          data: { estado: EstadoValidacion.Error, finalizadoEn: ahora, actualizadoEn: ahora },
        });

        await tx.contacto.update({
          where: { id: v.contactoId },
          data: {
            estadoValidacion: EstadoValidacion.Pendiente,
            actualizadoEn: ahora,
          },
        });
      }
    });
  }
}
