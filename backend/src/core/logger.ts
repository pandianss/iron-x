import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const Logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()           // Machine-readable in production
          )
        : winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} ${level}: ${message}${metaStr}`;
            })
          ),
    transports: [
        new winston.transports.Console()
    ],
    // Prevent unhandled errors from crashing the process
    exitOnError: false,
});

// Capture unhandled rejections
process.on('unhandledRejection', (reason) => {
    Logger.error('Unhandled rejection', { reason });
});
