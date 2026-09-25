import { AlterState } from './interactions.js';

export class EngineManager {

    constructor(root, nodes, edges) {

        this.state =
            new AlterState(
                root,
                nodes,
                edges
            );

        this.stateChangeListeners = [];
    }


    // ==================================================
    // Renderer / Mediator subscription
    // ==================================================

    onStateChange(callback) {

        this.stateChangeListeners.push(
            callback
        );
    }


    emitStateChange(changes) {

	if (!changes) {
            return;
	}

	if (
            Array.isArray(changes) &&
		changes.length === 0
	) {
            return;
	}

	for (
            const callback of
            this.stateChangeListeners
	) {

            callback(changes);
	}
    }


    // ==================================================
    // Operations
    // ==================================================

    moveNode(
        nodeId,
        x,
        y
    ) {

        const changes =
              this.state.moveNode(
                  nodeId,
                  x,
                  y
              );

        this.emitStateChange(
            changes
        );
    }


    moveEdge(
        edgeId,
        x1,
        y1,
        x2,
        y2
    ) {

        const changes =
              this.state.moveEdge(
                  edgeId,
                  x1,
                  y1,
                  x2,
                  y2
              );

        this.emitStateChange(
            changes
        );
    }


    setEdgeAttachment(
        edgeId,
        nodeId,
        attachment
    ) {

        const changes =
              this.state.setEdgeAttachment(
                  edgeId,
                  nodeId,
                  attachment
              );

        this.emitStateChange(
            changes
        );
    }


    // ==================================================
    // History
    // ==================================================

    undo() {

        const changes =
              this.state.undo();

        this.emitStateChange(
            changes
        );
    }


    redo() {

        const changes =
              this.state.redo();

        this.emitStateChange(
            changes
        );
    }

    reset() {

	const changes =
	      this.state.reset();
	console.log(changes);

	this.emitStateChange(
	    changes
	);
    }
}
