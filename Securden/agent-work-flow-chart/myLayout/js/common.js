import { layoutInfo } from './layout_config.js';

export function bfs(root, edges, fn, optional = null) {
    const queue = [root];
    let currentIndex = 0;
    const doneNodes = new Set();

    while (currentIndex !== queue.length) {
        const node = queue[currentIndex++];

        if (doneNodes.has(node)) continue;
        doneNodes.add(node);

        if (edges[node]) {
            for (const child of edges[node]) queue.push(child);
        }

        if (optional !== null) fn(node, optional);
        else fn(node);
    }
}

export function setGraphDimensions(root, nodes) {
    nodes[root]['graph-width'] += layoutInfo.spaceBetweenLevels * 2;
    nodes[root]['graph-height'] =
        nodes[root].tree_height +
        layoutInfo.minimumVerticalSpaceNonGroupedNodes * 50;
}
