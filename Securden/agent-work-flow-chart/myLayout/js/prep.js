import { nodeType } from './node_config.js';

export function prepNodes(nodes) {
    for (const id of Object.keys(nodes)) {
        const node = nodes[id];
        const dimensions = nodeType[node.type] ?? nodeType.default;

        node.height = dimensions.height;
        node.width = dimensions.width;

        const accWidth = Math.max(node.label.length, node.id.length);
        if (accWidth > 27) node.width = accWidth * 10;
    }
}

export function prepEdges(edgeObj) {
    const edges = {};

    for (const edge of edgeObj.links) {
        const source = edge.source;
        if (!edges[source]) edges[source] = new Set();
        edges[source].add(edge.target);
    }

    return edges;
}
