interface LogMeta {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: string, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    
    if (meta && Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  }

  info(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, meta));
    }
    // In production, you might want to send logs to a service
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, meta));
    }
    // In production, you might want to send errors to an error tracking service
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const log = new Logger();
export default log; 