# node-red-ts
## Introduction
This project was born because I hate the overly complex and nested structure of the Node-RED API. I wanted something easy and clean and typescript-based.

This is how a simply node looks like:

```ts
import { AbstractNode } from "@redts/api/AbstractNode";
import { NodeAPI, NodeMessage } from "node-red";

class DummyNode extends AbstractNode<NodeMessage> {
	public constructor(RED: NodeAPI) {
		super(RED);
	}

	public override async onInput(msg?: NodeMessage): Promise<NodeMessage[]> {
		console.debug("input");

		this.status = "";
		return [{ payload: "dummy test" }];
	}

	public override async onClose(removed: boolean): Promise<void> {
		console.debug('input');

		this.status = '';
	}
}

module.exports = (RED: NodeAPI) => AbstractNode.createNode(RED, DummyNode);
```

The corresponding HTML file looks a little bit more complex though:
```html
<!-- definition  -->
<script type="text/javascript">
  RED.nodes.registerType("DummyNode", {
    category: "HHLA",
    color: "#1eb3fd",
    icon: "font-awesome/fa-cogs",
    defaults: {
      name: { value: "" },
    },
    inputs: 1,
    outputs: 1,
    outputLabels: [
      "summary",
    ],
    label: function () {
      return this.name || "Dummy"
    },
    paletteLabel: "Dummy",
    oneditprepare: () => {
    }
  });
</script>

<!-- edit dialog -->
<script type="text/html" data-template-name="DummyNode">
  <!-- name -->
<div class="form-row">
  <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
  <input type="text" id="node-input-name" placeholder="Name" />
</div>
</script>


<!-- help text -->
<script type="text/html" data-help-name="DummyNode">
  <p>
  </p>
</script>
```

The HTML structure is based on the Node-RED API. Ideally this would be generated from a type-safe representation, maybe a TS class or another well defined structural language.

The node files are in the "src/nodes" folder of this project.

The project itself is runnable in node-red and fully debuggable in vscode (launch config and all is included).

It looks like this:
![Debugging the dummy node in vscode.](https://github.com/mojo2012/node-red-ts/blob/main/public/debug.png?raw=true)

A quick-starter template can be found here: https://github.com/mojo2012/node-red-ts-template. Just check it out and run it.

## API

The `AbstractNode` has a bunch of methods that can be used or overriden in your node, for example:
* `onInput`
* `onClose`
* `setProperty`/`getProperty`
* `setStatus`
* `context`
* `flowContext`
* `globalContext`

The `onInput` method is triggered when a message arrives. It returns an array of messages (in the most cases just one). Each message in the array is passed to one output. The number of outputs has to be configured in the HTML file though.

## Usage
Create new nodes using this command `node node_modules/node-red-ts/tools/create-node.js`. This command will create a new node (html and ts file) in the `src/nodes` folder and also register the node in the `package.json`.

You can then build and launch node-red and start coding on your new node.

## Future plans
* Generate HTML based on a type-safe class
* Add more convenience functionality to the `AbstractNode`

