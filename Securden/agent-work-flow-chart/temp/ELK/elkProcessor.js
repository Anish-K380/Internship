import ELK from 'elkjs';
const elk = new ELK();

export function graphNumbers(childrenObj, edgesObj) {
    const graph = {
	id: 'root',
	layoutOptions: { 'elk.algorithm': 'layered', 'org.eclipse.elk.edgeRouting': 'SPLINES' },
	children: childrenObj,
	edges: edgesObj
    }

    return elk.layout(graph);
}
