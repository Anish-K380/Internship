class Node {
    constructor(id, type, description, tools, workflows) {
	this.id = id;
	this.type = type;
	this.description = description;
	this.tools = tools;
	this.workflows = workflows;
    }
}

class Edge {
    constructor(id, source, target, description) {
	this.id = id;
	this.source = source;
	this.target = target;
	this.description = description;
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

export class EdgeManager {
    constructor () {
	this.edges = {};
    }

    addEdge (id, source, target, description = null) {
	const edge = new Edge(id, source, target, description);
	this.edges[edge.id] = edge;
    }
}
