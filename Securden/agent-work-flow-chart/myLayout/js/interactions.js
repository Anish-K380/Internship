import { cubicBezier } from './edge_placement.js';

import { layoutInfo } from './layout_config.js';

export class AlterState {

    constructor(root, nodes, edges) {

        this.root = root;
        this.nodes = nodes;
        this.edges = edges;

        this.setRows = {};

	this.dummy = {is_group_parent: false, existent: false}
	this.nodes[root].parent = this.dummy;

        // ==================================================
        // History
        // ==================================================

        this.history = [];
        this.historyIndex = -1;

        // ==================================================
        // Node state
        // ==================================================

	const groupParents = new Array();

        for (const node of Object.keys(this.nodes)) {

            this.nodes[node].edge_attachment = layoutInfo.edgeAttachmentToNode;

            this.nodes[node].outgoing = new Set();

            this.nodes[node].incoming = null;

	    if (this.nodes[node].is_group_parent) {
		groupParents.push(node);
		this.nodes[node].rows = new Set();
		this.nodes[node].children = new Array();
	    }
        }

        // ==================================================
        // Build row information from existing edges
        // ==================================================

        for (const edgeId of Object.keys(this.edges)) {

            const edge = this.edges[edgeId];

            const source = edge.source;

            // ==================================================
            // Group edges
            // ==================================================

            if (edgeId.startsWith('g-')) {

                const parts = edgeId.split('-');

                // --------------------------------------------------
                // g-pre-p-row-parent
                // --------------------------------------------------

                if (parts.length >= 5 && parts[1] === 'pre' && parts[2] === 'p') {

                    const rowIndex = parts[4];
                    const rowId =`g-pre-rs-re-${rowIndex}-${source}`;

                    const row = this.getOrCreateRow(source, rowIndex);

                    row.start =edgeId;

                    this.nodes[source].outgoing.add(edgeId);

                    edge.node_attachment ='right';
                }

                // --------------------------------------------------
                // g-pre-rs-re-row-parent
                // --------------------------------------------------

                else if (parts.length >= 5 && parts[1] === 'pre' && parts[2] === 'rs') {

                    const rowIndex = parts[4];
		    this.nodes[source].rows.add(rowIndex);

                    const rowId = `g-pre-rs-re-${rowIndex}-${source}`;

                    const row = this.getOrCreateRow(source, rowIndex);

                    row.mid = edgeId;

                    row.startX = edge.startPoint.x;

                    row.endX = edge.endPoint.x;

                    row.y = edge.endPoint.y;

                    row.id = rowIndex;

		    row.endNodes = new Set();
                }

                // --------------------------------------------------
                // g-re-row-target
                // --------------------------------------------------

                else if (parts.length >= 3 && parts[1] === 're') {

                    const rowIndex = parts[4];

                    const target = edge.target;

		    this.nodes[target].rowIndex = rowIndex;
		    this.nodes[target].parent = source;

		    this.nodes[source].children.push(target);

                    const rowId = `g-pre-rs-re-${rowIndex}-${source}`;

                    const row = this.getOrCreateRow(source, rowIndex);

                    row.nodes.add(target);

                    this.nodes[target].incoming = edgeId;

                    this.nodes[target].rowIndex =rowIndex;

		    const edgeX = this.edges[edgeId].startPoint.x;
		    if (edgeX == row.endX) {
			row.endNodes.add(target);
		    }
                }

                continue;
            }

            // ==================================================
            // Normal edges
            // ==================================================

            if (edgeId.startsWith('ng-')) {

                const target = edge.target;

		this.nodes[target].parent = source;

                this.nodes[source].outgoing.add(edgeId);

                this.nodes[target].incoming = edgeId;

                edge.node_attachment = 'right';
            }
        }

	for (const node of groupParents) {
	    const nodeObj = this.nodes[node];
	    const rowIndex = nodeObj.rows.values().next().value;
	    const rowId = `g-pre-rs-re-${rowIndex}-${node}`;
	    const row = this.setRows[node][rowId];
	    nodeObj.rowStartDiff = (row.startX - nodeObj.x);
	}

        // ==================================================
        // Original state
        // ==================================================

        this.originalNodes = this.deepCopy(this.nodes);

        this.originalEdges = this.deepCopy(this.edges);

        this.originalSetRows = this.cloneRows(this.setRows);
    }

    // ======================================================
    // Deep copy
    // ======================================================

    deepCopy(value) {

        if (value === undefined) {
            return undefined;
        }

        return structuredClone(value);
    }

