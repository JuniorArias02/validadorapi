/**
 * Estructura de respuesta estándar de la API.
 * Todas las respuestas siguen este contrato.
 */
export interface RespuestaApi<T = unknown> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  error?: string;
}

/**
 * Construye una respuesta exitosa.
 */
export function respuestaExitosa<T>(
  mensaje: string,
  datos?: T,
): RespuestaApi<T> {
  return {
    exito: true,
    mensaje,
    ...(datos !== undefined && { datos }),
  };
}

/**
 * Construye una respuesta de error.
 */
export function respuestaError(
  mensaje: string,
  codigoError: string,
): RespuestaApi<never> {
  return {
    exito: false,
    mensaje,
    error: codigoError,
  };
}
