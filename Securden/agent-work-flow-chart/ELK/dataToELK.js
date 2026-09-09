import { nodeDimension } from '../nodeDimensions.js';

export function datatoELK(nodeMap, edgeSet) {
    const children = [];
    const edges = [];

    for (const [key, node] of nodeMap.entries()) {
	const dimension = nodeDimension[node.type] ?? nodeDimension.default;

	children.push({
	    id: key,
	    type: node.type,
	    label: node.label,
	    metadata: node.metadata,
	    width: (node.label.length < 27) ? dimension.width : (node.label.length * 10),
	    height: dimension.height,
	    shape: dimension.shape
	});

	for (const edge of edgeSet.get(key) ?? []) {
	    edges.push({
		id: edge.id ?? `${key}->${edge.target}`,
		sources: [key],
		targets: [edge.target]
	    });
	}
    }

    return { children, edges };
}
