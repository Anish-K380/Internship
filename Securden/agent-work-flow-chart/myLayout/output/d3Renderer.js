import { select, pointer } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { drag } from 'd3-drag';

import { displayConfig } from './viewer/display_config.js';

export function renderGraph(graphData, selector) {
    // ==================================================
    // Initial graph data
    // ==================================================

    const {
        width,
        height,
        nodes,
        edges
    } = graphData;

    // ==================================================
    // Renderer state
    // ==================================================

    let selectedNode = null;
    let hoveredNode = null;

    let metadataPanel = null;
    let resizeHandle = null;

    let currentTransform = zoomIdentity;

    let onUndo = null;
    let onRedo = null;
    let onReset = null;

    function setOnUndo(callback) {
	onUndo = callback;
    }

    function setOnRedo(callback) {
	onRedo = callback;
    }

    function setOnReset(callback) {
	onReset = callback;
    }

    // ==================================================
    // Event listeners
    // ==================================================

    let nodeMoveListener = null;
    let edgeMoveListener = null;
    let edgeAttachmentListener = null;

    // ==================================================
    // Container
    // ==================================================

    const container = select(selector);
    container
        .selectAll('*')
        .remove();

    // ==================================================
    // SVG
    // ==================================================

    const svg =
          container
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr(
              'viewBox',
              `0 ${-height / 2} ${width} ${height}`
          )
          .attr(
              'preserveAspectRatio',
              'xMidYMid meet'
          );

    // ==================================================
    // Arrow marker
    // ==================================================

    svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L8,0L0,4')
        .attr('fill', '#64748b');

    // ==================================================
    // Main viewport
    // ==================================================

    const viewport = svg.append('g');

    // ==================================================
    // Styles
    // ==================================================

    const edgeStyle = displayConfig.style.edge;

    const normalNodeStyle = displayConfig.style.node.normal;

    const hoverNodeStyle = displayConfig.style.node.hover;

    const selectedNodeStyle = displayConfig.style.node.selected;

    // ==================================================
    // Current renderer objects
    // ==================================================

    let nodeList = Object.values(nodes);

    let edgeList = Object.values(edges ?? {});

    let nodeById = new Map(nodeList.map(node => [node.id, node]));

    let edgeById = new Map(edgeList.map(edge => [edge.id, edge]));

    let nodeGroupById = new Map();

    let edgeElementById = new Map();

    // ==================================================
    // Edge path
    // ==================================================

    function edgePath(edge) {

        const start = edge.startPoint;

        const end = edge.endPoint;

        const controls = edge.controlPoints ?? [];

        if (!start || !end) {
            return '';
        }

        // --------------------------------------------------
        // Straight line
        // --------------------------------------------------

        if (controls.length === 0) {

            return `
                M ${start.x} ${start.y}
                L ${end.x} ${end.y}
            `;
        }

        // --------------------------------------------------
        // Cubic Bézier
        // --------------------------------------------------

        if (controls.length === 2) {

            const cp1 = controls[0];

            const cp2 = controls[1];

            return `
                M ${start.x} ${start.y}
                C
                ${cp1.x} ${cp1.y},
                ${cp2.x} ${cp2.y},
                ${end.x} ${end.y}
            `;
        }

        // --------------------------------------------------
        // Quadratic Bézier
        // --------------------------------------------------

        if (controls.length === 1) {

            const cp = controls[0];

            return `
                M ${start.x} ${start.y}
                Q
                ${cp.x} ${cp.y},
                ${end.x} ${end.y}
            `;
        }

        // --------------------------------------------------
        // Fallback
        // --------------------------------------------------

        let path = `
            M ${start.x} ${start.y}
        `;

        for (const point of controls) {

            path += `
                L ${point.x} ${point.y}
            `;
        }

        path += `
            L ${end.x} ${end.y}
        `;

        return path;
    }


    // ==================================================
    // Draw edge
    // ==================================================

    function drawEdge(edge) {

        const path =
              edgeGroup
              .append('path')
              .attr('class', 'edge')
              .attr('fill', 'none')
              .attr(
                  'stroke',
                  edgeStyle.stroke
              )
              .attr(
                  'stroke-width',
                  edgeStyle.strokeWidth
              )
              .attr(
                  'opacity',
                  edgeStyle.opacity
              )
              .attr(
                  'stroke-linecap',
                  'round'
              )
              .attr(
                  'stroke-linejoin',
                  'round'
              )
              .attr(
                  'marker-end',
                  'url(#arrow)'
              )
              .attr(
                  'd',
                  edgePath(edge)
              );


        edgeElementById.set(
            edge.id,
            path
        );
    }

    // ==================================================
    // Edge group
    // ==================================================

    const edgeGroup =
          viewport
          .append('g')
          .attr('class', 'edges');

    for (const edge of edgeList) {
        drawEdge(edge);
    }

    // ==================================================
    // Node group
    // ==================================================

    const nodeGroup =
          viewport
          .append('g')
          .attr('class', 'nodes');


    // ==================================================
    // Draw node
    // ==================================================

    function drawNode(node) {

        const group =
              nodeGroup
              .append('g')
              .attr('class', 'node')
	      .datum(node)
              .attr('transform', `translate(${node.x}, ${node.y})`);

        nodeGroupById.set(node.id, group);

        // --------------------------------------------------
        // Node shape
        // --------------------------------------------------

        if (node.shape === 'circle') {

            group
                .append('ellipse')
                .attr('class', 'node-shape')
                .attr('cx', node.width / 2)
                .attr('cy', node.height / 2)
                .attr('rx', node.width / 2)
                .attr('ry', node.height / 2)
                .attr('fill', normalNodeStyle.fill)
                .attr('stroke', normalNodeStyle.stroke)
                .attr('stroke-width', normalNodeStyle.strokeWidth);

        } else {

            group
                .append('rect')
                .attr('class', 'node-shape')
                .attr('width', node.width)
                .attr('height', node.height)
                .attr('rx', 8)
                .attr('fill', normalNodeStyle.fill)
                .attr('stroke',normalNodeStyle.stroke)
                .attr('stroke-width', normalNodeStyle.strokeWidth);
        }

        // --------------------------------------------------
        // Icon
        // --------------------------------------------------

        if (node.icon) {

            group
                .append('image')
                .attr('class', 'node-icon')
                .attr('href', node.icon)
                .attr('width', 32)
                .attr('height', 32)
                .attr('x', 10)
                .attr('y',(node.height - 32) / 2);
        }

        // --------------------------------------------------
        // Node ID
        // --------------------------------------------------

        group
            .append('text')
            .attr('class', 'node-id')
            .attr('x', node.width / 2)
            .attr('y', node.height / 2 - 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', normalNodeStyle.textColor)
            .attr('font-size','12px')
            .attr('font-weight', '600')
            .text(node.id);

        // --------------------------------------------------
        // Node label
        // --------------------------------------------------

        group
            .append('text')
            .attr('class', 'node-label')
            .attr('x', node.width / 2)
            .attr('y', node.height / 2 + 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline','middle')
            .attr('fill', normalNodeStyle.textColor)
            .attr('font-size', '12px')
            .text(node.label);

        // --------------------------------------------------
        // Hover
        // --------------------------------------------------

        group
            .on(
                'mouseenter',
                function(event, currentNode) {

                    hoveredNode = currentNode;

                    if (selectedNode !== currentNode) {

                        select(this)
                            .select('.node-shape')
                            .attr('stroke',hoverNodeStyle.stroke)
                            .attr('stroke-width',hoverNodeStyle.strokeWidth);
                    }
                }
            );


        group
            .on(
                'mouseleave',
                function(event, currentNode) {

                    if (selectedNode !== currentNode) {

                        select(this)
                            .select('.node-shape')
                            .attr('stroke', normalNodeStyle.stroke)
                            .attr('stroke-width', normalNodeStyle.strokeWidth);
                    }

                    if (hoveredNode === currentNode) {

                        hoveredNode = null;
                    }
                }
            );

        // --------------------------------------------------
        // Selection
        // --------------------------------------------------

        group
            .on(
                'click',
                function(event, currentNode) {

                    event.stopPropagation();

                    if (selectedNode) {
                        const previous = nodeGroupById.get(selectedNode.id);

                        if (previous) {
                            previous
                                .select('.node-shape')
                                .attr('stroke', normalNodeStyle.stroke)
                                .attr('stroke-width', normalNodeStyle.strokeWidth);
                        }
                    }

                    selectedNode = currentNode;

                    select(this)
                        .select('.node-shape')
                        .attr('stroke', selectedNodeStyle.stroke)
                        .attr('stroke-width', selectedNodeStyle.strokeWidth);

                    showMetadataPanel(currentNode, this);
                }
            );

        // --------------------------------------------------
        // Drag
        // --------------------------------------------------

	group.call(
	    drag()
		.on('start', function(event, currentNode) {

		    const node = nodeById.get(currentNode.id);

		    node._dragStartX = node.x;
		    node._dragStartY = node.y;
		})

		.on('drag', function(event, currentNode) {

		    const node = nodeById.get(currentNode.id);

		    node.x += event.dx;
		    node.y += event.dy;

		    select(this)
			.attr(
			    'transform',
			    `translate(${node.x}, ${node.y})`
			);

		    if (nodeMoveListener) {
			nodeMoveListener(
			    node.id,
			    node.x,
			    node.y
			);
		    }
		})

		.on('end', function(event, currentNode) {

		    const node = nodeById.get(currentNode.id);

		    if (nodeMoveListener) {
			nodeMoveListener(
			    node.id,
			    node.x,
			    node.y
			);
		    }

		    delete node._dragStartX;
		    delete node._dragStartY;
		})
	);

    }


    // ==================================================
    // Draw all nodes
    // ==================================================

    for (const node of nodeList) {
        drawNode(node);
    }

    // ==================================================
    // Metadata panel
    // ==================================================

    function showMetadataPanel(node, element) {

        if (metadataPanel) {
            metadataPanel.remove();
        }

        if (resizeHandle) {
            resizeHandle.remove();
        }

        let panelWidth = 500;
        let panelHeight = 700;

        const gap = 16;

        const left = node.x + node.width + gap;

        const top = node.y;

        // --------------------------------------------------
        // Panel
        // --------------------------------------------------

        metadataPanel =
            viewport
            .append('foreignObject')
            .attr('class', 'metadata-panel')
            .attr('x', left)
            .attr('y', top)
            .attr('width', panelWidth)
            .attr('height',panelHeight);

        // --------------------------------------------------
        // Content
        // --------------------------------------------------

        const panelContent =
              metadataPanel
              .append('xhtml:div')
              .attr('class', 'metadata-panel-content');

        panelContent.on(
            'wheel',
            function(event) {
                event.stopPropagation();
            }
        );

        // --------------------------------------------------
        // Metadata
        // --------------------------------------------------

        const fields = [
            ['ID', node.id],
            ['Label', node.label],
            ['Type', node.type],
            ['Metadata', node.metadata]
        ];

        for (const [key, value] of fields) {

            const row =
                  panelContent
                  .append('div')
                  .attr('class','metadata-row');

            row
                .append('div')
                .attr('class', 'metadata-key')
                .text(key);

            row
                .append('div')
                .attr('class', 'metadata-value')
                .text(key === 'Metadata' ? JSON.stringify(value, null, 2) : String(value ?? ''));
        }

        // --------------------------------------------------
        // Resize handle
        // --------------------------------------------------

        resizeHandle =
            viewport
            .append('rect')
            .attr('class', 'metadata-resize-handle')
            .attr('x', left + panelWidth - 18)
            .attr('y', top + panelHeight - 18)
            .attr('width', 18)
            .attr('height',18)
            .attr('cursor','nwse-resize');

        // --------------------------------------------------
        // Resize
        // --------------------------------------------------

        let startMouseX;
        let startMouseY;

        let startWidth;
        let startHeight;

        resizeHandle.call(
            drag()
                .on('start', function(event) {

                    event
                        .sourceEvent
                        .stopPropagation();

                    [startMouseX, startMouseY] = pointer(event, viewport.node());

                    startWidth = panelWidth;

                    startHeight =panelHeight;
                }
                   )

                .on(
                    'drag',
                    function(event) {

                        event
                            .sourceEvent
                            .stopPropagation();

                        const [mouseX, mouseY] = pointer(event, viewport.node());

                        panelWidth = Math.max(250, startWidth + (mouseX - startMouseX));

                        panelHeight = Math.max(150, startHeight + (mouseY - startMouseY));

                        metadataPanel
                            .attr('width', panelWidth)
                            .attr('height', panelHeight);

                        resizeHandle
                            .attr('x', left + panelWidth - 16)
                            .attr('y', top + panelHeight - 16);
                    }
                )
        );
    }

    // ==================================================
    // Empty graph click
    // ==================================================

    svg.on('click', function() {

        if (!selectedNode) {
            return;
        }

        const group = nodeGroupById.get(selectedNode.id);

        if (group) {

            group
                .select('.node-shape')
                .attr('stroke', normalNodeStyle.stroke)
                .attr('stroke-width', normalNodeStyle.strokeWidth);
        }

        selectedNode = null;

        if (metadataPanel) {

            metadataPanel.remove();
            metadataPanel = null;
        }

        if (resizeHandle) {

            resizeHandle.remove();
            resizeHandle = null;
        }
    }
	  );


    // ==================================================
    // Update node position
    // ==================================================

    function updateNode(node) {

        const group = nodeGroupById.get(node.id);

        if (!group) {
            return;
        }

        group.attr('transform', `translate(${node.x}, ${node.y})`);
    }

    // ==================================================
    // Update edge
    // ==================================================

    function updateEdge(edge) {

	let path =
            edgeElementById.get(edge.id);

	if (!path) {

            drawEdge(edge);

            return;
	}

	path.attr(
            'd',
            edgePath(edge)
	);
    }

    // ==================================================
    // Remove node
    // ==================================================

    function removeNode(nodeId) {

        const group = nodeGroupById.get(nodeId);

        if (group) {
            group.remove();
        }

        nodeGroupById.delete(nodeId);

        nodeById.delete(nodeId);
    }

    // ==================================================
    // Remove edge
    // ==================================================

    function removeEdge(edgeId) {

        const path = edgeElementById.get(edgeId);

        if (path) {
            path.remove();
        }

        edgeElementById.delete(edgeId);

        edgeById.delete(edgeId);
    }

    // ==================================================
    // Render changes
    // ==================================================

    function applyChanges(changes) {

	if (!changes || changes.length === 0) {
            return;
	}

	for (const change of changes) {

            // ==================================================
            // Node change
            // ==================================================

            if (change.type === 'node') {

		if (change.state === null) {

                    removeNode(change.id);

		} else {

                    const node = change.state;

                    nodeById.set(
			node.id,
			node
                    );

                    const group =
			  nodeGroupById.get(node.id);

                    if (group) {

			// Keep D3's datum synchronized
			group.datum(node);

			updateNode(node);
                    }

                    continue;
		}
            }

            // ==================================================
            // Edge change
            // ==================================================

            if (change.type === 'edge') {

		if (change.state === null) {

                    removeEdge(change.id);

		} else {

                    const edge = change.state;

                    edgeById.set(
			edge.id,
			edge
                    );

                    updateEdge(edge);
		}
            }
	}
    }

    function applyReset(nodes, edges) {

	// ------------------------------------------
	// Remove current SVG nodes
	// ------------------------------------------

	nodeGroup
            .selectAll('.node')
            .remove();

	// ------------------------------------------
	// Remove current SVG edges
	// ------------------------------------------

	edgeGroup
            .selectAll('.edge')
            .remove();

	// ------------------------------------------
	// Clear renderer state
	// ------------------------------------------

	nodeById.clear();
	edgeById.clear();

	nodeGroupById.clear();
	edgeElementById.clear();

	// ------------------------------------------
	// Install new state
	// ------------------------------------------

	nodeList = Object.values(nodes);
	edgeList = Object.values(edges ?? {});

	// ------------------------------------------
	// Rebuild edge state
	// ------------------------------------------

	for (const edge of edgeList) {

            edgeById.set(
		edge.id,
		edge
            );

            drawEdge(edge);
	}

	// ------------------------------------------
	// Rebuild node state
	// ------------------------------------------

	for (const node of nodeList) {

            nodeById.set(
		node.id,
		node
            );

            drawNode(node);
	}
    }

    // ==================================================
    // Renderer event subscription
    // ==================================================

    function onNodeMove(callback) {

        nodeMoveListener = callback;
    }

    function onEdgeMove(callback) {

        edgeMoveListener = callback;
    }

    function onEdgeAttachment(callback) {

        edgeAttachmentListener = callback;
    }

    // ==================================================
    // History controls
    // ==================================================

    const controls =
          container
          .append('div')
          .attr('class', 'graph-controls');

    const resetButton =
          controls
          .append('button')
          .attr('class', 'graph-control graph-reset')
          .attr('type', 'button')
          .attr('title','Reset graph')
          .text('↻');

    resetButton.on(
	'click',
	() => {
            if (onReset) {
		onReset();
            }
	}
    );

    const historyControls =
          controls
          .append('div')
          .attr('class', 'graph-history');

/*    const undoButton =
          historyControls
          .append('button')
          .attr('class', 'graph-control')
          .attr('type', 'button')
          .attr('title', 'Undo')
          .text('↶');

    const redoButton =
          historyControls
          .append('button')
          .attr('class', 'graph-control')
          .attr('type', 'button')
          .attr('title', 'Redo')
          .text('↷');

    undoButton.on(
	'click',
	() => {
            if (onUndo) {
		onUndo();
            }
	}
    );

    redoButton.on(
	'click',
	() => {
            if (onRedo) {
		onRedo();
            }
	}
	);
*/

    // These are intentionally left as renderer-level
    // controls. The actual engine actions can be wired
    // when the renderer is connected to EngineManager.

    // ==================================================
    // Zoom / pan
    // ==================================================

    const zoomBehavior =
          zoom()
          .scaleExtent([0.1, 5])
          .on('zoom', event => {
              currentTransform = event.transform;

              viewport.attr('transform', event.transform);
          }
             );

    svg.call(zoomBehavior);

    // ==================================================
    // Initial zoom
    // ==================================================

    const containerWidth = container.node().clientWidth;

    const containerHeight = container.node().clientHeight;

    if (containerWidth && containerHeight && width > 0 && height > 0) {

        const scale = Math.min(containerWidth / width, containerHeight / height);

        const x = (containerWidth - width * scale) / 2;

        const y =(containerHeight - height * scale) / 2;

	currentTransform =
	    zoomIdentity
            .translate(x, y)
            .scale(scale);

	viewport.attr(
	    'transform',
	    currentTransform
	);

    }

    // ==================================================
    // Renderer API
    // ==================================================

    return {

        onNodeMove,

        onEdgeMove,

        onEdgeAttachment,

        applyChanges,

	applyReset,

        getSVG() {
            return svg;
        },

	onUndo: setOnUndo,

	onRedo: setOnRedo,

	onReset: setOnReset
    };
}
