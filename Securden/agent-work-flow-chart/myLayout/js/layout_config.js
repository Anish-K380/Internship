export class PlotInfo {
    spaceBetweenLevels = 400;
    levelAlign = true;
    minimumVerticalSpaceNonGroupedNodes = 50;
    groupOtherSpace = 50;

    minimumNodesForGroup = 5;
    verticalAlignNodes = true;
    horizontalSpaceBetweenNodes = 150;
    nodeEdgeSpace = 100;

    rowsColumnsPerGroupMethod = 'fixed';
    fixRowsColumns = 'columns';
    fixRowsColumnsNumber = 6;

    rowRatioNumber = 1;
    columnRatioNumber = 1;

    edgeArrival = 'top';
    edgeAttachmentToNode = 'left';
}

export const layoutInfo = new PlotInfo();
