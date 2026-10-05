import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoValidacion, EstadoWhatsApp } from '../../dominio/enums/estados.enum';

/**
 * DTO para filtrar y paginar la lista de contactos.
 */
export class FiltrarContactosDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoValidacion))
  estadoValidacion?: EstadoValidacion;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoWhatsApp))
  estadoWhatsapp?: EstadoWhatsApp;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 50;
}
