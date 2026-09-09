import { makeNodes } from './createNodes.js';
import { makeEdges } from './createEdges.js';
import { graphObject } from './findNodes.js';

export function prepData(objectID, nodeJSON, linkJSON) {

    const allNodes = makeNodes(nodeJSON);
    const prepEdges = makeEdges(linkJSON);
    const prepNodes = graphObject(objectID, allNodes, prepEdges);

    return [prepNodes, prepEdges];
}
