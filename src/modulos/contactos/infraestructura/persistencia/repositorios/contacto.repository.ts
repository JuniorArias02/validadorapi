import { Contacto } from 'modulos/contactos/dominio/entidades/contacto.entidad';
import { EstadoValidacion } from 'modulos/contactos/dominio/enums/estados.enum';
import { FiltrarContactosDto } from 'modulos/contactos/aplicacion/dto/filtrar-contactos.dto';

export interface PaginadoContactos {
  datos: Contacto[];
  total: number;
  pagina: number;
  limite: number;
}

/**
 * Interfaz del repositorio de contactos.
 * Los casos de uso dependen de esta abstracción, no de Prisma.
 */
export abstract class ContactoRepository {
  abstract crear(telefono: string, nombre?: string): Promise<Contacto>;
  abstract crearMasivo(contactos: Array<{ telefono: string; nombre?: string }>): Promise<{ insertados: number }>;
  abstract buscarPorId(id: bigint): Promise<Contacto | null>;
  abstract buscarPorTelefono(telefono: string): Promise<Contacto | null>;
  abstract listar(filtros: FiltrarContactosDto): Promise<PaginadoContactos>;
  abstract obtenerSiguienteDisponible(): Promise<Contacto | null>;
  abstract reservarParaValidacion(
    id: bigint,
    clienteId: bigint,
  ): Promise<{ contacto: Contacto; validacionId: bigint }>;
  abstract actualizarEstado(
    id: bigint,
    estadoValidacion: EstadoValidacion,
    estadoWhatsapp?: string,
  ): Promise<Contacto>;
}
