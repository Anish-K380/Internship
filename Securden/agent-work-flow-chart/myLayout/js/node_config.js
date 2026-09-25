export class Node {
    constructor() {
        this.width = 220;
        this.height = 78;
    }
}

export class WorkspaceNode extends Node {
    constructor() {
        super();
        this.width = 250;
        this.height = 86;
    }
}

export class AgentNode extends Node {
    constructor() {
        super();
        this.width = 250;
        this.height = 92;
    }
}

export class AccessIdentityNode extends Node {}
export class ToolNode extends Node {}

export const nodeType = {
    default: new Node(),
    workspace: new WorkspaceNode(),
    agent: new AgentNode(),
    access_identity: new AccessIdentityNode(),
    tool: new ToolNode(),
};
