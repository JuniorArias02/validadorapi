import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiKeyGuard } from 'compartido/decoradores/api-key.guard';
import { CrearContactoUseCase } from 'modulos/contactos/aplicacion/casos-uso/crear-contacto.use-case';
import { CrearContactosMasivosUseCase } from 'modulos/contactos/aplicacion/casos-uso/crear-contactos-masivos.use-case';
import { ListarContactosUseCase } from 'modulos/contactos/aplicacion/casos-uso/listar-contactos.use-case';
import { ObtenerContactoUseCase } from 'modulos/contactos/aplicacion/casos-uso/obtener-contacto.use-case';
import { CrearContactoDto } from 'modulos/contactos/aplicacion/dto/crear-contacto.dto';
import { CrearContactosMasivosDto } from 'modulos/contactos/aplicacion/dto/crear-contactos-masivos.dto';
import { FiltrarContactosDto } from 'modulos/contactos/aplicacion/dto/filtrar-contactos.dto';
import {
  respuestaExitosa,
  RespuestaApi,
} from 'compartido/respuestas/respuesta-api';

/**
 * Controlador de contactos.
 * Responsabilidad: recibir HTTP → validar DTO → ejecutar caso de uso → responder.
 * No contiene lógica de negocio.
 */
@Controller('contactos')
@UseGuards(ApiKeyGuard)
export class ContactosController {
  constructor(
    private readonly crearContacto: CrearContactoUseCase,
    private readonly crearContactosMasivo: CrearContactosMasivosUseCase,
    private readonly listarContactos: ListarContactosUseCase,
    private readonly obtenerContacto: ObtenerContactoUseCase,
  ) {}

  @Get()
  async listar(@Query() filtros: FiltrarContactosDto): Promise<RespuestaApi> {
    const resultado = await this.listarContactos.ejecutar(filtros);
    return respuestaExitosa('Contactos obtenidos correctamente', resultado);
  }

  @Get(':id')
  async obtener(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RespuestaApi> {
    const contacto = await this.obtenerContacto.ejecutar(BigInt(id));
    return respuestaExitosa('Contacto obtenido correctamente', contacto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearContactoDto): Promise<RespuestaApi> {
    const contacto = await this.crearContacto.ejecutar(dto);
    return respuestaExitosa('Contacto creado correctamente', contacto);
  }

  @Post('masivo')
  @HttpCode(HttpStatus.CREATED)
  async crearMasivo(@Body() dto: CrearContactosMasivosDto): Promise<RespuestaApi> {
    const resultado = await this.crearContactosMasivo.ejecutar(dto);
    return respuestaExitosa(`Proceso masivo completado. ${resultado.insertados} contactos nuevos agregados.`, resultado);
  }
}
