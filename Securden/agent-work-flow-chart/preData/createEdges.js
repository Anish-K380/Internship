export function makeEdges(data) {
    const edges = new Map();

    for (const link of data.links) {
	if (!edges.has(link.source)) {
	    edges.set(link.source, []);
	}

	edges.get(link.source).push({id: link.id, target: link.target});
    }
    return edges;
}
