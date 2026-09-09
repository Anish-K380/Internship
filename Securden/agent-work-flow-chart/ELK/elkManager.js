import { datatoELK } from './dataToELK.js';
import { graphNumbers } from './elkProcessor.js';
import { graphData } from './elkToData.js';

export async function elkfy(prepnodes, prepedges) {
    const elkPrep = datatoELK(prepnodes, prepedges);

    const elkLayout = await graphNumbers(elkPrep.children, elkPrep.edges);
    console.dir(elkLayout, {depth: null});

    const elkPost = graphData(elkLayout);

    return elkPost;
}
