import { bfs } from './common.js';
import { layoutInfo } from './layout_config.js';

export function intersection(x1, y1, s1, x2, y2, s2) {
    if (s1 === Infinity || s2 === Infinity) {
        if (s1 === Infinity) [x1, y1, s1, x2, y2, s2] = [x2, y2, s2, x1, y1, s1];
        return [x2, (x2 - x1) * s1 + y1];
    }
    return [
        ((s1 * x1) + y2 - (s2 * x2) - y1) / (s1 - s2),
        ((s1 * s2 * x1) + (s1 * y2) - (s1 * s2 * x2) - (s2 * y1)) / (s1 - s2),
    ];
}

export function cubicBezier(sourceX, sourceY, targetX, targetY, groupEdge = false) {
    let cx1, cx2, cy1, cy2;
    if (groupEdge) {
        cx1 = sourceX;
        cx2 = targetX;
        cy1 = (sourceY + targetY) / 2;
        cy2 = cy1;
    } else {
        cx1 = (sourceX + targetX) / 2;
        cx2 = cx1;
        cy1 = sourceY;
        cy2 = targetY;
    }
    return [{ x: cx1, y: cy1 }, { x: cx2, y: cy2 }];
}

export function makeEdges(root, nodes, preEdges) {
    const edges = {};

    function nodeSource(node) {
        return [nodes[node].x, nodes[node].y + nodes[node].height / 2];
    }

    function nonGroupEdges(node) {
        const source = node;
        let [sx, sy] = nodeSource(source);
        sx += nodes[node].width;

        for (const target of preEdges[node]) {
            const edgeId = `ng-${source}->${target}`;
            const edge = { id: edgeId, source, target };
            const [tx, ty] = nodeSource(target);
            edge.startPoint = { x: sx, y: sy };
            edge.endPoint = { x: tx, y: ty };
            edge.controlPoints = cubicBezier(sx, sy, tx, ty);
	    edge.source = source;
	    edge.target = target;
            edges[edgeId] = edge;
        }
    }

    function groupParentRowStart(y, height) {
        const gap = layoutInfo.nodeEdgeSpace;
        if (layoutInfo.edgeArrival === 'top') return y - gap;
        if (layoutInfo.edgeArrival === 'bottom') return y + height + gap;
    }

    function groupRowStartRowEnd(x, width) {
        const change = layoutInfo.horizontalSpaceBetweenNodes / 2;
        if (layoutInfo.edgeAttachmentToNode === 'right') return x + change * 2 + width;
        return x - change;
    }

    function groupRowEndNode(x, width) {
        const displacement = layoutInfo.horizontalSpaceBetweenNodes / 2;
        if (layoutInfo.edgeAttachmentToNode === 'right') return x + width + displacement;
        return x - displacement;
    }

    function nodePort(x, y, height, width) {
        switch (layoutInfo.edgeAttachmentToNode) {
            case 'right': return [x + width, y + height / 2];
            case 'bottom': return [x + width / 2, y + height];
            case 'left': return [x, y + height / 2];
            case 'top': return [x + height / 2, y];
        }
    }

    function groupEdges(node) {
        const [sx, sy] = [
            nodes[node].x + nodes[node].width,
            nodes[node].y + nodes[node].height / 2,
        ];
        const rows = nodes[node].rows;
        let xLeft = Infinity;
        for (const row of rows) xLeft = Math.min(xLeft, nodes[row[0]].x);

        for (let i = 0; i < rows.length; i++) {
            const firstChild = rows[i][0];
            const tx = xLeft;
            const ty = groupParentRowStart(nodes[firstChild].y, nodes[firstChild].height);

            const preEdgeId = `g-pre-p-rs-${i}-${node}`;
            edges[preEdgeId] = {
                id: preEdgeId,
                startPoint: { x: sx, y: sy },
                endPoint: { x: tx, y: ty },
                controlPoints: cubicBezier(sx, sy, tx, ty),
		source: node
            };

            const lastChild = rows[i][rows[i].length - 1];
            const rx = groupRowEndNode(nodes[lastChild].x, nodes[lastChild].width);
            const rowEdgeId = `g-pre-rs-re-${i}-${node}`;
            edges[rowEdgeId] = {
                id: rowEdgeId,
                startPoint: { x: tx, y: ty },
                endPoint: { x: rx, y: ty },
                controlPoints: cubicBezier(tx, ty, rx, ty),
		source: node
            };

            for (const child of rows[i]) {
                const [nx, ny] = nodePort(nodes[child].x, nodes[child].y, nodes[child].height, nodes[child].width);
                const rnx = Math.max(groupRowEndNode(nodes[child].x, nodes[child].width), tx);
                const edgeId = `g-re-a-a-${i}-${child}`;
                edges[edgeId] = {
                    id: edgeId,
                    startPoint: { x: rnx, y: ty },
                    endPoint: { x: nx, y: ny },
                    controlPoints: cubicBezier(rnx, ty, nx, ny, true),
		    source: node,
		    target: child
                };
            }
        }
    }

    function giveFunction(node) {
        if (nodes[node].is_group_parent) groupEdges(node);
        else if (!nodes[node].is_leaf) nonGroupEdges(node);
    }

    bfs(root, preEdges, giveFunction);
    return edges;
}
