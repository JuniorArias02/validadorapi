import { EstadoWhatsApp, EstadoValidacion } from '../enums/estados.enum';

/**
 * Entidad de dominio — Contacto.
 * Representa un número de teléfono a validar.
 * Independiente de Prisma, NestJS y cualquier framework externo.
 */
export class Contacto {
  readonly id: bigint;
  readonly telefono: string;
  readonly nombre: string | null;
  readonly estadoWhatsapp: EstadoWhatsApp;
  readonly estadoValidacion: EstadoValidacion;
  readonly ultimaValidacion: Date | null;
  readonly creadoEn: Date;
  readonly actualizadoEn: Date;

  constructor(props: {
    id: bigint;
    telefono: string;
    nombre: string | null;
    estadoWhatsapp: EstadoWhatsApp;
    estadoValidacion: EstadoValidacion;
    ultimaValidacion: Date | null;
    creadoEn: Date;
    actualizadoEn: Date;
  }) {
    this.id = props.id;
    this.telefono = props.telefono;
    this.nombre = props.nombre;
    this.estadoWhatsapp = props.estadoWhatsapp;
    this.estadoValidacion = props.estadoValidacion;
    this.ultimaValidacion = props.ultimaValidacion;
    this.creadoEn = props.creadoEn;
    this.actualizadoEn = props.actualizadoEn;
  }

  estaDisponibleParaValidar(): boolean {
    return this.estadoValidacion === EstadoValidacion.Pendiente;
  }

  estaValidando(): boolean {
    return this.estadoValidacion === EstadoValidacion.Validando;
  }
}
