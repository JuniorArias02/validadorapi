import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorAplicacion } from 'compartido/errores/errores-aplicacion';
import { respuestaError } from 'compartido/respuestas/respuesta-api';

/**
 * Filtro global que intercepta todas las excepciones y las convierte
 * a respuestas HTTP con el formato estándar de la API.
 */
@Catch()
export class FiltroExcepcionesGlobal implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepcionesGlobal.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const respuesta = ctx.getResponse<Response>();

    if (excepcion instanceof ErrorAplicacion) {
      respuesta.status(excepcion.estadoHttp).json(
        respuestaError(excepcion.mensaje, excepcion.codigo),
      );
      return;
    }

    if (excepcion instanceof HttpException) {
      const estado = excepcion.getStatus();
      const cuerpo = excepcion.getResponse();

      const mensaje =
        typeof cuerpo === 'object' && 'message' in (cuerpo as object)
          ? Array.isArray((cuerpo as { message: unknown }).message)
            ? ((cuerpo as { message: string[] }).message).join(', ')
            : String((cuerpo as { message: unknown }).message)
          : excepcion.message;

      respuesta.status(estado).json(
        respuestaError(mensaje, `HTTP_${estado}`),
      );
      return;
    }

    this.logger.error('Error interno no controlado', excepcion);
    respuesta.status(500).json(
      respuestaError('Error interno del servidor', 'ERROR_INTERNO'),
    );
  }
}