    // ======================================================
    // Deep equality
    // ======================================================

    statesEqual(a, b) {

        if (a === b) {
            return true;
        }

        if (a === null || b === null) {
            return false;
        }


        if (a === undefined || b === undefined) {
            return false;
        }

        if (typeof a !== 'object' || typeof b !== 'object') {
            return a === b;
        }

        // --------------------------------------------------
        // Set
        // --------------------------------------------------

        if (a instanceof Set || b instanceof Set) {

            if (!(a instanceof Set) || !(b instanceof Set)) {
                return false;
            }

            if (a.size !== b.size) {
                return false;
            }

            for (const value of a) {
                if (!b.has(value)) {
                    return false;
                }
            }
            return true;
        }

        // --------------------------------------------------
        // Array
        // --------------------------------------------------

        if (Array.isArray(a) || Array.isArray(b)) {
            if (!Array.isArray(a) || !Array.isArray(b)) {
                return false;
            }

            if (a.length !== b.length) {
                return false;
            }

            for (let i = 0; i < a.length; i++) {
                if (!this.statesEqual(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        }

        // --------------------------------------------------
        // Object
        // --------------------------------------------------

        const aKeys = Object.keys(a).sort();

        const bKeys = Object.keys(b).sort();

        if (aKeys.length !== bKeys.length) {
            return false;
        }

        for (let i = 0; i < aKeys.length; i++) {

            if (aKeys[i] !== bKeys[i]) {
                return false;
            }

            if (!this.statesEqual(a[aKeys[i]], b[bKeys[i]])) {
                return false;
            }
        }

        return true;
    }

    // ======================================================
    // Clone rows
    // ======================================================

    cloneRows(rows) {

        const copy = {};

        for (const parent of Object.keys(rows)) {

            copy[parent] = {};

            for (const rowId of Object.keys(rows[parent])) {

                const row = rows[parent][rowId];

                copy[parent][rowId] = {...row, nodes: new Set(row.nodes)};
            }
        }

        return copy;
    }

    // ======================================================
    // Snapshot current engine state
    // ======================================================

    snapshotState() {

        return {nodes:this.deepCopy(this.nodes),
		edges: this.deepCopy(this.edges),
		setRows: this.cloneRows(this.setRows)
        };
    }

    // ======================================================
    // Get or create row
    // ======================================================

    getOrCreateRow(parent, rowIndex) {

	const rowId = `g-pre-rs-re-${rowIndex}-${parent}`;

        if (!this.setRows[parent]) {
            this.setRows[parent] = {};
        }

        if (!this.setRows[parent][rowId]) {

            this.setRows[parent][rowId] = {
                id: rowId,
                nodes: new Set()
            };
        }

        return this.setRows[parent][rowId];
    }

    // ======================================================
    // Get current rows ordered by Y
    // ======================================================

    getRowsY(parent) {

        const rowsY = [[-Infinity, '']];

        const rows = this.setRows[parent] || {};

        for (const rowId of Object.keys(rows)) {

            const row = rows[rowId];

            rowsY.push([row.y, rowId]);
        }

        rowsY.sort((a, b) => a[0] - b[0]);

	rowsY.push([Infinity, '']);

        return rowsY;
    }

    // ======================================================
    // Move existing edge
    // ======================================================

    moveEdge(edgeId, x1, y1, x2, y2) {

        const edge = this.edges[edgeId];

        if (!edge) {
            return;
        }

        edge.startPoint = {x: x1, y: y1};

        edge.endPoint = {x: x2, y: y2};

	const parts = edgeId.split('-');
	if (parts[0] === 'ng') {
            edge.controlPoints = cubicBezier(x1, y1, x2, y2);
	} else if (parts[1] === 'pre') {
	    edge.controlPoints = cubicBezier(x1, y1, x2, y2);
	} else {
	    edge.controlPoints = cubicBezier(x1, y1, x2, y2, true);
	}
    }

    // ======================================================
    // Node port
    // ======================================================

    portPosition(node, nodeFacing = null) {

        if (nodeFacing === null) {
            nodeFacing = this.nodes[node].edge_attachment;
        }

        const x = this.nodes[node].x;
        const y = this.nodes[node].y;
        const width = this.nodes[node].width;
        const height = this.nodes[node].height;

        if (nodeFacing === 'left') {
            return {'x': x, 'y': y + height / 2};
        }

        if (nodeFacing === 'right') {
            return {'x': x + width, 'y': y + height / 2};
        }

        if (nodeFacing === 'top') {
            return {'x': x + width / 2, 'y': y};
        }

        if (nodeFacing === 'bottom') {
            return {'x': x + width / 2, 'y': y + height};
        }

        throw new Error(`Unknown node attachment: ${nodeFacing}`);
    }

    // ======================================================
    // Normal edge
    // ======================================================

    makeNonGroupEdge(source, target) {

        const start = this.portPosition(source, 'right');

        const end = this.portPosition(target);

        const edgeId =`ng-${source}->${target}`;

        this.edges[edgeId] = {id: edgeId,
			      source,
			      target,
			      startPoint: {x: start.x, y: start.y},
			      endPoint: {x: end.x, y: end.y},
			      controlPoints: cubicBezier(start.x, start.y, end.x, end.y),
			      node_attachment: 'right'
			     };

        this.nodes[source].outgoing.add(edgeId);

        this.nodes[target].incoming = edgeId;

        return edgeId;
    }

    // ======================================================
    // Delete edge
    // ======================================================

    deleteEdge(edgeId) {
        if (!this.edges[edgeId]) {
            return;
        }

        const edge = this.edges[edgeId];

        const source = edge.source;

        const target = edge.target;

        delete this.edges[edgeId];
    }

    // ======================================================
    // Remove node from row
    // ======================================================

    rowRemoveNode(node, rowIndex) {
	if (rowIndex === null) {
	    return;
	}

	const currentNode = this.nodes[node];

	const parent = currentNode.parent;
	const parentObj = this.nodes[parent];

	const rowId = `g-pre-rs-re-${rowIndex}-${parent}`;

	const edgeId = `g-re-a-a-${rowIndex}-${node}`;

	// Remove the node's row edge
	this.deleteEdge(edgeId);

	// Remove node from the row
	const row = this.setRows[parent][rowId].nodes;

	row.delete(node);

	this.updateRowEnd(node, parent, rowId);

	// One node remains
	if (row.size === 1) {

            const sibling = row.values().next().value;

            this.rowRemoveNode(sibling, rowIndex);

	    this.nodes[sibling].rowIndex = null;

            this.updateGroupChild(sibling);

            return;
	}

	// Row is now empty
	if (row.size === 0) {

            delete this.setRows[parent][rowId];

            const rowEdge = `g-pre-rs-re-${rowIndex}-${parent}`;
	    const rowConnector = `g-pre-p-rs-${rowIndex}-${parent}`;

	    this.deleteEdge(rowEdge);
	    this.deleteEdge(rowConnector);

	    parentObj.rows.delete(rowIndex);
	}
    }

    // ======================================================
    // Closest row
    // ======================================================

    closestRow(node) {

	const nodeObj = this.nodes[node];

	const parent = nodeObj.parent;

	const currY = nodeObj.y;

	const rowsArr = this.getRowsY(parent);

	if (rowsArr.length === 2) {
            return null;
	}

	let low = 1;
	let high = rowsArr.length - 1;
	let mid;

	while (low <= high) {

            mid = (low + high) >> 1;

            if (rowsArr[mid - 1][0] <= currY && currY <= rowsArr[mid][0]) {
		break;
            } else if (rowsArr[mid][0] < currY) {
		low = mid + 1;
            } else {
		high = mid - 1;
            }
	}

	if (rowsArr[mid][0] === Infinity) {
            return rowsArr[mid - 1][1];
	}

	if (rowsArr[mid - 1][0] === -Infinity) {
            return rowsArr[mid][1];
	}

	const upDiff = currY - rowsArr[mid - 1][0];

	const lowDiff = rowsArr[mid][0] - currY;

	if (upDiff < lowDiff) {
            return rowsArr[mid - 1][1];
	}

	return rowsArr[mid][1];
    }

    // ======================================================
    // Row X
    // ======================================================

    rowX(node) {

        const displacement = layoutInfo.horizontalSpaceBetweenNodes / 2;

        const placement = this.nodes[node].edge_attachment;

        if (placement === 'right') {
            return (this.nodes[node].x + this.nodes[node].width + displacement);
        }

        return (this.nodes[node].x - displacement);
    }

    // ======================================================
    // Attach node to row
    // ======================================================

    attachToRow(node, rowId) {
	const nodeObj = this.nodes[node];
	const parent = nodeObj.parent;

	if (rowId === null) {
	    this.rowRemoveNode(node, nodeObj.rowIndex);

	    nodeObj.rowIndex = null;

            this.makeNonGroupEdge(parent, node);

	    return;
	}

	const row = this.setRows[parent][rowId];

	const rowX = this.rowX(node);

	// --------------------------------------------------
	// Node is before the row
	// --------------------------------------------------

	if (rowX < row.startX) {
	    this.rowRemoveNode(node, nodeObj.rowIndex);

	    nodeObj.rowIndex = null;

            this.makeNonGroupEdge(parent, node);

	    return;
	}

	this.updateRowEnd(node, parent, rowId, rowX);

	// --------------------------------------------------
	// Row position
	// --------------------------------------------------

	const rowY = row.y;

	// --------------------------------------------------
	// Node attachment point
	// --------------------------------------------------

	const end = this.portPosition(node, nodeObj.edge_attachment);

	// --------------------------------------------------
	// Row index
	// --------------------------------------------------

	const rowIndex = rowId.split('-')[4];

	// --------------------------------------------------
	// Edge
	// --------------------------------------------------

	const edgeId = `g-re-a-a-${rowIndex}-${node}`;

	this.edges[edgeId] = {
	    id: edgeId,
	    source: parent,
	    target: node,
	    node_attachment: nodeObj.edge_attachment,
            startPoint: {x: rowX, y: rowY},
            endPoint: {x: end.x, y: end.y},
            controlPoints: cubicBezier(rowX, rowY, end.x, end.y, true)
	};

	// --------------------------------------------------
	// Row membership
	// --------------------------------------------------

	row.nodes.add(node);

	// --------------------------------------------------
	// Node state
	// --------------------------------------------------

	nodeObj.incoming = edgeId;

	nodeObj.rowIndex = rowIndex;

	return edgeId;
    }

    updateRowEnd(node, source, rowId, rowX = -Infinity) {
	const row = this.setRows[source][rowId];

	if (rowX > row.endX) {
	    row.endX = rowX;
	    const edgeId = row.mid;
	    const edgeObj = this.edges[edgeId];
	    const edgeStart = edgeObj.startPoint;
	    const edgeEnd = edgeObj.endPoint;
	    this.moveEdge(edgeId, edgeStart.x, edgeStart.y, Math.max(rowX, edgeStart.x), edgeEnd.y);
	    row.endNodes.clear();
	    row.endNodes.add(node);
	} else if (row.endNodes.has(node) && rowX < row.endX) {
	    row.endNodes.delete(node);
	    if (row.endNodes.size === 0) {
		let maxX = -Infinity;

		for (const rowNode of row.nodes) {
		    const incoming = this.nodes[rowNode].incoming;
		    const nodeRowX = this.edges[this.nodes[rowNode].incoming].startPoint.x;
		    if (nodeRowX > maxX) {
			maxX = nodeRowX;
			row.endNodes.clear();
			row.endNodes.add(rowNode);
		    } else if (nodeRowX === maxX) {
			row.endNodes.add(rowNode);
		    }
		}
		const edgeId = row.mid;
		const edgeObj = this.edges[edgeId];
		const edgeStart = edgeObj.startPoint;
		const edgeEnd = edgeObj.endPoint;
		this.moveEdge(edgeId, edgeStart.x, edgeStart.y, Math.max(maxX, edgeStart.x), edgeEnd.y);
		row.endX = maxX;
	    }
	}
    }

    // ======================================================
    // Update group child
    // ======================================================

    updateGroupChild(node) {

	const nodeObj = this.nodes[node];

	const parent = nodeObj.parent;

	const oldIndex = nodeObj.rowIndex;
	const oldRowEdgeId = `g-pre-rs-re-${oldIndex}-${parent}`
	const oldIncoming = nodeObj.incoming;

	const rowEdgeId = this.closestRow(node);

	this.attachToRow(node, rowEdgeId);

	if (oldIndex === null && oldIncoming !== nodeObj.incoming) {
	    this.deleteEdge(oldIncoming);
	}

	if (oldIndex !== null && nodeObj.rowIndex !== null && oldRowEdgeId !== rowEdgeId) {
            this.rowRemoveNode(node, oldIndex);
	}

    }

    updateNonGroupChild(node) {

	const currentNode = this.nodes[node];

	const parent = currentNode.parent;

	if (parent !== this.dummy) {

            const incomingEdge = currentNode.incoming;

            if (incomingEdge) {

		const edge = this.edges[incomingEdge];

		if (edge) {
                    const start = this.portPosition(parent, edge.node_attachment);

                    const end = this.portPosition(node, currentNode.edge_attachment);

                    this.moveEdge(incomingEdge, start.x, start.y, end.x, end.y);
		}
            }
	}
    }

    // --------------------------------------------------
    // Outgoing edges
    // --------------------------------------------------

    updateNonGroupParent(node) {

	const currentNode = this.nodes[node];

	for (const outgoingEdge of currentNode.outgoing) {

	    const child = this.edges[outgoingEdge].target;
            const childNode = this.nodes[child];

            if (!childNode) {
		continue;
            }

            if (!outgoingEdge) {
		continue;
            }

            const edge = this.edges[outgoingEdge];

            if (!edge) {
		continue;
            }

            const start = this.portPosition(node, edge.node_attachment);

            const end = this.portPosition(child, node.edge_attachment);

            this.moveEdge(outgoingEdge, start.x, start.y, end.x, end.y);
	}
    }

    // ======================================================
    // Update group parent
    // ======================================================

    updateGroupParent(node) {
	const nodeObj = this.nodes[node];
	const difference = nodeObj.rowStartDiff;
	const rowStart = nodeObj.x + difference;
	for (const rowIndex of nodeObj.rows) {
	    const rowId = `g-pre-rs-re-${rowIndex}-${node}`;
	    const row = this.setRows[node][rowId];
	    row.startX = rowStart;
	    const parentToRowEdgeId = `g-pre-p-rs-${rowIndex}-${node}`;
	    const pStart = this.portPosition(node, 'right');
	    const rStart = this.edges[rowId].startPoint;
	    const rEnd = this.edges[rowId].endPoint;
	    const rowEnd = Math.max(rEnd.x, rowStart);
	    this.moveEdge(parentToRowEdgeId, pStart.x, pStart.y, rowStart, rStart.y);
	    this.moveEdge(rowId, rowStart, rStart.y, rowEnd, rEnd.y);
	}
	for (const child of nodeObj.children) {
	    this.updateGroupChild(child);
	}
    }

    reset() {

	// Clear current nodes
	for (const key of Object.keys(this.nodes)) {
            delete this.nodes[key];
	}

	// Restore original nodes
	Object.assign(
            this.nodes,
            this.deepCopy(this.originalNodes)
	);
	this.dummy = {is_group_parent: false, existent: false}
	this.nodes[this.root].parent = this.dummy;

	// Clear current edges
	for (const key of Object.keys(this.edges)) {
            delete this.edges[key];
	}

	// Restore original edges
	Object.assign(this.edges, this.deepCopy(this.originalEdges));

	// Restore internal engine state
	this.setRows = this.cloneRows(this.originalSetRows);

	// Reset history
	this.history = [];
	this.historyIndex = -1;

	return {
            type: 'reset',
            nodes: this.deepCopy(this.nodes),
            edges:this.deepCopy(this.edges)
	};
    }

    // ======================================================
    // INTERNAL node movement
    //
    // No history here.
    // ======================================================

    _moveNode(node, x, y) {

	const currentNode = this.nodes[node];
	
	currentNode.x = x;
	currentNode.y = y;

	parent = currentNode.parent;

	// parent
	if (currentNode.is_group_parent) {
            this.updateGroupParent(node);
	} else {
	    this.updateNonGroupParent(node);
	}

	// child
	if ((parent !== this.dummy) && this.nodes[parent].is_group_parent) {
            this.updateGroupChild(node);
	} else {
	    this.updateNonGroupChild(node);
	}
    }

    // ======================================================
    // PUBLIC node movement
    //
    // One user drag = one history entry.
    // ======================================================

    moveNode(node, x, y) {

        const before = this.snapshotState();

        this._moveNode(node, x, y);

        return this.recordOperation(before);
    }

    // ======================================================
    // INTERNAL edge attachment
    //
    // No history here.
    // ======================================================

    _setEdgeAttachment(edgeId, nodeId, attachment) {

        const edge = this.edges[edgeId];

        if (!edge) {
            return;
        }

        const [x, y] = this.portPosition(nodeId, attachment);

        // --------------------------------------------------
        // Source
        // --------------------------------------------------

        if (edge.source === nodeId) {

            edge.source_attachment = attachment;

            edge.startPoint = {x, y};
        } else if (edge.target === nodeId) {

            edge.target_attachment = attachment;

            edge.endPoint = {x, y};
        } else {
            return;
        }

        edge.controlPoints = this.callBezier(
	    edge.startPoint.x,
	    edge.startPoint.y,
	    edge.endPoint.x,
	    edge.endPoint.y
            );

        // --------------------------------------------------
        // pre-p-rs controls row start_x
        // --------------------------------------------------

        if (edgeId.startsWith('g-pre-p-rs-')) {

            const parts = edgeId.split('-');

            const rowIndex = parts[3];

            const parent = edge.source;

            const rowId = `g-pre-rs-re-${rowIndex}-${parent}`;

            const row = this.setRows[parent]?.[rowId];

            if (row) {
                row.start_x = edge.endPoint.x;
            }
        }
    }

    // ======================================================
    // PUBLIC edge attachment
    //
    // One user attachment change = one history entry.
    // ======================================================

    setEdgeAttachment(edgeId, nodeId, attachment) {

        const before = this.snapshotState();

        this._setEdgeAttachment(edgeId, nodeId, attachment);

        return this.recordOperation(before);
    }

    // ======================================================
    // Make history entry
    //
    // [0] = original states
    // [1] = altered states
    // ======================================================

    makeHistoryEntry(before, after) {

        const beforeChanged = [];
        const afterChanged = [];

        // ==================================================
        // Nodes
        // ==================================================

        const nodeIds = new Set([...Object.keys(before.nodes),
				 ...Object.keys(after.nodes)
              ]);

        for (const id of nodeIds) {

            const oldState = before.nodes[id];

            const newState = after.nodes[id];

            if (this.statesEqual(oldState, newState)) {
                continue;
            }

            beforeChanged.push({
		type: 'node',
                id,
                state: this.deepCopy(oldState ?? null)
            });

            afterChanged.push({
		type: 'node',
                id,
                state: this.deepCopy(newState ?? null)
            });
        }

        // ==================================================
        // Edges
        // ==================================================

        const edgeIds = new Set([
	    ...Object.keys(before.edges),
	    ...Object.keys(after.edges)
              ]);

        for (const id of edgeIds) {

            const oldState = before.edges[id];
            const newState = after.edges[id];

            if (this.statesEqual(oldState, newState)) {
                continue;
            }

            beforeChanged.push({
                type: 'edge',
		id,
                state: this.deepCopy(oldState ?? null)
            });

            afterChanged.push({
		type: 'edge',
                id,
                state: this.deepCopy(newState ?? null)
            });
        }

        const entry = [beforeChanged, afterChanged];

        // --------------------------------------------------
        // setRows is internal engine state.
        //
        // It isn't sent to the renderer, but it MUST be
        // restored when undo/redo happens.
        // --------------------------------------------------

        entry.beforeRows = this.cloneRows(before.setRows);

        entry.afterRows = this.cloneRows(after.setRows);

        return entry;
    }

    // ======================================================
    // Record operation
    // ======================================================

    recordOperation(before) {

        const after = this.snapshotState();

        const entry = this.makeHistoryEntry(before, after);

        // --------------------------------------------------
        // Nothing changed.
        // --------------------------------------------------

        if (entry[0].length === 0 && entry[1].length === 0) {
            return [];
        }

        // --------------------------------------------------
        // New operation after undo:
        // discard redo branch.
        // --------------------------------------------------

        this.history.splice(this.historyIndex + 1);

        this.history.push(entry);

        this.historyIndex++;

        // Renderer only needs the altered objects.
        return entry[1];
    }

    // ======================================================
    // Apply history state
    // ======================================================

    applyHistoryState(changes,rows) {

        // --------------------------------------------------
        // Restore nodes / edges
        // --------------------------------------------------

        for (const change of changes) {

            const collection = change.type === 'node' ? this.nodes : this.edges;

            if (change.state === null) {
                delete collection[change.id];
            } else {
                collection[change.id] = this.deepCopy(change.state);
            }
        }

        // --------------------------------------------------
        // Restore internal row structure
        // --------------------------------------------------

        this.setRows = this.cloneRows(rows);
    }

    // ======================================================
    // Undo
    //
    // Returns only objects that renderer needs to update.
    // ======================================================

    undo() {

        if (this.historyIndex < 0) {
            return [];
        }

        const entry = this.history[this.historyIndex];

        this.applyHistoryState(entry[0], entry.beforeRows);

        this.historyIndex--;

        return entry[0];
    }

    // ======================================================
    // Redo
    //
    // Returns only objects that renderer needs to update.
    // ======================================================

    redo() {

        if (this.historyIndex + 1 >= this.history.length) {
            return [];
        }

        this.historyIndex++;

        const entry = this.history[this.historyIndex];

        this.applyHistoryState(entry[1], entry.afterRows);

        return entry[1];
    }
}
