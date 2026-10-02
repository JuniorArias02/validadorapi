import { Injectable } from '@nestjs/common';
import { ContactoRepository } from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { CrearContactosMasivosDto } from 'modulos/contactos/aplicacion/dto/crear-contactos-masivos.dto';

/**
 * Caso de uso: Crear múltiples contactos masivamente.
 * Se omiten los números que ya existen.
 */
@Injectable()
export class CrearContactosMasivosUseCase {
  constructor(private readonly contactoRepository: ContactoRepository) {}

  async ejecutar(dto: CrearContactosMasivosDto): Promise<{ insertados: number }> {
    return this.contactoRepository.crearMasivo(dto.contactos);
  }
}
