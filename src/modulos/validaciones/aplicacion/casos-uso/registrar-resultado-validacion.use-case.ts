import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'infraestructura/prisma/prisma.service';
import { ContactoRepository } from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { RegistrarResultadoDto } from 'modulos/validaciones/aplicacion/dto/registrar-resultado.dto';
import { ErrorNoEncontrado, ErrorAplicacion } from 'compartido/errores/errores-aplicacion';
import { EstadoValidacion } from 'modulos/contactos/dominio/enums/estados.enum';

/**
 * Caso de uso: Registrar el resultado de una validación completada.
 */
@Injectable()
export class RegistrarResultadoValidacionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contactoRepository: ContactoRepository,
  ) {}

  async ejecutar(validacionId: bigint, dto: RegistrarResultadoDto): Promise<void> {
    const validacion = await this.prisma.validacion.findUnique({
      where: { id: validacionId },
    });

    if (!validacion) {
      throw new ErrorNoEncontrado('Validación');
    }

    if (validacion.estado !== EstadoValidacion.Validando) {
      throw new ErrorAplicacion(
        'La validación no está en estado "validando"',
        'ESTADO_INVALIDO',
        409,
      );
    }

    const ahora = new Date();

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.validacion.update({
        where: { id: validacionId },
        data: {
          estado: dto.estado,
          respuesta: (dto.respuesta ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          finalizadoEn: ahora,
          actualizadoEn: ahora,
        },
      });

      await tx.contacto.update({
        where: { id: validacion.contactoId },
        data: {
          estadoValidacion: dto.estado,
          estadoWhatsapp: dto.estadoWhatsapp,
          ultimaValidacion: ahora,
          actualizadoEn: ahora,
        },
      });
    });
  }
}
