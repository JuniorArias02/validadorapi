import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'infraestructura/prisma/prisma.service';

/**
 * Endpoint de salud — usado por Docker healthcheck y orquestadores.
 * No requiere autenticación.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async verificar() {
    // Verificar conectividad con la base de datos
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      estado: 'ok',
      timestamp: new Date().toISOString(),
      servicio: 'api-central-validador',
    };
  }
}
