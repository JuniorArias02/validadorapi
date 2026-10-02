/**
 * Errores de dominio/aplicación de la API.
 * Permiten comunicar fallos de negocio sin exponer detalles internos.
 */

export class ErrorAplicacion extends Error {
  constructor(
    public readonly mensaje: string,
    public readonly codigo: string,
    public readonly estadoHttp: number = 400,
  ) {
    super(mensaje);
    this.name = 'ErrorAplicacion';
  }
}

export class ErrorNoEncontrado extends ErrorAplicacion {
  constructor(recurso: string) {
    super(`${recurso} no encontrado`, 'NO_ENCONTRADO', 404);
  }
}

export class ErrorConflicto extends ErrorAplicacion {
  constructor(mensaje: string, codigo: string) {
    super(mensaje, codigo, 409);
  }
}

export class ErrorAutenticacion extends ErrorAplicacion {
  constructor(mensaje = 'Credenciales inválidas') {
    super(mensaje, 'ERROR_AUTENTICACION', 401);
  }
}

export class ErrorNoAutorizado extends ErrorAplicacion {
  constructor(mensaje = 'Acceso denegado') {
    super(mensaje, 'NO_AUTORIZADO', 403);
  }
}
