import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGraph } from './engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const data = JSON.parse(
    fs.readFileSync(
        path.join(projectRoot, 'sampledata.json'),
        'utf8'
    )
);

const links = JSON.parse(
    fs.readFileSync(
        path.join(projectRoot, 'samplelinks.json'),
        'utf8'
    )
);

const graph = createGraph(
    data,
    links,
    'workspace_246'
);

const outputPath = path.join(
    projectRoot,
    'output',
    'graph-js.json'
);

fs.writeFileSync(
    outputPath,
    JSON.stringify(graph, null, 2)
);

console.log(`Wrote ${outputPath}`);
