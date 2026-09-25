import { bfs } from './common.js';
import { layoutInfo } from './layout_config.js';

export function prepareNodes(root, nodes, edges) {
    function preppy(node) {
        if (edges[node]) {
            nodes[node].is_leaf = false;

            const minGroupNodes = layoutInfo.minimumNodesForGroup;
            if (edges[node].size >= minGroupNodes) {
                nodes[node].is_group_parent = true;
            } else {
                nodes[node].is_group_parent = false;
                nodes[node].row_ends = 0;
                nodes[node].dimensions = [0, 0];
            }

            let grandchildParents = 0;
            for (const child of edges[node]) {
                grandchildParents += edges[child] ? 1 : 0;
                nodes[child].parent = node;
                nodes[child].level = nodes[node].level + 1;
            }
            nodes[node].grandchild_parents = grandchildParents;

            if (nodes[node].is_group_parent) {
                nodes[node].dimensions = groupFindRowsCols(
                    edges[node].size,
                    grandchildParents
                );
                nodes[node].rows = groupGetRowsCols(
                    node,
                    nodes[node].dimensions,
                    edges,
                    grandchildParents
                );
            }
        } else {
            nodes[node].is_leaf = true;
            nodes[node].is_group_parent = false;
            nodes[node].row_ends = [];
            nodes[node].dimensions = [0, 0];
            nodes[node].grandchild_parents = 0;
        }
    }

    nodes[root].level = 0;
    nodes[root].parent = root;
    bfs(root, edges, preppy);
}

export function groupFindRowsCols(noOfChildren, minRows = 0) {
    let rowCount;
    let colCount;
    const choice = layoutInfo.rowsColumnsPerGroupMethod;

    if (choice === 'fixed') {
        const fixed = layoutInfo.fixRowsColumnsNumber;
        const calculated = Math.ceil(noOfChildren / fixed);

        if (layoutInfo.fixRowsColumns === 'columns') {
            rowCount = calculated;
            colCount = fixed;
        } else if (layoutInfo.fixRowsColumns === 'rows') {
            rowCount = fixed;
            colCount = calculated;
        }
    } else if (choice === 'ratio') {
        const rowRatio = layoutInfo.rowRatioNumber;
        const colRatio = layoutInfo.columnRatioNumber;
        const approxRows = Math.floor(
            Math.sqrt((rowRatio * noOfChildren) / colRatio)
        );

        let diff = Infinity;
        const accRatio = rowRatio / colRatio;

        for (let i = 0; i < 3; i++) {
            const tempRows = approxRows + i - 1;
            const tempCols = Math.ceil(noOfChildren / tempRows);
            const tempRatio = tempRows / tempCols;
            const tempDiff = Math.abs(accRatio - tempRatio);

            if (tempDiff < diff) {
                diff = tempDiff;
                rowCount = tempRows;
                colCount = tempCols;
            }
        }
    }

    if (minRows > rowCount) {
        rowCount = minRows;
        colCount = Math.ceil(noOfChildren / rowCount);
    }

    return [rowCount, colCount];
}

export function rowEndsAssignment(minRows, rows) {
    function markMids(noOfMids, together, extend = 0) {
        const minClump = Math.floor(together / (noOfMids + 1));
        const maxClump = minClump + 1;
        const bigClumps = together - minClump * (noOfMids + 1);
        const smallClumps = noOfMids + 1 - bigClumps;

        let index = 0;
        for (let i = 0; i < smallClumps; i++) {
            index += minClump;
            positions[index + extend] = !positions[index + extend];
        }
        for (let i = 0; i < bigClumps; i++) {
            index += maxClump;
            positions[index + extend] = !positions[index + extend];
        }
    }

    if (minRows === rows) return Array(rows).fill(true);

    const positions = Array(rows).fill(false);
    if (minRows === 0) return positions;
    if (minRows === 1) {
        positions[rows >> 1] = !positions[rows >> 1];
        return positions;
    }

    const nonExtendingRows = rows - minRows;
    if (minRows > nonExtendingRows + 1) {
        positions.fill(true);
        markMids(nonExtendingRows, minRows);
    } else {
        positions[0] = true;
        positions[positions.length - 1] = true;
        markMids(minRows - 2, nonExtendingRows, 1);
    }
    return positions;
}

export function groupGetRowsCols(node, dimension, edges, rowEnds) {
    function shiftMarkedIndex(current) {
        current += 1;
        while (current !== marked.length && !marked[current]) current += 1;
        return current;
    }

    function incrementIndex(row, col) {
        if (col === lastColumn) {
            rows.push(Array(lastColumn + 1).fill(null));
            return [row + 1, 0];
        }
        if (col === lastColumn - 1) {
            if (marked[row]) {
                rows.push([]);
                return [row + 1, 0];
            }
            return [row, col + 1];
        }
        return [row, col + 1];
    }

    const children = edges[node];
    const marked = rowEndsAssignment(rowEnds, dimension[0]);
    let markedRow = shiftMarkedIndex(-1);

    const rows = [];
    let row = -1;
    let col = dimension[1] - 1;
    const lastColumn = col;

    for (const child of children) {
        if (!edges[child]) {
            [row, col] = incrementIndex(row, col);
            rows[row][col] = child;
        } else {
            rows[markedRow][lastColumn] = child;
            markedRow = shiftMarkedIndex(markedRow);
        }
    }

    for (const currentRow of rows) {
        let last = currentRow.length - 1;
        while (currentRow[last] === null) {
            currentRow.pop();
            last -= 1;
        }
    }

    return rows;
}

