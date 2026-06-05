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

- The top editor shell contains a menu bar, toolbar, panel tabs, and status bar.
- Use `Fixture` to check small, dense, huge row, and 200k row data.
- Use `View` to switch Circular, Linear, and Row renderers.
- Circular and Linear editor tabs show a linked Sequence Map beside the primary map. Clicking a feature in either primary map should highlight the same sequence range in the Sequence Map.
- Use `Circular Map` controls to test zoom, rotation, axis visibility, axis numbers, the minimap prototype, and zoomed sequence preview.
- Use `Linear Map` controls to test fit and zoom behavior.
- Use `Sequence Map` controls to test row case, reverse display, 5'/3' hints, base colors, base spacing, amino acid color mode, row jump, warnings, and chromatogram smoke layers.
- Use `Label boxes`, `Pick debug`, `Pointer position`, `Search hits`, and `Codon display` for targeted debugging.
- Use `Performance stats` to show or hide FPS, draw calls, object count, triangle count, geometry count, and texture count in the active Three.js views.
- Use `Annotations to support`, `Part tags`, and `Layers > Show All / Hide All` to verify View Options behavior.
- Use `Export PNG` to confirm the visible WebGL canvas can be exported.

## Manual Checks

Start the demo with `yarn nx run ove-three:start`, then use the right panel:

- Circular: drag to rotate, click features, and right-click a feature, primer, and cutsite.
- Linked views: in `Circular Map`, click GFP or MCS and confirm the Sequence Map highlights the same range; switch to `Linear Map` and repeat on a feature bar.
- Linear: switch to `Linear` and confirm the map fills most of the canvas without covering the linked Sequence Map.
- Row: switch to `Row`, scroll rows, try lowercase/reverse/5'/3'/base color controls, and verify text stays readable.
- Row options: click `Jump End` and `Jump Start`, then enable `Warnings` and `Chromatogram`.
- View options: choose `Features + primers`, toggle `Part tags`, then use `Show All` and `Hide All`.
- Dense: select `dense_annotations_fixture`, enable `Label boxes`, and check label overlap.
- Stress: select `huge_row_fixture` or `row_200k_fixture` and keep the 30 FPS target in mind.
- Export: click `Export PNG` and confirm the status changes to `KB ready`.

## Parity Tracking

The Day 200+ OVE parity tracker is kept in `packages/ove-three/docs/parity-matrix.md`.
The Day 396-420 release readiness checklist is kept in `packages/ove-three/docs/release-readiness.md`.
The unfinished 100% SVG OVE parity backlog is kept in `packages/ove-three/docs/full-svg-ove-parity-backlog.md`.
The user-facing interaction and terminology guide is kept in `packages/ove-three/docs/interaction-guide.md`.
The current completion audit, code review notes, and release summary are kept in `packages/ove-three/docs/completion-audit.md`, `packages/ove-three/docs/code-review.md`, and `packages/ove-three/docs/release-notes.md`.

## Debug And Performance

The renderer exposes scene stats such as FPS, draw calls, objects, triangles, geometries, and textures. Cypress also reads a canvas test registry for annotation positions, labels, selection state, and fixture changes.
Release performance budgets are defined in `src/perf/performanceBudgets.js`.

Debug-only tools such as Leva or Spector.js should not be added to runtime dependencies unless the reason is documented first.
