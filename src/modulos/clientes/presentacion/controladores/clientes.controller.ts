import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiKeyGuard } from 'compartido/decoradores/api-key.guard';
import { ListarClientesUseCase } from 'modulos/clientes/aplicacion/casos-uso/listar-clientes.use-case';
import { RegistrarLatidoUseCase } from 'modulos/clientes/aplicacion/casos-uso/registrar-latido.use-case';
import {
  respuestaExitosa,
  RespuestaApi,
} from 'compartido/respuestas/respuesta-api';

@Controller('clientes')
@UseGuards(ApiKeyGuard)
export class ClientesController {
  constructor(
    private readonly listarClientes: ListarClientesUseCase,
    private readonly registrarLatido: RegistrarLatidoUseCase,
  ) {}

  @Get()
  async listar(): Promise<RespuestaApi> {
    const clientes = await this.listarClientes.ejecutar();
    return respuestaExitosa('Clientes obtenidos correctamente', clientes);
  }

  @Post(':id/latido')
  @HttpCode(HttpStatus.OK)
  async latido(@Param('id', ParseIntPipe) id: number): Promise<RespuestaApi> {
    await this.registrarLatido.ejecutar(BigInt(id));
    return respuestaExitosa('Latido registrado correctamente');
  }
}
