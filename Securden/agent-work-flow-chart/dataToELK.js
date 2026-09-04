export function datatoELK(nodeSet, edgeSet) {
    const children = [];
    const edges = [];

    for (const node of nodeSet) {
	children.push({
	    id: node,
	    width: 30,
	    height: 30
	})
    }

    let number = 1;
    for (const source of Object.keys(edgeSet)) {
	for (const target of edgeSet[source]) {
	    edges.push({
		id: `e${number}`,
		sources: [source],
		targets: [target]
	    })
	    number++;
	}
    }

    return { children, edges };
}
