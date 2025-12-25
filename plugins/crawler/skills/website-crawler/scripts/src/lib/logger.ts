/**
 * Structured logger with timestamp and log levels
 * Similar to AdonisJS logger: https://docs.adonisjs.com/guides/digging-deeper/logger
 */

import type { LogLevel } from "./types";

interface Colors {
	RED: string;
	GREEN: string;
	YELLOW: string;
	BLUE: string;
	PURPLE: string;
	CYAN: string;
	GRAY: string;
	NC: string;
}

const colors: Colors = {
	RED: "\x1b[0;31m",
	GREEN: "\x1b[0;32m",
	YELLOW: "\x1b[1;33m",
	BLUE: "\x1b[0;34m",
	PURPLE: "\x1b[0;35m",
	CYAN: "\x1b[0;36m",
	GRAY: "\x1b[0;90m",
	NC: "\x1b[0m",
};

const colorMap: Record<LogLevel, string> = {
	TRACE: colors.GRAY,
	DEBUG: colors.CYAN,
	INFO: colors.BLUE,
	WARN: colors.YELLOW,
	ERROR: colors.RED,
	FATAL: colors.PURPLE,
};

export class Logger {
	private name: string;

	constructor(name: string = "crawler") {
		this.name = name;
	}

	private formatTimestamp(): string {
		const now = new Date();
		return now.toISOString().replace("T", " ").substring(0, 19);
	}

	private log(level: LogLevel, message: string): void {
		const timestamp = this.formatTimestamp();
		const color = colorMap[level];
		console.log(`${color}[${timestamp}] ${level}: ${message}${colors.NC}`);
	}

	trace(message: string): void {
		this.log("TRACE", message);
	}

	debug(message: string): void {
		this.log("DEBUG", message);
	}

	info(message: string): void {
		this.log("INFO", message);
	}

	warn(message: string): void {
		this.log("WARN", message);
	}

	error(message: string): void {
		this.log("ERROR", message);
	}

	fatal(message: string): void {
		this.log("FATAL", message);
	}
}

export const logger = new Logger("web-crawler");
