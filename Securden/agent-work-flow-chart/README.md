# Layout Engine and d3Renderer


## Edit paths
data and links to be given in [graph manager](agent-work-flow-chart/myLayout/output/viewer/graphManager.js)

make changes in [layout config](agent-work-flow-chart/myLayout/js/layout_config.js) to see changes in initial render


## Use config

### Intro
There are some terminologies that I've used for this package you can read about for a better understanding. Most of these configs only work for the initial render.

Group: A cluster of children nodes.  
Level: A collection of sibling nodes or one node if said node has no siblings.  
Row-edge: The edge that goes along with the row.

### 1. spaceBetweenLevels
This is to increase space between the parent and child nodes.

### 2. levelAlign
Keep it as true, feature not implemented yet.

### 3. minimumVerticalSpaceNonGroupedNodes
The space between the children of a node, but if they are not grouped.

### 4. minimumNodesForGroup
The minimum number of nodes required to form a group, if the number of children fall short they form a non-group (they will be in a straight line).

### 5. verticalAlignNodes
Keep it as true, feature not implemented yet.

### 6. horizontalSpaceBetweenNodes
The horizontal space between children in the same row of a group.

### 7. nodeEdgeSpace
The space between the row-edge and the nodes. Increasing this will increase the vertical space between the grouped nodes by a factor of 2 (there is one row edge between two vertically stacked rows).

### 8. rowColumnsPerGroupMethod
This has two options [fixed, ratio].
Fixed: You can fix either the number of columns or the number of rows.
Ratio: You can make the groups have a row: column ratio, this is an approximate and not the perfect ratio.

### 8a i) fixRowsColumns
This has two options [columns, rows]. select columns if you want a fixed number of columns, select rows if you want a fixed number of rows. Works only if you have selected fixed in rowsColumnsGroupMethod.

### 8a ii) fixRowsColumnsNumber
This is to specify the number of rows or columns you want fixed. Works only if you have selected fixed in rowsColumnsGroupMethod.

### 8b i) rowRatioNumber
If you have the row:column ratio as x:y, here is where you enter x. Works only if you have selected ratio in rowsColumnsGroupMethod.

### 8b ii) columnRatioNumber
If you have the row:column ratio as x:y, here is where you enter y. Works only if you have selected ratio in rowsColumnsGroupMethod.

### 9. edgeArrival
This has two options [top, bottom]. This is tell the row-edges if the arrive from the top of the nodes they connect to or the bottom.

### 10. edgeAttachmentToNode
This has four options [top, right, bottom, left]. It is to determine which side of the node to connect to.