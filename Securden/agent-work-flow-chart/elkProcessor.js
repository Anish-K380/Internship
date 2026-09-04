import ELK from 'elkjs';
const elk = new ELK();

export async function graphNumbers(childrenObj, edgesObj) {
    const graph = {
	id: 'root',
	layoutOptions: { 'elk.algorithm': 'layered' },
	children: childrenObj,
	edges: edgesObj
    }

    return elk.layout(graph);
}
