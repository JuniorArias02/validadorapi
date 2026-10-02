import { Injectable } from '@nestjs/common';
import { ContactoRepository } from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { Contacto } from 'modulos/contactos/dominio/entidades/contacto.entidad';
import { ErrorNoEncontrado } from 'compartido/errores/errores-aplicacion';

/**
 * Caso de uso: Obtener un contacto por su ID.
 */
@Injectable()
export class ObtenerContactoUseCase {
  constructor(private readonly contactoRepository: ContactoRepository) {}

  async ejecutar(id: bigint): Promise<Contacto> {
    const contacto = await this.contactoRepository.buscarPorId(id);

    if (!contacto) {
      throw new ErrorNoEncontrado('Contacto');
    }

    return contacto;
  }
}
