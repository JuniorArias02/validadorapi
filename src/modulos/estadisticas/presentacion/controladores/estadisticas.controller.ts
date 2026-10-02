import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'compartido/decoradores/api-key.guard';
import { ObtenerEstadisticasUseCase } from 'modulos/estadisticas/aplicacion/casos-uso/obtener-estadisticas.use-case';
import { respuestaExitosa, RespuestaApi } from 'compartido/respuestas/respuesta-api';

@Controller('estadisticas')
@UseGuards(ApiKeyGuard)
export class EstadisticasController {
  constructor(
    private readonly obtenerEstadisticas: ObtenerEstadisticasUseCase,
  ) {}

  @Get()
  async obtener(): Promise<RespuestaApi> {
    const estadisticas = await this.obtenerEstadisticas.ejecutar();
    return respuestaExitosa('Estadísticas obtenidas correctamente', estadisticas);
  }
}
