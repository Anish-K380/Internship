export function graphData(layout) {
    const children = [];
    const edges = [];
    for (const child of layout.children) {
	children.push({
	    id: child.id,
	    height: child.height,
	    width: child.width,
	    shape: child.shape,
	    x: child.x,
	    y: child.y
	});
    }

    for (const edge of layout.edges) {
	edges.push({
	    id: edge.id,
	    source: edge.sources[0],
	    target: edge.targets[0],
	    sections: edge.sections
	});
    }

    return { children, edges };
}
