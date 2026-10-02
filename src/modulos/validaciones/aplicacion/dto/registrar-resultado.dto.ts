import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { EstadoValidacion, EstadoWhatsApp } from 'modulos/contactos/dominio/enums/estados.enum';

/**
 * DTO para registrar el resultado de una validación.
 */
export class RegistrarResultadoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(EstadoValidacion))
  estado: EstadoValidacion;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(EstadoWhatsApp))
  estadoWhatsapp: EstadoWhatsApp;

  @IsOptional()
  respuesta?: Record<string, unknown>;
}
