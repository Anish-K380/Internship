class Node {
    constructor(id, type, description, workflows, tools) {
	this.id = id;
	this.type = type;
	this.description = description;
	this.tools = tools;
	this.workflows = workflows;
    }
}

export class NodeManager {
    constructor() {
	this.nodes = {};
    }

    addNode(id, type, description = null, workflows = null, tools = null) {
	const node = new Node(id, type, description, workflows, tools);
	this.nodes[node.id] = node;
    }
}
