import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import { ApiKeyGuard } from 'compartido/decoradores/api-key.guard';
import { ObtenerSiguienteValidacionUseCase } from 'modulos/validaciones/aplicacion/casos-uso/obtener-siguiente-validacion.use-case';
import { RegistrarResultadoValidacionUseCase } from 'modulos/validaciones/aplicacion/casos-uso/registrar-resultado-validacion.use-case';
import { RegistrarResultadoDto } from 'modulos/validaciones/aplicacion/dto/registrar-resultado.dto';
import {
  respuestaExitosa,
  RespuestaApi,
} from 'compartido/respuestas/respuesta-api';

@Controller('validaciones')
@UseGuards(ApiKeyGuard)
export class ValidacionesController {
  constructor(
    private readonly obtenerSiguiente: ObtenerSiguienteValidacionUseCase,
    private readonly registrarResultado: RegistrarResultadoValidacionUseCase,
  ) {}

  @Post('siguiente')
  @HttpCode(HttpStatus.OK)
  async siguiente(@Headers('x-cliente-id') clienteIdHeader: string): Promise<RespuestaApi> {
    const clienteId = BigInt(clienteIdHeader ?? '0');
    const trabajo = await this.obtenerSiguiente.ejecutar(clienteId);
    return respuestaExitosa('Trabajo asignado correctamente', trabajo);
  }

  @Post(':id/resultado')
  @HttpCode(HttpStatus.OK)
  async resultado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarResultadoDto,
  ): Promise<RespuestaApi> {
    await this.registrarResultado.ejecutar(BigInt(id), dto);
    return respuestaExitosa('Resultado registrado correctamente');
  }
}
