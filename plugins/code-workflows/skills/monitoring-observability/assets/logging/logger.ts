/**
 * Structured Logger with Pino
 * Production-ready logging with JSON output
 */

import pino, { type Logger, type LoggerOptions } from "pino";

// Log levels
type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

// Base context for all logs
interface BaseContext {
	service: string;
	environment: string;
	version: string;
}

// Request context
interface RequestContext {
	requestId: string;
	method: string;
	path: string;
	userId?: string;
	ip?: string;
	userAgent?: string;
}

// Error context
interface ErrorContext {
	error: {
		name: string;
		message: string;
		stack?: string;
		code?: string;
	};
}

// Create base logger configuration
function createLoggerConfig(options?: {
	level?: LogLevel;
	pretty?: boolean;
}): LoggerOptions {
	const isDev = process.env.NODE_ENV === "development";
	const level = options?.level || (isDev ? "debug" : "info");
	const pretty = options?.pretty ?? isDev;

	return {
		level,
		timestamp: pino.stdTimeFunctions.isoTime,

		// Base bindings
		base: {
			service: process.env.SERVICE_NAME || "app",
			environment: process.env.NODE_ENV || "development",
			version: process.env.npm_package_version || "unknown",
		},

		// Formatting
		formatters: {
			level: (label) => ({ level: label }),
			bindings: (bindings) => ({
				pid: bindings.pid,
				hostname: bindings.hostname,
				...bindings,
			}),
		},

		// Redaction of sensitive fields
		redact: {
			paths: [
				"password",
				"token",
				"accessToken",
				"refreshToken",
				"apiKey",
				"secret",
				"authorization",
				"cookie",
				"*.password",
				"*.token",
				"*.apiKey",
				"req.headers.authorization",
				"req.headers.cookie",
			],
			censor: "[REDACTED]",
		},

		// Pretty printing for development
		transport: pretty
			? {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss.l",
						ignore: "pid,hostname",
						messageFormat: "{msg}",
					},
				}
			: undefined,
	};
}

// Create the main logger instance
const baseLogger = pino(createLoggerConfig());

// Extended logger with helper methods
class AppLogger {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	// Basic log methods
	trace(msg: string, data?: Record<string, unknown>) {
		this.logger.trace(data, msg);
	}

	debug(msg: string, data?: Record<string, unknown>) {
		this.logger.debug(data, msg);
	}

	info(msg: string, data?: Record<string, unknown>) {
		this.logger.info(data, msg);
	}

	warn(msg: string, data?: Record<string, unknown>) {
		this.logger.warn(data, msg);
	}

	error(msg: string, error?: Error | unknown, data?: Record<string, unknown>) {
		const errorContext = this.formatError(error);
		this.logger.error({ ...errorContext, ...data }, msg);
	}

	fatal(msg: string, error?: Error | unknown, data?: Record<string, unknown>) {
		const errorContext = this.formatError(error);
		this.logger.fatal({ ...errorContext, ...data }, msg);
	}

	// Create child logger with additional context
	child(bindings: Record<string, unknown>): AppLogger {
		return new AppLogger(this.logger.child(bindings));
	}

	// Create request-scoped logger
	withRequest(context: Partial<RequestContext>): AppLogger {
		return this.child({
			requestId: context.requestId,
			method: context.method,
			path: context.path,
			userId: context.userId,
		});
	}

	// Create user-scoped logger
	withUser(userId: string, metadata?: Record<string, unknown>): AppLogger {
		return this.child({
			userId,
			...metadata,
		});
	}

	// Format error for logging
	private formatError(error: unknown): Partial<ErrorContext> {
		if (!error) return {};

		if (error instanceof Error) {
			return {
				error: {
					name: error.name,
					message: error.message,
					stack: error.stack,
					code: (error as Error & { code?: string }).code,
				},
			};
		}

		return {
			error: {
				name: "UnknownError",
				message: String(error),
			},
		};
	}

	// Timing helper
	startTimer(): () => number {
		const start = process.hrtime.bigint();
		return () => {
			const end = process.hrtime.bigint();
			return Number(end - start) / 1_000_000; // Convert to milliseconds
		};
	}

	// Log with timing
	timed<T>(
		operation: string,
		fn: () => T | Promise<T>,
		metadata?: Record<string, unknown>,
	): T | Promise<T> {
		const getElapsed = this.startTimer();

		const logComplete = (result: "success" | "error", error?: unknown) => {
			const durationMs = getElapsed();
			if (result === "success") {
				this.info(`${operation} completed`, { durationMs, ...metadata });
			} else {
				this.error(`${operation} failed`, error, { durationMs, ...metadata });
			}
		};

		try {
			const result = fn();

			if (result instanceof Promise) {
				return result
					.then((value) => {
						logComplete("success");
						return value;
					})
					.catch((error) => {
						logComplete("error", error);
						throw error;
					});
			}

			logComplete("success");
			return result;
		} catch (error) {
			logComplete("error", error);
			throw error;
		}
	}
}

// Export singleton instance
export const logger = new AppLogger(baseLogger);

// Export types
export type { LogLevel, RequestContext, ErrorContext, BaseContext };

// Export for creating custom loggers
export { createLoggerConfig, AppLogger };
