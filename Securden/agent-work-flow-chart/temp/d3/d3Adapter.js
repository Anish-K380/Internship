export function adaptForD3(elkData) {
    const nodes = elkData.children.map(node => ({
        id: node.id,
        type: node.type,
        label: node.label,
        metadata: node.metadata,

        x: node.x,
        y: node.y,

        width: node.width,
        height: node.height,
        shape: node.shape,
	icon: node.icon
    }));

    const edges = elkData.edges.map(edge => {
        const points = [];

        for (const section of edge.sections ?? []) {
            points.push(section.startPoint);

            for (const bendPoint of section.bendPoints ?? []) {
                points.push(bendPoint);
            }

            points.push(section.endPoint);
        }

        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            points
        };
    });

    return {
        width: elkData.width,
        height: elkData.height,
        nodes,
        edges
    };
}
