import { NodeDefinition } from "@redts/api/NodeDefinition";
import { NodePropertyType } from "@redts/api/NodePropertyType";
import { ConsoleLogger, Logger } from "@redts/utils/Logger";
import { Node, NodeAPI, NodeMessage, NodeStatus } from 'node-red';

export abstract class AbstractNode<MESSAGE extends NodeMessage = NodeMessage, PROPERTIES = { [key: string]: unknown }> {
	protected node!: Node<Record<string, unknown>>;
	protected config!: NodeDefinition;
	protected logger!: Logger;

	protected returnTopic?: string;
	// protected properties: PROPERTIES = {} as PROPERTIES;

	public constructor(protected RED: NodeAPI) {
		//
	}

	/**
	 * Can be used to initialize properties from the NodeDef config.
	 */
	protected initProperties(RED: NodeAPI, config: NodeDefinition, msg?: MESSAGE) {
		this.logger = new ConsoleLogger(this.node);

		// only use properties that don't end with "Type"
		const allKeys = Object.keys(config) ?? ({} as Record<string, string>);
		const properties: string[] = allKeys.filter((key) => !key.endsWith('Type')).filter((key) => !['wires', 'x', 'y', 'z', 'id', 'type'].includes(key));

		for (const prop of properties) {
			const propType: string = config[`${prop}Type`] ?? ('str' as NodePropertyType);
			const rawPropValue: string = config[prop] ?? '';
			let parsedPropValue = this.RED.util.evaluateNodeProperty(rawPropValue, propType, this.node, msg as any);

			if (propType == 'msg' && rawPropValue === parsedPropValue) {
				// parsedPropValue = `msg.${parsedPropValue}`;
				parsedPropValue = undefined;
			}

			this.setProperty(prop as keyof PROPERTIES, parsedPropValue);
		}

		this.checkProperties(RED, config, msg);
	}

	protected checkProperties(RED: NodeAPI, config: NodeDefinition, msg?: MESSAGE): void {
		//
	}

	protected evaluateNodeProperty<T = unknown>(value: string, type: NodePropertyType): T {
		return this.RED.util.evaluateNodeProperty(value, type, this.node, null as any);
	}

	protected evaluateMessageProperty<T = unknown>(value: string, type: NodePropertyType, msg: NodeMessage): T {
		return this.RED.util.evaluateNodeProperty(value, type, this.node, msg);
	}

	/**
	 * Sets a plain text node status.
	 */
	protected set status(status: string) {
		this.setStatus({ text: status });
	}

	/**
	 * Clears the node status.
	 */
	protected clearStatus() {
		this.node.status('');
	}

	// protected get properties(): PROPERTIES {
	// 	return this.node.context() as PROPERTIES;
	// }

	// protected getProperty<T>(property: keyof PROPERTIES): T | undefined {
	// 	return (this.properties as any)[property] as T | undefined;
	// }

	protected getProperty<T>(property: keyof PROPERTIES): T | undefined {
		return this.node.context().get(property as string) as T;
	}

	protected setProperty<T>(property: keyof PROPERTIES, value: T): void {
		this.node.context().set(property as string, value);
	}

	// protected showNotification(message: string): void {
	// 	console.log(message);
	// }

	/**
	 * Sets the node status, allowing to set the fill mode and the shape.
	 */
	protected setStatus(status: NodeStatus = { fill: 'blue', shape: 'ring', text: '' }) {
		this.node.status(status);

		if (status?.text) {
			this.log.info(`${this.nodeName} - ${status?.text}`);
		}
	}

	protected get nodeName(): string {
		return this.config.name || this.node.type;
	}

	private async onInputEvent(msg?: MESSAGE): Promise<void> {
		// re-init properties, in case the referenced context data has changed
		this.initProperties(this.RED, this.config, msg);

		try {
			const returnMessages = await this.onInput(msg);

			if (returnMessages?.length) {
				this.node.send(returnMessages);
			}
		} catch (error) {
			this.node.error(error, msg as NodeMessage);
		}
	}

	private async onCloseEvent(msg?: MESSAGE): Promise<void> {
		try {
			const returnMessages = await this.onClose(msg);

			if (returnMessages?.length) {
				this.node.send(returnMessages);
			}
		} catch (error) {
			this.node.error(error, msg as NodeMessage);
		}
	}

	/**
	 * Can be overriden to react to message inputs.
	 */
	protected async onInput(msg?: MESSAGE): Promise<Array<NodeMessage | null>> {
		return [];
	}

	/**
	 * Can be overriden to react to onClose.
	 */
	protected async onClose(msg?: MESSAGE): Promise<NodeMessage[]> {
		return [];
	}

	protected get context() {
		return this.node.context();
	}

	protected get globalContext() {
		return this.context.global;
	}

	protected get flowContext() {
		return this.context.flow;
	}

	protected get log(): Logger {
		return this.logger;
	}

	protected setReturnTopic(topic: string) {
		this.returnTopic = topic;
	}

	public static createNode(RED: NodeAPI, nodeType: new (RED: NodeAPI) => AbstractNode<NodeMessage, unknown>) {
		RED.nodes.registerType(
			nodeType.name,
			function (this: Node<Record<string, unknown>>, config: NodeDefinition) {
				const controller = new nodeType(RED);
				controller.node = this;
				controller.config = config;

				RED.nodes.createNode(this, config);

				controller.initProperties.bind(controller).call(controller, RED, config as NodeDefinition);

				this.on('input', controller.onInputEvent.bind(controller));
				// this.on('close', controller.onClose.bind(controller));
			},
			{}
		);
	}

	protected getEmptyResult(msg?: NodeMessage): NodeMessage[] {
		const summaryMsg: NodeMessage = {
			...msg,
			payload: undefined,
			topic: this.returnTopic
		};
		return [summaryMsg];
	}

	public get nodeType(): string {
		return this.node.type;
	}
}
