export class PlotInfo {
    spaceBetweenLevels = 400;
    levelAlign = true;
    minimumVerticalSpaceNonGroupedNodes = 50;

    minimumNodesForGroup = 5;
    verticalAlignNodes = true;
    horizontalSpaceBetweenNodes = 150;
    nodeEdgeSpace = 100;

    rowsColumnsPerGroupMethod = 'ratio'; //['fixed', 'ratio']

    fixRowsColumns = 'rows'; //['rows, 'columns']
    fixRowsColumnsNumber = 7;

    rowRatioNumber = 4;
    columnRatioNumber = 3;

    edgeArrival = 'top'; //['top', 'bottom']
    edgeAttachmentToNode = 'left'; //['top', 'right', 'bottom', 'left']
}

export const layoutInfo = new PlotInfo();
