import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';

import { displayConfig } from '../viewer/display_config.js';

export function renderGraph(graphData, selector) {
    const {
        width,
        height,
        nodes,
        edges
    } = graphData;

    const container = select(selector);

    container.selectAll('*').remove();

    // --------------------------------------------------
    // SVG
    // --------------------------------------------------

    const svg = container
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // --------------------------------------------------
    // Arrow marker
    // --------------------------------------------------

    svg.append('defs')
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

    // --------------------------------------------------
    // Main viewport
    // --------------------------------------------------

    const viewport = svg.append('g');

    let currentTransform = zoomIdentity;

    // --------------------------------------------------
    // Styles
    // --------------------------------------------------

    const edgeStyle = displayConfig.style.edge;

    // --------------------------------------------------
    // Edges
    // --------------------------------------------------

    viewport
        .append('g')
        .attr('class', 'edges')
        .selectAll('path')
        .data(edges)
        .join('path')
        .attr('class', 'edge')
        .attr('d', edge => elkSplinePath(edge.points))
        .attr('fill', 'none')
        .attr('stroke', edgeStyle.stroke)
        .attr('stroke-width', edgeStyle.strokeWidth)
        .attr('opacity', edgeStyle.opacity)
	.attr('stroke-linecap', 'round')
	.attr('stroke-linejoin', 'round')
        .attr('marker-end', 'url(#arrow)');

    // --------------------------------------------------
    // Nodes
    // --------------------------------------------------

    const nodeGroup = viewport
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .attr(
            'transform',
            node => `translate(${node.x}, ${node.y})`
        );

    // --------------------------------------------------
    // Panels / selection state
    // --------------------------------------------------

    let selectedNode = null;
    let clickPanel = null;
    let hoveredNode = null;
    let clickPanelFullscreen = false;

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    function elkSplinePath(points) {
        if (!points || points.length < 2) {
            return '';
        }

        if (points.length === 2) {
            return `
                M ${points[0].x} ${points[0].y}
                L ${points[1].x} ${points[1].y}
            `;
        }

        let path = `M ${points[0].x} ${points[0].y}`;

        /*
         * Interpret ELK spline points as:
         *
         * start
         * control point
         * control point
         * end
         * control point
         * control point
         * end
         * ...
         */

        let i = 1;

        while (i + 2 < points.length) {
            const c1 = points[i];
            const c2 = points[i + 1];
            const end = points[i + 2];

            path += `
                C
                ${c1.x} ${c1.y},
                ${c2.x} ${c2.y},
                ${end.x} ${end.y}
            `;

            i += 3;
        }

        /*
         * If a few points remain that don't form
         * a complete cubic Bézier segment, connect
         * them with straight lines.
         */

        while (i < points.length) {
            path += `
                L ${points[i].x} ${points[i].y}
            `;

            i++;
        }

        return path;
    }

    function getFieldValue(node, field) {
        return node[field];
    }

    function formatValue(value) {
        if (value === undefined || value === null) {
            return '';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }

        return String(value);
    }

    function getFieldLabel(field) {
        return field.charAt(0).toUpperCase() + field.slice(1);
    }

    function renderNodeFields(group, node, fields) {
        const lineHeight = 18;

        const values = fields
            .map(field => ({
                field,
                value: getFieldValue(node, field)
            }))
            .filter(item =>
                item.value !== undefined &&
                item.value !== null
            );

        const startY =
            node.height / 2 -
            ((values.length - 1) * lineHeight) / 2;

        values.forEach((item, index) => {
            group
                .append('text')
                .attr('x', node.width / 2)
                .attr('y', startY + index * lineHeight)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr(
                    'fill',
                    displayConfig.style.node.normal.textColor
                )
                .attr(
                    'font-size',
                    index === 0 ? '14px' : '12px'
                )
                .attr(
                    'font-weight',
                    index === 0 ? '600' : '400'
                )
                .text(formatValue(item.value));
        });
    }

    function createPanel(node, fields, className, panelConfig) {
	const foreignObject = viewport
              .append('foreignObject')
              .attr('class', className)
              .attr('width', panelConfig.width)
              .attr('height', 1);

	const panel = foreignObject
              .append('xhtml:div')
              .attr(
		  'class',
		  `node-info-panel ${className}`
              )
              .style('box-sizing', 'border-box')
              .style(
		  'width',
		  `${panelConfig.width}px`
              )
              .style(
		  'padding',
		  `${panelConfig.padding}px`
              )
              .style('height', 'auto')
              .style('overflow-y', 'auto')
	      .style('overflow-x', 'hidden')

	panel.on('click', event => {
	    event.stopPropogation();
	});

	// --------------------------------------------------
	// Panel buttons
	// --------------------------------------------------

	if (className === 'click-panel') {
            const controls = panel
		  .append('div')
		  .attr('class', 'panel-controls');

            controls
		.append('button')
		.attr('class', 'panel-button panel-fullscreen')
		.attr('type', 'button')
		.text('⛶')
		.on('click', event => {
                    event.stopPropagation();
                    toggleClickPanelFullscreen();
		});
	}

	// --------------------------------------------------
	// Fields
	// --------------------------------------------------

	for (const field of fields) {
            const value = getFieldValue(node, field);

            if (
		value === undefined ||
		    value === null
            ) {
		continue;
            }

            const fieldElement = panel
		  .append('div')
		  .attr('class', 'field');

            fieldElement
		.append('span')
		.attr(
                    'class',
                    `field-label field-${field}`
		)
		.text(`${getFieldLabel(field)}: `);

            fieldElement
		.append('span')
		.attr('class', 'field-value')
		.text(formatValue(value));
	}

	const panelNode = panel.node();

	const actualHeight =
              panelNode.scrollHeight;

	foreignObject.attr(
            'height',
            actualHeight + 2
	);

	return foreignObject;
    }

    function positionPanel(panel, node, panelConfig) {
	if (!panel || !node) {
            return;
	}

	const scale = 1 / currentTransform.k;
	const gap = 15;

	const anchorX =
              node.x +
              node.width +
              gap * scale;

	const anchorY = node.y;

	if (panelConfig.fixedScreenSize) {
            panel.attr(
		'transform',
		`translate(${anchorX}, ${anchorY}) scale(${scale})`
            );
	} else {
            panel
		.attr('transform', null)
		.attr('x', anchorX)
		.attr('y', anchorY);
	}
    }

    function removeClickPanel() {
        if (clickPanel) {
            clickPanel.remove();
            clickPanel = null;
        }

	clickPanelFullscreen = false;

        selectedNode = null;

        const normalStyle =
            displayConfig.style.node.normal;

        nodeGroup
            .selectAll('rect, ellipse')
            .attr('fill', normalStyle.fill)
            .attr('stroke', normalStyle.stroke)
            .attr(
                'stroke-width',
                normalStyle.strokeWidth
            );
    }

    function toggleClickPanelFullscreen() {
	if (!clickPanel || !selectedNode) {
            return;
	}

	clickPanelFullscreen = !clickPanelFullscreen;

	const panelElement = clickPanel.select('div');

	if (clickPanelFullscreen) {
            const containerNode = container.node();

            const containerWidth = containerNode.clientWidth;

            const containerHeight = containerNode.clientHeight;

            const scale = 1 / currentTransform.k;

            const x = -currentTransform.x / currentTransform.k;

            const y = -currentTransform.y / currentTransform.k;

            clickPanel
		.attr('width', containerWidth)
		.attr('height', containerHeight)
		.attr(
                    'transform',
                    `translate(${x}, ${y}) scale(${scale})`
		);

            panelElement
		.style('width', `${containerWidth}px`)
		.style('height', `${containerHeight}px`)
		.style('overflow-y', 'auto')
		.style('overflow-x', 'hidden');
	} else {
            clickPanel
		.attr(
                    'width',
                    displayConfig.style.panel.click.width
		)
		.attr('height', 1);

            panelElement
		.style(
                    'width',
                    `${displayConfig.style.panel.click.width}px`
		)
		.style('height', 'auto')
		.style('overflow-x', 'visible')
		.style('overflow-y', 'visible');

            positionPanel(
		clickPanel,
		selectedNode,
		displayConfig.style.panel.click
            );
	}
    }

    // --------------------------------------------------
    // Draw node shapes
    // --------------------------------------------------

    nodeGroup.each(function(node) {
        const group = select(this);

        const normalStyle =
            displayConfig.style.node.normal;

        if (node.shape === 'circle') {
            group
                .append('ellipse')
                .attr('class', 'node-shape')
                .attr('cx', node.width / 2)
                .attr('cy', node.height / 2)
                .attr('rx', node.width / 2)
                .attr('ry', node.height / 2)
                .attr('fill', normalStyle.fill)
                .attr('stroke', normalStyle.stroke)
                .attr(
                    'stroke-width',
                    normalStyle.strokeWidth
                );
        } else {
            group
                .append('rect')
                .attr('class', 'node-shape')
                .attr('width', node.width)
                .attr('height', node.height)
                .attr('rx', 8)
                .attr('fill', normalStyle.fill)
                .attr('stroke', normalStyle.stroke)
                .attr(
                    'stroke-width',
                    normalStyle.strokeWidth
                );
        }

        renderNodeFields(
            group,
            node,
            displayConfig.node.normal.fields
        );
    });

    // --------------------------------------------------
    // Node interactions
    // --------------------------------------------------

    nodeGroup
	.on('mouseenter', function(event, node) {
	    hoveredNode = node;

	    const group = select(this);

	    const hoverStyle =
		  displayConfig.style.node.hover;

	    group
		.selectAll('rect, ellipse')
		.attr('fill', hoverStyle.fill)
		.attr('stroke', hoverStyle.stroke)
		.attr('stroke-width', hoverStyle.strokeWidth)
		.attr('filter', 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.45))');
	})

	.on('mouseleave', function(event, node) {
	    const group = select(this);

	    if (selectedNode !== node) {
		const normalStyle =
		      displayConfig.style.node.normal;

		group
		    .selectAll('rect, ellipse')
		    .attr('fill', normalStyle.fill)
		    .attr('stroke', normalStyle.stroke)
		    .attr(
			'stroke-width',
			normalStyle.strokeWidth
		    )
		    .attr('filter', null);
	    }

	    if (hoveredNode === node) {
		hoveredNode = null;
	    }
	})

        .on('click', function(event, node) {
            event.stopPropagation();

            // --------------------------------------------------
            // Remove previous selection styling
            // --------------------------------------------------

            if (selectedNode) {
                const previousGroup = nodeGroup
                    .filter(
                        previous =>
                            previous === selectedNode
                    );

                const normalStyle =
                    displayConfig.style.node.normal;

                previousGroup
                    .selectAll('rect, ellipse')
                    .attr(
                        'fill',
                        normalStyle.fill
                    )
                    .attr(
                        'stroke',
                        normalStyle.stroke
                    )
                    .attr(
                        'stroke-width',
                        normalStyle.strokeWidth
                    );
            }

            // --------------------------------------------------
            // Remove previous click panel
            // --------------------------------------------------

            if (clickPanel) {
                clickPanel.remove();
                clickPanel = null;
            }

            // --------------------------------------------------
            // Select node
            // --------------------------------------------------

            selectedNode = node;

            const selectedStyle =
                displayConfig.style.node.selected;

            select(this)
                .selectAll('rect, ellipse')
                .attr('fill', selectedStyle.fill)
                .attr('stroke', selectedStyle.stroke)
                .attr('stroke-width', selectedStyle.strokeWidth)
		.attr('filter', 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.45))');

            // --------------------------------------------------
            // Create click panel
            // --------------------------------------------------

            clickPanel = createPanel(
                node,
                displayConfig.node.click.fields,
                'click-panel',
                displayConfig.style.panel.click
            );

            positionPanel(
                clickPanel,
                node,
                displayConfig.style.panel.click
            );
        });

    // --------------------------------------------------
    // Click empty graph to clear selection
    // --------------------------------------------------

    svg.on('click', function() {
        removeClickPanel();
    });

    // --------------------------------------------------
    // Zoom / pan
    // --------------------------------------------------

    const zoomBehavior = zoom()
	  .scaleExtent([0.1, 5])
	  .on('zoom', event => {
              currentTransform = event.transform;

              viewport.attr(
		  'transform',
		  event.transform
              );

              if (!clickPanel || !selectedNode) {
		  return;
              }

              if (clickPanelFullscreen) {
		  const scale =
			1 / currentTransform.k;

		  const x =
			-currentTransform.x /
			currentTransform.k;

		  const y =
			-currentTransform.y /
			currentTransform.k;

		  clickPanel.attr(
                      'transform',
                      `translate(${x}, ${y}) scale(${scale})`
		  );
              } else {
		  positionPanel(
                      clickPanel,
                      selectedNode,
                      displayConfig.style.panel.click
		  );
              }
	  });

    svg.call(zoomBehavior);
    
    // --------------------------------------------------
    // Initial fit
    // --------------------------------------------------

    const containerWidth =
        container.node().clientWidth;

    const containerHeight =
        container.node().clientHeight;

    if (containerWidth && containerHeight) {
	const fitScale = Math.min(
	    containerWidth / width,
	    containerHeight / height) * 0.9;
	
        const scale = Math.max(fitScale, 0.3);

        const x = (containerWidth - width * scale) / 2;

        const y = (containerHeight - height * scale) / 2;

        svg.call(
            zoomBehavior.transform,
            zoomIdentity
                .translate(x, y)
                .scale(scale)
        );
    }

    return svg;
}
