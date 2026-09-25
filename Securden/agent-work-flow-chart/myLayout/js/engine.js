import { prepNodes, prepEdges } from './prep.js';

import { prepareNodes, getNodesHeight, getYPositions, getXPositions, transformNodes } from './node_placement_functions.js';

import { makeEdges } from './edge_placement.js';

import { setGraphDimensions } from './common.js';

export function createGraph(data, links, root) {
    prepNodes(data);

    const preppedEdges = prepEdges(links);

    prepareNodes(root, data, preppedEdges);
    getNodesHeight(root, data, preppedEdges);
    getYPositions(root, data, preppedEdges);
    getXPositions(root, data, preppedEdges);
    transformNodes(root, data, preppedEdges);

    const nodes = {};

    for (const id of Object.keys(data)) {
        nodes[id] = {
            id: data[id].id,
            label: data[id].label,
            type: data[id].type,
            metadata: data[id].metadata,
            height: data[id].height,
            width: data[id].width,
            y: data[id].y,
            x: data[id].x,
	    is_group_parent: data[id].is_group_parent
        };
    }

    const edges = makeEdges(
        root,
        data,
        preppedEdges
    );

    setGraphDimensions(root, data);

    return {
        root: root,
        height: data[root]['graph-height'],
        width: data[root]['graph-width'],
        nodes,
        edges
    };
}
