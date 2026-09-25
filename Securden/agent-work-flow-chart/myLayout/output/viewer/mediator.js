export class Mediator {

    constructor(renderer, engineManager) {

        this.renderer = renderer;
        this.engine = engineManager;

        this.connectRenderer();
        this.connectEngine();
    }

    connectRenderer() {

        this.renderer.onNodeMove(
            (nodeId, x, y) => {

                this.engine.moveNode(
                    nodeId,
                    x,
                    y
                );
            }
        );

        this.renderer.onEdgeMove(
            (edgeId, x, y) => {

                this.engine.moveEdge(
                    edgeId,
                    x,
                    y
                );
            }
        );

        this.renderer.onEdgeAttachment(
            (edgeId, nodeId, attachment) => {

                this.engine.setEdgeAttachment(
                    edgeId,
                    nodeId,
                    attachment
                );
            }
        );

	this.renderer.onUndo(
            () => {

		this.engine.undo();
            }
	);

	this.renderer.onRedo(
            () => {

		this.engine.redo();
            }
	);

	this.renderer.onReset(
	    () => {
		this.engine.reset();
	    }
	);
    }

    connectEngine() {

        this.engine.onStateChange(
            changes => {

		if (changes.type === 'reset') {
		    this.renderer.applyReset(changes.nodes, changes.edges);
		    return;
		}

                this.renderer.applyChanges(
                    changes
                );
            }
        );
    }
}
