import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infraestructura/prisma/prisma.service';

/**
 * Caso de uso: Obtener estadísticas generales del sistema.
 */
@Injectable()
export class ObtenerEstadisticasUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar() {
    const [
      totalContactos,
      contactosPendientes,
      contactosValidando,
      contactosCompletados,
      contactosError,
      contactosConWhatsapp,
      contactosSinWhatsapp,
      clientesActivos,
      validacionesActivas,
    ] = await this.prisma.$transaction([
      this.prisma.contacto.count(),
      this.prisma.contacto.count({ where: { estadoValidacion: 'pendiente' } }),
      this.prisma.contacto.count({ where: { estadoValidacion: 'validando' } }),
      this.prisma.contacto.count({ where: { estadoValidacion: 'completado' } }),
      this.prisma.contacto.count({ where: { estadoValidacion: 'error' } }),
      this.prisma.contacto.count({ where: { estadoWhatsapp: 'activo' } }),
      this.prisma.contacto.count({ where: { estadoWhatsapp: 'inactivo' } }),
      this.prisma.cliente.count({ where: { activa: true } }),
      this.prisma.validacion.count({ where: { estado: 'validando' } }),
    ]);

    const progreso =
      totalContactos > 0
        ? Math.round((contactosCompletados / totalContactos) * 100)
        : 0;

    return {
      contactos: {
        total: totalContactos,
        pendientes: contactosPendientes,
        validando: contactosValidando,
        completados: contactosCompletados,
        errores: contactosError,
      },
      whatsapp: {
        conWhatsapp: contactosConWhatsapp,
        sinWhatsapp: contactosSinWhatsapp,
      },
      clientes: {
        activos: clientesActivos,
      },
      validaciones: {
        activas: validacionesActivas,
      },
      progreso,
    };
  }
}
