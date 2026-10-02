import { Injectable } from '@nestjs/common';
import { ContactoRepository } from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { CrearContactoDto } from 'modulos/contactos/aplicacion/dto/crear-contacto.dto';
import { Contacto } from 'modulos/contactos/dominio/entidades/contacto.entidad';

/**
 * Caso de uso: Crear un nuevo contacto.
 */
@Injectable()
export class CrearContactoUseCase {
  constructor(private readonly contactoRepository: ContactoRepository) {}

  async ejecutar(dto: CrearContactoDto): Promise<Contacto> {
    return this.contactoRepository.crear(dto.telefono, dto.nombre);
  }
}
