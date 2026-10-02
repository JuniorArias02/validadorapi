import { Module } from '@nestjs/common';
import { ObtenerEstadisticasUseCase } from './aplicacion/casos-uso/obtener-estadisticas.use-case';
import { EstadisticasController } from './presentacion/controladores/estadisticas.controller';

@Module({
  controllers: [EstadisticasController],
  providers: [ObtenerEstadisticasUseCase],
})
export class EstadisticasModule {}
