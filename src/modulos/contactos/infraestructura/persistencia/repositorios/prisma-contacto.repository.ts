import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'infraestructura/prisma/prisma.service';
import {
  ContactoRepository,
  PaginadoContactos,
} from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { Contacto } from 'modulos/contactos/dominio/entidades/contacto.entidad';
import {
  EstadoValidacion,
} from 'modulos/contactos/dominio/enums/estados.enum';
import { ContactoMapper } from 'modulos/contactos/infraestructura/mapeadores/contacto.mapper';
import { FiltrarContactosDto } from 'modulos/contactos/aplicacion/dto/filtrar-contactos.dto';
import { ErrorConflicto } from 'compartido/errores/errores-aplicacion';

/**
 * Implementación Prisma del repositorio de contactos.
 * Toda la lógica de acceso a datos vive aquí.
 */
@Injectable()
export class PrismaContactoRepository implements ContactoRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ContactoMapper,
  ) {}

  async crear(telefono: string, nombre?: string): Promise<Contacto> {
    const existe = await this.prisma.contacto.findUnique({
      where: { telefono },
    });

    if (existe) {
      throw new ErrorConflicto(
        `El teléfono ${telefono} ya existe`,
        'CONTACTO_YA_EXISTE',
      );
    }

    const ahora = new Date();
    const registro = await this.prisma.contacto.create({
      data: {
        telefono,
        nombre,
        creadoEn: ahora,
        actualizadoEn: ahora,
      },
    });

    return this.mapper.toDominio(registro);
  }

  async crearMasivo(contactos: Array<{ telefono: string; nombre?: string }>): Promise<{ insertados: number }> {
    const ahora = new Date();
    const datos = contactos.map(c => ({
      telefono: c.telefono,
      nombre: c.nombre,
      creadoEn: ahora,
      actualizadoEn: ahora,
    }));

    const resultado = await this.prisma.contacto.createMany({
      data: datos,
      skipDuplicates: true,
    });

    return { insertados: resultado.count };
  }

  async buscarPorId(id: bigint): Promise<Contacto | null> {
    const registro = await this.prisma.contacto.findUnique({ where: { id } });
    return registro ? this.mapper.toDominio(registro) : null;
  }

  async buscarPorTelefono(telefono: string): Promise<Contacto | null> {
    const registro = await this.prisma.contacto.findUnique({
      where: { telefono },
    });
    return registro ? this.mapper.toDominio(registro) : null;
  }

  async listar(filtros: FiltrarContactosDto): Promise<PaginadoContactos> {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 50;
    const saltar = (pagina - 1) * limite;

    const where = {
      ...(filtros.estadoValidacion && {
        estadoValidacion: filtros.estadoValidacion,
      }),
      ...(filtros.estadoWhatsapp && {
        estadoWhatsapp: filtros.estadoWhatsapp,
      }),
      ...(filtros.telefono && {
        telefono: { contains: filtros.telefono },
      }),
    };

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.contacto.findMany({
        where,
        skip: saltar,
        take: limite,
        orderBy: { id: 'asc' },
      }),
      this.prisma.contacto.count({ where }),
    ]);

    return {
      datos: registros.map((r) => this.mapper.toDominio(r)),
      total,
      pagina,
      limite,
    };
  }

  async obtenerSiguienteDisponible(): Promise<Contacto | null> {
    const registro = await this.prisma.contacto.findFirst({
      where: { estadoValidacion: EstadoValidacion.Pendiente },
      orderBy: { id: 'asc' },
    });

    return registro ? this.mapper.toDominio(registro) : null;
  }

  /**
   * Reserva atómicamente un contacto para un cliente.
   * Usa transacción para evitar concurrencia.
   */
  async reservarParaValidacion(
    id: bigint,
    clienteId: bigint,
  ): Promise<{ contacto: Contacto; validacionId: bigint }> {
    const ahora = new Date();

    const resultado = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const contacto = await tx.contacto.findUnique({ where: { id } });

      if (
        !contacto ||
        contacto.estadoValidacion !== EstadoValidacion.Pendiente
      ) {
        return null;
      }

      const contactoActualizado = await tx.contacto.update({
        where: { id },
        data: {
          estadoValidacion: EstadoValidacion.Validando,
          actualizadoEn: ahora,
        },
      });

      const validacion = await tx.validacion.create({
        data: {
          contactoId: id,
          clienteId,
          estado: EstadoValidacion.Validando,
          iniciadoEn: ahora,
          creadoEn: ahora,
          actualizadoEn: ahora,
        },
      });

      return { contacto: contactoActualizado, validacionId: validacion.id };
    });

    if (!resultado) {
      return null as unknown as { contacto: Contacto; validacionId: bigint };
    }

    return {
      contacto: this.mapper.toDominio(resultado.contacto),
      validacionId: resultado.validacionId,
    };
  }

  async actualizarEstado(
    id: bigint,
    estadoValidacion: EstadoValidacion,
    estadoWhatsapp?: string,
  ): Promise<Contacto> {
    const registro = await this.prisma.contacto.update({
      where: { id },
      data: {
        estadoValidacion,
        ...(estadoWhatsapp && { estadoWhatsapp }),
        ultimaValidacion: new Date(),
        actualizadoEn: new Date(),
      },
    });

    return this.mapper.toDominio(registro);
  }
}