export function getNodesHeight(root, nodes, edges) {
    function getPosition(node) {
        return nodes[node].is_group_parent
            ? groupRecursion(node)
            : nonGroupRecursion(node);
    }

    function nonGroupRecursion(node) {
        if (nodes[node].is_leaf) {
            nodes[node].tree_height = nodes[node].height;
            return nodes[node].height;
        }

        const gap = layoutInfo.minimumVerticalSpaceNonGroupedNodes;
        let childrenHeight = gap * (edges[node].size - 1);

        for (const child of edges[node]) childrenHeight += getPosition(child);

        nodes[node].tree_height = Math.max(nodes[node].height, childrenHeight);
        return nodes[node].tree_height;
    }

    function groupRecursion(node) {
        const verticalGap = layoutInfo.nodeEdgeSpace * 2;
        const children = nodes[node].rows;
        let childrenHeight = verticalGap * (children.length - 1);
        const rowHeights = [];

        for (const row of children) {
            let tempChildHeight = 0;
            for (const child of row) tempChildHeight = Math.max(tempChildHeight, getPosition(child));
            rowHeights.push(tempChildHeight);
            childrenHeight += tempChildHeight;
        }

        nodes[node].row_heights = rowHeights;
        nodes[node].tree_height = Math.max(nodes[node].height, childrenHeight);
        return nodes[node].tree_height;
    }

    getPosition(root);
}

export function getYPositions(root, nodes, edges) {
    function relativeYPositions(node) {
        if (nodes[node].is_leaf) return;

        let currentY = nodes[node].tree_height / 2;

        if (nodes[node].is_group_parent) {
            const gap = layoutInfo.nodeEdgeSpace * 2;
            for (let i = 0; i < nodes[node].rows.length; i++) {
                const row = nodes[node].rows[i];
                const height = nodes[node].row_heights[i];
                const nodesRelativeY = currentY - height / 2;
                for (const child of row) nodes[child].relative_y = nodesRelativeY;
                currentY -= height + gap;
            }
        } else {
            const gap = layoutInfo.minimumVerticalSpaceNonGroupedNodes;
            for (const child of edges[node]) {
                nodes[child].relative_y = currentY - nodes[child].tree_height / 2;
                currentY -= nodes[child].tree_height + gap;
            }
        }
    }

    function absoluteY(node) {
        const parentY = nodes[nodes[node].parent].y;
        nodes[node].y = nodes[node].relative_y + parentY;
    }

    nodes[root].relative_y = 0;
    nodes[root].y = 0;
    bfs(root, edges, relativeYPositions);
    bfs(root, edges, absoluteY);
}

export function getXPositions(root, nodes, edges) {
    const levelsX = { 0: [0, nodes[root].width] };

    function relativeX(node) {
        const currLevel = nodes[node].level + 1;
        if (!levelsX[currLevel]) {
            levelsX[currLevel] = [
                levelsX[currLevel - 1][1] + layoutInfo.spaceBetweenLevels,
                0,
            ];
        }

        if (nodes[node].is_group_parent) {
            const children = nodes[node].rows;
            const gap = layoutInfo.horizontalSpaceBetweenNodes;
            nodes[node].col_widths = [];

            let minWidth = Infinity;
            let maxColumns = 0;
            for (const row of children) maxColumns = Math.max(maxColumns, row.length);

            let currentX = levelsX[currLevel][0];
            for (let index2 = 0; index2 < maxColumns; index2++) {
                let colWidth = 0;
                for (const row of children) {
                    const index = index2 + row.length - maxColumns;
                    if (index < 0) continue;
                    const child = row[index];
                    colWidth = Math.max(colWidth, nodes[child].width);
                    minWidth = Math.min(minWidth, nodes[child].width);
                    nodes[child].relative_x = currentX;
                }
                nodes[node].col_widths.push(colWidth);
                currentX += colWidth + gap;
            }

            nodes[node].min_width = minWidth;
            levelsX[currLevel][1] = Math.max(levelsX[currLevel][1], currentX - gap);
        } else {
            const currentX = levelsX[currLevel][0];
            let maxWidth = 0;
            let minWidth = Infinity;

            if (edges[node]) {
                for (const child of edges[node]) {
                    maxWidth = Math.max(maxWidth, nodes[child].width);
                    minWidth = Math.min(minWidth, nodes[child].width);
                    nodes[child].relative_x = currentX;
                }
            }
            nodes[node].col_width = maxWidth;
            nodes[node].min_width = minWidth;
            levelsX[currLevel][1] = Math.max(levelsX[currLevel][1], currentX + maxWidth);
        }

        nodes[root]['graph-width'] = levelsX[currLevel][1];
    }

    function absoluteX(node) {
        if (nodes[node].is_group_parent) {
            const defaultWidth = nodes[node].min_width;
            const columns = nodes[node].col_widths.length;
            for (let col = 0; col < columns; col++) {
                const current = nodes[node].col_widths[col];
                const extension = (current - defaultWidth) / 2;
                for (const row of nodes[node].rows) {
                    const index = col + row.length - columns;
                    if (index < 0) continue;
                    nodes[row[index]].x = nodes[row[index]].relative_x + extension;
                }
            }
        } else if (!nodes[node].is_leaf) {
            const defaultWidth = nodes[node].min_width;
            const extension = (nodes[node].col_width - defaultWidth) / 2;
            for (const child of edges[node]) {
                nodes[child].x = nodes[child].relative_x + extension;
            }
        }
    }

    nodes[root].relative_x = 0;
    nodes[root].x = 0;
    bfs(root, edges, relativeX);
    bfs(root, edges, absoluteX);
}

export function transformNodes(root, nodes, edges) {
    function centered(node) {
        const centerX = nodes[node].x;
        const centerY = nodes[node].y;
        const width = nodes[node].width;
        const height = nodes[node].height;
        nodes[node].x = centerX - width / 2;
        nodes[node].y = centerY + height / 2;
    }

    bfs(root, edges, centered);
}
