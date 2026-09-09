import ELK from 'elkjs';

const elk = new ELK();

export function graphNumbers(childrenObj, edgesObj) {
    const graph = {
	id: 'root',
	layoutOptions: { 'elk.algorithm': 'layered',
			 'org.eclipse.elk.edgeRouting': 'SPLINES',
			 'org.eclipse.elk.layered.mergeEdges': true,
			 'org.eclipse.elk.layered.layering.strategy': 'COFFMAN_GRAHAM',
			 'org.eclipse.elk.layered.layering.coffmanGraham.layerBound': 8,
			 'org.eclipse.elk.layered.edgeRouting.splines.mode': 'SLOPPY',
			 'org.eclipse.elk.spacing.edgeNode': 40,
			 'org.eclipse.elk.graphviz.concentrate': true,
			 'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 80,
			 'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
			 'org.eclipse.elk.layered.mergeHierarchyEdges': true,
			 'org.eclipse.elk.mrtree.edgeRoutingMode': 'AVOID_OVERLAP',
			 'org.eclipse.elk.spacing.edgeEdge': -0.1
		       },
	children: childrenObj,
	edges: edgesObj
    }

    return elk.layout(graph);
}
