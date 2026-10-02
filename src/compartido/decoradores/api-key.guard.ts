import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'infraestructura/prisma/prisma.service';
import {
  ErrorAutenticacion,
  ErrorNoAutorizado,
} from 'compartido/errores/errores-aplicacion';

/**
 * Guard que protege los endpoints mediante API Key + API Secret.
 *
 * Flujo:
 *   Request
 *     → leer X-API-KEY y X-API-SECRET
 *     → buscar clave activa en BD
 *     → verificar secreto contra hash
 *     → registrar último uso
 *     → continuar
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const solicitud = context.switchToHttp().getRequest<Request>();

    const apiKey = solicitud.headers['x-api-key'];
    const apiSecret = solicitud.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
      throw new ErrorAutenticacion('Se requieren X-API-KEY y X-API-SECRET');
    }

    const clave = await this.prisma.apiClave.findUnique({
      where: { clave: String(apiKey) },
    });

    if (!clave) {
      this.logger.warn(`Intento de acceso con API Key desconocida: ${apiKey}`);
      throw new ErrorAutenticacion();
    }

    if (!clave.activa) {
      throw new ErrorNoAutorizado('Credencial desactivada');
    }

    const secretoValido = await bcrypt.compare(String(apiSecret), clave.secretoHash);

    if (!secretoValido) {
      this.logger.warn(`Secreto inválido para clave: ${clave.nombre}`);
      throw new ErrorAutenticacion();
    }

    // Registrar último uso sin bloquear la solicitud
    this.prisma.apiClave
      .update({
        where: { id: clave.id },
        data: { ultimoUso: new Date() },
      })
      .catch((err) =>
        this.logger.error('Error al actualizar último uso de clave', err),
      );

    return true;
  }
}
