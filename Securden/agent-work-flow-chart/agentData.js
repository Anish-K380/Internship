export function graphData(agentID, nodeManager) {
    const nodes = new Set();
    const edges = {
	[agentID]: new Set()
    };
    
    const agent = nodeManager.nodes[agentID];
    nodes.add(agentID);

    const tools = new Set();
    for (const tool of agent.tools) {
	tools.add(tool);
	nodes.add(tool);
    }

    for (const workflowID of agent.workflows) {
	nodes.add(workflowID);
	const workflow = nodeManager.nodes[workflowID];
	edges[agentID].add(workflowID);
	edges[workflowID] = new Set();

	for (const step of workflow.workflows) {
	    if (step.type === "agent") {
		if (step.agent === agentID) {
		    continue;
		}
		nodes.add(step.agent);
		edges[workflowID].add(step.agent);
	    }
	    if (step.type === "tool") {
		edges[workflowID].add(step.tool);
		if (tools.has(step.tool)) {
		    tools.delete(step.tool);
		}
	    }
	}
	if (edges[workflowID].size === 0) {
	    delete edges[workflowID];
	}
    }

    for (const tool of tools) {
	edges[agentID].add(tool);
    }
    return { nodes, edges };
}
