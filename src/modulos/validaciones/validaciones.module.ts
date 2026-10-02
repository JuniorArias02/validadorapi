import { Module } from '@nestjs/common';
import { ContactosModule } from '../contactos/contactos.module';
import { ObtenerSiguienteValidacionUseCase } from './aplicacion/casos-uso/obtener-siguiente-validacion.use-case';
import { RegistrarResultadoValidacionUseCase } from './aplicacion/casos-uso/registrar-resultado-validacion.use-case';
import { ValidacionesController } from './presentacion/controladores/validaciones.controller';

@Module({
  imports: [ContactosModule],
  controllers: [ValidacionesController],
  providers: [
    ObtenerSiguienteValidacionUseCase,
    RegistrarResultadoValidacionUseCase,
  ],
})
export class ValidacionesModule {}
