import { createGraph } from '../../js/engine.js';
import { renderGraph } from '../d3Renderer.js';
import { EngineManager } from '../../js/engineManager.js';
import { Mediator } from './mediator.js';

export class GraphManager {

    constructor() {
        this.icons = new Map();
    }


    async start() {

        // ==================================================
        // Load graph data
        // ==================================================

        const data =
            await fetch('../sampledata.json')
            .then(response => response.json());


        const links =
            await fetch('../samplelinks.json')
            .then(response => response.json());


        // ==================================================
        // Create graph
        // ==================================================

        const graph =
            createGraph(
                data,
                links,
                'workspace_246'
            );


        // ==================================================
        // Load node icons
        // ==================================================

        for (
            const node of Object.values(graph.nodes)
        ) {

            node.icon =
                await this.loadIcon(node.type);
        }


        // ==================================================
        // Engine manager
        // ==================================================

        const engineManager =
            new EngineManager(
                graph.root,
                graph.nodes,
                graph.edges
            );

        // ==================================================
        // Renderer
        // ==================================================

        const renderer =
            renderGraph(
                graph,
                '#graph'
            );

        // ==================================================
        // Mediator
        // ==================================================

        const mediator =
            new Mediator(
                renderer,
                engineManager
            );
    }


    // ======================================================
    // Icon loading
    // ======================================================

    async loadIcon(type) {

        if (this.icons.has(type)) {
            return this.icons.get(type);
        }


        const iconPath =
            `./icons/${type}.svg`;


        const promise =
            fetch(iconPath)
            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        `Failed to load icon: ${type}`
                    );
                }

                return iconPath;
            });


        this.icons.set(type, promise);

        return promise;
    }
}
