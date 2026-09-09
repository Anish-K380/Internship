import fs from 'fs';

import { elkfy } from './ELK/elkManager.js';
import { prepData } from './preData/preManager.js';

const objects = JSON.parse(
    fs.readFileSync('./test/sampledata.json', 'utf8')
);

const links = JSON.parse(
    fs.readFileSync('./test/samplelinks.json', 'utf8')
);

const [nodeData, edgeData] = prepData(
    'workspace_246',
    objects,
    links
);

const elkData = await elkfy(nodeData, edgeData);

fs.writeFileSync(
    './pages/graph.json',
    JSON.stringify(elkData, null, 2)
);

console.log('Graph data written to pages/graph.json');
