type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatMessage(level: LogLevel, context: string, message: string): string {
  return `[${level.toUpperCase()}] [${context}] ${message}`;
}

function createLogger(context: string) {
  return {
    debug(message: string, ...args: unknown[]) {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', context, message), ...args);
      }
    },
    info(message: string, ...args: unknown[]) {
      if (shouldLog('info')) {
        console.info(formatMessage('info', context, message), ...args);
      }
    },
    warn(message: string, ...args: unknown[]) {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', context, message), ...args);
      }
    },
    error(message: string, ...args: unknown[]) {
      if (shouldLog('error')) {
        console.error(formatMessage('error', context, message), ...args);
      }
    }
  };
}

export type Logger = ReturnType<typeof createLogger>;
export { createLogger };
