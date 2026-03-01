/**
 * Structured API logger.
 * Vervangt losse console.log/error calls met consistent formaat.
 * Output is JSON zodat Vercel Logs doorzoekbaar zijn.
 */

interface LogEntry {
  ts: string;
  route: string;
  method?: string;
  status?: number;
  duration_ms?: number;
  error?: string;
  meta?: Record<string, unknown>;
}

function emit(level: 'info' | 'warn' | 'error', entry: LogEntry) {
  const line = JSON.stringify({ level, ...entry });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function logRequest(route: string, method: string, status: number, durationMs: number, meta?: Record<string, unknown>) {
  emit(status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info', {
    ts: new Date().toISOString(),
    route,
    method,
    status,
    duration_ms: durationMs,
    meta,
  });
}

export function logError(route: string, error: unknown, meta?: Record<string, unknown>) {
  emit('error', {
    ts: new Date().toISOString(),
    route,
    error: error instanceof Error ? error.message : String(error),
    meta,
  });
}

export function logInfo(route: string, message: string, meta?: Record<string, unknown>) {
  emit('info', {
    ts: new Date().toISOString(),
    route,
    meta: { message, ...meta },
  });
}

/**
 * Wrapper die duration meet en structured log schrijft.
 * Gebruik: const end = startTimer(); ... end(200);
 */
export function startTimer(route: string, method: string) {
  const start = Date.now();
  return (status: number, meta?: Record<string, unknown>) => {
    logRequest(route, method, status, Date.now() - start, meta);
  };
}
