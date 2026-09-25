# JavaScript Layout Engine

This is a direct JavaScript port of the Python layout engine.

The algorithm is intentionally kept close to the Python implementation:

1. Prepare node dimensions.
2. Build the parent/child adjacency structure.
3. Classify nodes and construct grouped rows.
4. Calculate subtree heights.
5. Calculate relative and absolute Y positions.
6. Calculate relative and absolute X positions.
7. Convert center coordinates to top-left node coordinates.
8. Generate Bézier edge geometry.
9. Calculate graph dimensions.
10. Write the renderer-ready graph JSON.

## Run

From this directory:

```bash
node main.js
```

It reads:

- `../sampledata.json`
- `../samplelinks.json`

and writes:

- `../output/graph-js.json`

The D3 renderer can consume that output using the same graph structure as the Python engine.
