import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

/**
 * DTO para crear un nuevo contacto.
 */
export class CrearContactoDto {
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(20)
  @Matches(/^\d{7,20}$/, {
    message: 'El teléfono debe contener entre 7 y 20 dígitos',
  })
  telefono: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;
}
