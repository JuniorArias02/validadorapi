import { Injectable } from '@nestjs/common';
import { ContactoRepository, PaginadoContactos } from 'modulos/contactos/infraestructura/persistencia/repositorios/contacto.repository';
import { FiltrarContactosDto } from 'modulos/contactos/aplicacion/dto/filtrar-contactos.dto';

/**
 * Caso de uso: Listar contactos con filtros y paginación.
 */
@Injectable()
export class ListarContactosUseCase {
  constructor(private readonly contactoRepository: ContactoRepository) {}

  async ejecutar(filtros: FiltrarContactosDto): Promise<PaginadoContactos> {
    return this.contactoRepository.listar(filtros);
  }
}
