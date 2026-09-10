export function graphObject(objectID, nodeManager, edgeSet) {
    function getNodes(nodeID) {
	if (nodes.has(nodeID)) {
	    return;
	}
	const node = nodeManager.nodes.get(nodeID);
	nodes.set(nodeID, node)
	if (node.type === 'agent') {
	    if (primaryAgent) {
		primaryAgent = false;
	    } else {
		return;
	    }
	}
	for (const edge of edgeSet.get(nodeID) ?? []) {
	    getNodes(edge.target);
	}
    }
    let primaryAgent = true;
    const nodes = new Map();
    getNodes(objectID);
    return nodes;
}
