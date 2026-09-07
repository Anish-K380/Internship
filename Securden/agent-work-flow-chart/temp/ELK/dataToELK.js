import { nodeDimension } from '../nodeDimensions.js';

export function datatoELK(nodeMap, edgeSet) {
    console.log("nodeMap is a Map:", nodeMap instanceof Map);
    console.log("nodeMap type:", nodeMap.constructor.name);
    const children = [];
    const edges = [];

    for (const [key, node] of nodeMap) {
	children.push({
	    id: key,
	    type: node.type,
	    label: node.label,
	    metadata: node.metadata,
	    width: nodeDimension[node.type].width,
	    height: nodeDimension[node.type].height,
	    shape: nodeDimension[node.type].shape
	})

	for (const edge of edgeSet.get(key) ?? []) {
	    edges.push({
		id: edge.id,
		sources: [key],
		targets: [edge.target]
	    })
	}
    }
    return { children, edges };
}
