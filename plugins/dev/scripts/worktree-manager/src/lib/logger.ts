/**
 * Structured logger for Worktree Manager
 * Inspired by AdonisJS logger patterns
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "success";

class Logger {
	private debugEnabled = false;

	setDebug(enabled: boolean) {
		this.debugEnabled = enabled;
	}

	private format(level: LogLevel, message: string, data?: any): string {
		const timestamp = new Date().toISOString();
		const levelUpper = level.toUpperCase().padEnd(7);

		let output = `[${timestamp}] ${levelUpper} ${message}`;

		if (data) {
			output += `\n${JSON.stringify(data, null, 2)}`;
		}

		return output;
	}

	debug(message: string, data?: any) {
		if (this.debugEnabled) {
			console.log(this.format("debug", message, data));
		}
	}

	info(message: string, data?: any) {
		console.log(this.format("info", message, data));
	}

	success(message: string, data?: any) {
		console.log(this.format("success", message, data));
	}

	warn(message: string, data?: any) {
		console.warn(this.format("warn", message, data));
	}

	error(message: string, data?: any) {
		console.error(this.format("error", message, data));
	}

	separator(char = "=", length = 60) {
		console.log(char.repeat(length));
	}

	section(title: string) {
		this.separator();
		console.log(title.toUpperCase());
		this.separator();
	}

	table(data: Record<string, any>) {
		const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));

		for (const [key, value] of Object.entries(data)) {
			const paddedKey = key.padEnd(maxKeyLength);
			console.log(`${paddedKey}  ${value}`);
		}
	}
}

export const logger = new Logger();
