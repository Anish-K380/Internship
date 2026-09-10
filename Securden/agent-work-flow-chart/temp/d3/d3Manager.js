import { adaptForD3 } from './d3Adapter.js';
import { renderGraph } from './d3Renderer.js';

export function d3Manager(elkData, graphElement) {
    const d3Data = adaptForD3(elkData);

    const svg = renderGraph(d3Data, graphElement);

    return svg;
}
