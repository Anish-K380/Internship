import fs from 'fs';
import { JSDOM } from 'jsdom';

import { elkfy } from '../ELK/elkManager.js';
import { prepData } from '../preData/preManager.js';
import { d3Manager } from '../d3/d3Manager.js';

const objects = JSON.parse(
    fs.readFileSync('./sampledata.json', 'utf8')
);

const links = JSON.parse(
    fs.readFileSync('./samplelinks.json', 'utf8')
);

const [nodeData, edgeData] = prepData('workspace_246', objects, links);

const elkData = await elkfy(nodeData, edgeData);

console.dir(elkData, { depth: null });

// Load index.html into JSDOM
const html = fs.readFileSync('../pages/index.html', 'utf8');
const dom = new JSDOM(html);

// Get the element where D3 should render
const graphElement = dom.window.document.querySelector('#graph');

// Pass the element to D3
d3Manager(elkData, graphElement);

// Save the modified HTML
fs.writeFileSync(
    './index.html',
    dom.serialize()
);

console.log('Graph written to index.html');
