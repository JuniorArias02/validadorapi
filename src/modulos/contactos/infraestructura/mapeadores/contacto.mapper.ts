import { Injectable } from '@nestjs/common';
import { Contacto as ContactoPrisma } from '@prisma/client';
import { Contacto } from 'modulos/contactos/dominio/entidades/contacto.entidad';
import {
  EstadoValidacion,
  EstadoWhatsApp,
} from 'modulos/contactos/dominio/enums/estados.enum';

/**
 * Convierte un registro de Prisma a la entidad de dominio Contacto.
 */
@Injectable()
export class ContactoMapper {
  toDominio(registro: ContactoPrisma): Contacto {
    return new Contacto({
      id: registro.id,
      telefono: registro.telefono,
      nombre: registro.nombre,
      estadoWhatsapp: registro.estadoWhatsapp as EstadoWhatsApp,
      estadoValidacion: registro.estadoValidacion as EstadoValidacion,
      ultimaValidacion: registro.ultimaValidacion,
      creadoEn: registro.creadoEn,
      actualizadoEn: registro.actualizadoEn,
    });
  }
}
