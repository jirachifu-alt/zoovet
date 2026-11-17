/**
 * Normaliza los errores HTTP para mostrarlos al usuario.
 * Prioriza el mensaje enviado por el backend y evita exponer
 * mensajes técnicos como "Http failure response...".
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const httpError = error as
    | {
        status?: number;
        message?: string;
        error?: unknown;
      }
    | null
    | undefined;

  const body = httpError?.error;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body && typeof body === 'object') {
    const payload = body as Record<string, unknown>;
    const candidate = payload['error'] ?? payload['message'] ?? payload['detail'];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  switch (httpError?.status) {
    case 0:
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
    case 401:
      return 'Tu sesión expiró o las credenciales no son válidas.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'No se encontró el recurso solicitado.';
  }

  if (httpError?.status && httpError.status >= 500) {
    return 'El servidor presentó un error. Intenta nuevamente en unos momentos.';
  }

  const message = typeof httpError?.message === 'string' ? httpError.message : '';
  if (message && !message.startsWith('Http failure response')) {
    return message;
  }

  return fallback;
}
