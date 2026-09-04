import { companyData } from "./testData.js";
import { makeNodes } from "./createNodes.js";
import { graphData } from "./agentData.js";
import { datatoELK } from "./dataToELK.js";
import { graphNumbers } from "./elkProcessor.js";

const nodeManager = makeNodes(companyData);

const graph = graphData("agent-support", nodeManager);

const elkGraph = datatoELK(graph.nodes, graph.edges);

const result = await graphNumbers(
    elkGraph.children,
    elkGraph.edges
);

console.log(result);

