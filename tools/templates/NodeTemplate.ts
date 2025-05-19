import { NodeAPI, NodeMessage } from 'node-red';
import { AbstractNode } from 'node-red-ts/api/AbstractNode';

class __NODE_CLASS__ extends AbstractNode<NodeMessage> {
	public constructor(RED: NodeAPI) {
		super(RED);
	}

	public override async onInput(msg?: NodeMessage): Promise<NodeMessage[]> {
		console.debug('input');
		this.status = '';
		return [{ payload: '__NODE_NAME__ test' }];
	}

	public override async onClose(msg?: NodeMessage): Promise<NodeMessage[]> {
		console.debug('close');
		this.status = '';
		return [{ payload: '__NODE_NAME__ test' }];
	}
}

module.exports = (RED: NodeAPI) => AbstractNode.createNode(RED, __NODE_CLASS__);
