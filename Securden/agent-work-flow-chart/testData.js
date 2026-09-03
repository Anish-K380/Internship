const companyData = {
  company: {
    id: "acme",
    name: "Acme Support"
  },

  agents: [
    {
      id: "agent-support",
      name: "Customer Support Agent",
      model: "gpt-5",
      description: "Handles incoming customer support requests",
      tools: [
        "tool-search-kb",
        "tool-create-ticket"
      ],
      workflows: [
        "workflow-support"
      ]
    },

    {
      id: "agent-sales",
      name: "Sales Assistant",
      model: "gpt-5",
      description: "Helps sales representatives research customers",
      tools: [
        "tool-crm-search"
      ],
      workflows: [
        "workflow-sales"
      ]
    }
  ],

  tools: [
    {
      id: "tool-search-kb",
      name: "Knowledge Base Search",
      type: "search",
      description: "Searches the company's knowledge base"
    },

    {
      id: "tool-create-ticket",
      name: "Create Support Ticket",
      type: "action",
      description: "Creates a support ticket"
    },

    {
      id: "tool-crm-search",
      name: "CRM Search",
      type: "search",
      description: "Searches customer information"
    }
  ],

  workflows: [
    {
      id: "workflow-support",
      name: "Customer Support Workflow",
      steps: [
        {
          id: "step-receive",
          type: "input",
          name: "Receive Customer Request"
        },
        {
          id: "step-search",
          type: "tool",
          tool: "tool-search-kb"
        },
        {
          id: "step-agent",
          type: "agent",
          agent: "agent-support"
        },
        {
          id: "step-ticket",
          type: "tool",
          tool: "tool-create-ticket"
        }
      ]
    },

    {
      id: "workflow-sales",
      name: "Sales Research Workflow",
      steps: [
        {
          id: "step-customer",
          type: "input",
          name: "Customer Name"
        },
        {
          id: "step-crm",
          type: "tool",
          tool: "tool-crm-search"
        },
        {
          id: "step-sales-agent",
          type: "agent",
          agent: "agent-sales"
        }
      ]
    }
  ]
};
