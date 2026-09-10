class Node {
    constructor(id, type, label, metadata) {
	this.id = id;
	this.type = type;
	this.label = label;
	this.metadata = metadata;
    }
}

export class NodeManager {
    constructor() {
	this.nodes = new Map();
    }

    addNode(id, type, label, metadata) {
	const node = new Node(id, type, label, metadata);
	this.nodes.set(node.id, node);
    }
}
