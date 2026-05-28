# @teselagen/ove-three

Experimental Three.js rendering package for OVE-compatible sequence data.

This package is initialized as a separate rendering layer and does not replace the existing SVG-based OVE views.

## Scope

`packages/ove-three` is maintained as a standalone rendering package. It should keep its demo, fixtures, debug tools, Cypress checks, and performance notes inside this package so it can later move to its own repository.

Current work should not modify `packages/ove`. Treat the existing OVE SVG views as read-only references for behavior and visual comparison.

## Local Commands

Run the standalone demo:

```bash
yarn nx run ove-three:start
```

Run the unit tests:

```bash
yarn nx run ove-three:test
```

Run the standalone Cypress checks:

```bash
yarn nx run ove-three:e2e
```

Build the package:

```bash
yarn nx run ove-three:build
```

## Demo Verification

The demo lets you switch fixtures and views without depending on the OVE app shell.

- Use `Fixture` to check small, dense, huge row, and 200k row data.
- Use `View` to switch Circular, Linear, and Row renderers.
- Use `Label boxes`, `Pick debug`, `Pointer position`, `Search hits`, and `Codon display` for targeted debugging.
- Use `Export PNG` to confirm the visible WebGL canvas can be exported.

## Manual Checks

Start the demo with `yarn nx run ove-three:start`, then use the right panel:

- Circular: drag to rotate, click features, and right-click a feature, primer, and cutsite.
- Linear: switch to `Linear` and confirm the map fills most of the canvas.
- Row: switch to `Row`, scroll rows, enable `Search hits`, and verify text stays readable.
- Dense: select `dense_annotations_fixture`, enable `Label boxes`, and check label overlap.
- Stress: select `huge_row_fixture` or `row_200k_fixture` and keep the 30 FPS target in mind.
- Export: click `Export PNG` and confirm the status changes to `KB ready`.

## Debug And Performance

The renderer exposes scene stats such as FPS, draw calls, objects, triangles, geometries, and textures. Cypress also reads a canvas test registry for annotation positions, labels, selection state, and fixture changes.

Debug-only tools such as Leva or Spector.js should not be added to runtime dependencies unless the reason is documented first.
