import { env } from '@/config';
import { LOGGER } from '@/shared/constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: Record<string, LogLevel> = { development: 'debug', staging: 'info', production: 'warn' };

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class AppLogger {
  private readonly minLevel: number;
  private errorBuffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.minLevel = LEVEL_PRIORITY[MIN_LEVEL[env.ENV] ?? 'debug'];
  }

  debug(message: string, data?: Record<string, unknown>): void { this.log('debug', message, data); }
  info(message: string, data?: Record<string, unknown>): void { this.log('info', message, data); }
  warn(message: string, data?: Record<string, unknown>): void { this.log('warn', message, data); }
  error(message: string, data?: Record<string, unknown>): void { this.log('error', message, data); }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_PRIORITY[level] < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      data: data ? this.sanitize(data) : undefined,
      timestamp: new Date().toISOString(),
    };

    const consoleMethod =
      level === 'error' ? console.error
      : level === 'warn' ? console.warn
      : level === 'debug' ? console.debug
      : console.log;

    consoleMethod(`[${level.toUpperCase()}]`, message, data ?? '');

    if (level === 'error' && env.ENV !== 'development') {
      this.errorBuffer.push(entry);
      this.scheduleFlush();
    }
  }

  private sanitize(data: Record<string, unknown>): Record<string, unknown> {
    const cleaned = { ...data };
    for (const key of Object.keys(cleaned)) {
      if (LOGGER.SENSITIVE_FIELDS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        cleaned[key] = '[REDACTED]';
      }
    }
    return cleaned;
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, LOGGER.FLUSH_INTERVAL_MS);
  }

  private flush(): void {
    if (this.errorBuffer.length === 0) return;
    const batch = this.errorBuffer.splice(0);
    // Ship to remote logging endpoint in production
    void batch; // placeholder — implement remote transport
  }
}

export const logger = new AppLogger();
