export function makeEdges(data) {
    const edges = new Map();

    let number = 0;
    for (const link of data.links) {
	if (!edges.has(link.source)) {
	    edges.set(link.source, []);
	}

	number++;
	edges.get(link.source).push({id: `e${number}`, target: link.target});
    }
    return edges;
}
