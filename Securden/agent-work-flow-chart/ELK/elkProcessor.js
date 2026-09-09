import ELK from 'elkjs';

const elk = new ELK();

export function graphNumbers(childrenObj, edgesObj) {
    const graph = {
	id: 'root',
	layoutOptions: { 'elk.algorithm': 'layered',
			 'org.eclipse.elk.edgeRouting': 'SPLINES',
			 'org.eclipse.elk.layered.mergeEdges': true,
			 'org.eclipse.elk.layered.layering.strategy': 'COFFMAN_GRAHAM',
			 'org.eclipse.elk.layered.layering.coffmanGraham.layerBound': 16,
			 'org.eclipse.elk.layered.edgeRouting.splines.mode': 'SLOPPY',
			 'org.eclipse.elk.spacing.edgeNode': 40,
			 'org.eclipse.elk.port.borderOffset': 50,
			 'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 80
		       },
	children: childrenObj,
	edges: edgesObj
    }

    return elk.layout(graph);
}
