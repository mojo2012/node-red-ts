import { NodeDef } from "node-red"

export interface NodeDefinition extends NodeDef, Record<string, string> {

}
