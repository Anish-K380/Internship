import { adaptForD3 } from '../d3/d3Adapter.js';
import { renderGraph } from '../d3/d3Renderer.js';

async function loadGraph() {
    const response = await fetch('../pages/graph.json');

    if (!response.ok) {
        throw new Error(`Failed to load graph.json: ${response.status}`);
    }

    const elkData = await response.json();

    const d3Data = adaptForD3(elkData);

    renderGraph(d3Data, '#graph');
}

loadGraph().catch(error => {
    console.error('Failed to load graph:', error);
});
