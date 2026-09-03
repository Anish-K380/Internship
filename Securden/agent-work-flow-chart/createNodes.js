import { NodeManager } from "./NodesEdges.js";

export function makeNodes(data) {
    const nManager = new NodeManager();

    for (const agent of data.agents) {
	const desc = {
	    name: agent.name,
	    model: agent.model,
	    description: agent.description
	};
	nManager.addNode(agent.id, 'agent', desc, agent.workflows, agent.tools);
    }

    for (const workflow of data.workflows) {
	const desc = workflow.name;
	nManager.addNode(workflow.id, 'workflow', desc, workflow.steps);
    }

    for (const tool of data.tools) {
	const desc = {
	    name: tool.name,
	    type: tool.type,
	    description: tool.description
	};
	nManager.addNode(tool.id, 'tool', desc);
    }

    return nManager;
}
