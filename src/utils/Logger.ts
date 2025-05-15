import { Node } from 'node-red'

export interface Logger {
	info: (msg: string) => void;
	warn: (msg: string) => void;
	error: (msg: string) => void;
	debug: (msg: string) => void;
}

/**
 * This is meant as a quick and dirty replacement for the internal logger.
 * Unfortunately suddenly the internal logger stopped working, especially in docker.
 * Even custom loggers in settings.js weren't called anymore :-(
 */
export class ConsoleLogger implements Logger {
	public constructor(private node: Node) {
		//
	}

	protected log(logLevel: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: unknown[]): void {
		// const date = new Date().toISOString().substring(0, 19);

		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const d = new Date();
		const time = [d.getHours().toString().padStart(2, '0'), d.getMinutes().toString().padStart(2, '0'), d.getSeconds().toString().padStart(2, '0')].join(
			':'
		);
		const date = `${d.getDate()} ${months[d.getMonth()]} ${time}`;

		if (!!args && args.length > 0) {
			console.log(`${date} - [${logLevel}] ${this.node.type ?? 'nodered'} : ${message}`, args);
		} else {
			console.log(`${date} - [${logLevel}] ${this.node.type ?? 'nodered'} : ${message}`);
		}
	}

	public info(msg: string): void {
		this.log('info', msg);
	}

	public warn(msg: string): void {
		this.log('warn', msg);
	}

	public error(msg: string): void {
		this.log('error', msg);
	}

	public debug(msg: string): void {
		this.log('debug', msg);
	}
}
