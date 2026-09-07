import { NodeManager } from "./nodes.js";

export function makeNodes(data) {
    const nManager = new NodeManager();
    
    for (const key of Object.keys(data)) {
	const nodeData = data[key];
	nManager.addNode(nodeData.id, nodeData.type, nodeData.label, nodeData.metadata);
    }

    return nManager;
}
