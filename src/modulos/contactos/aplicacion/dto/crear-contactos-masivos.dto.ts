import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { CrearContactoDto } from './crear-contacto.dto';

/**
 * DTO para crear contactos de manera masiva.
 */
export class CrearContactosMasivosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearContactoDto)
  @ArrayMinSize(1, { message: 'Debe enviar al menos un contacto' })
  contactos: CrearContactoDto[];
}
