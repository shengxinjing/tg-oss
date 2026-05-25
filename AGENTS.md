# AGENTS.md

## Communication

- 如果用户用中文提问，先把问题翻译成英文，再用中英双语回复。
- Final responses should explain results in plain language first, then mention important verification.
- Avoid jargon in user-facing summaries unless the user asks for technical depth.

## Project Goal

Current near-term goal: build a two-week Three.js rendering-layer MVP for a 3D Gene Editor.

The intended package is:

```text
packages/ove-three
```

This package should render OVE-compatible `sequenceData` with Three.js / React Three Fiber.

## Required Skill Workflow

Use these skills as the default development pipeline for this project. Do not treat skills as optional when the task matches them.

### 1. Requirement Discovery

Use:

- `brainstorming`

When:

- The request is new, broad, visual, product-facing, or unclear.
- The work changes behavior or architecture.

Purpose:

- Clarify goal, non-goals, acceptance criteria, and risk before coding.

### 2. Implementation Planning

Use:

- `writing-plans`

When:

- The task needs more than one or two code changes.
- The task touches `packages/ove-three`, rendering, state sync, performance, or tests.

Purpose:

- Break work into small executable tasks with files, commands, and expected verification.

### 3. Feature Or Bug Implementation

Use:

- `test-driven-development`

When:

- Adding a new feature, fixing a bug, or changing render/data behavior.

Purpose:

- Define the proof first, then write implementation.
- For visual features, the "test" may be a focused demo plus screenshot/browser verification when unit tests are not enough.

### 4. Debugging

Use:

- `systematic-debugging`

When:

- A test fails, a visual result is blank/wrong, performance drops, picking is inaccurate, or behavior is surprising.

Purpose:

- Find root cause before changing code.

### 5. Frontend And Visual Work

Use:

- `frontend-design`
- `qa`
- `browse` or browser verification tools when available

When:

- Building or changing UI, layouts, Three.js scenes, canvas interaction, labels, side panels, or responsive behavior.

Purpose:

- Verify the feature in the browser, not just in code.

### 6. Three.js Work

Use these newly installed Three.js skills when relevant:

- `threejs-fundamentals`
- `threejs-geometry`
- `threejs-interaction`
- `threejs-materials`
- `threejs-shaders`

When:

- `threejs-fundamentals`: scene, camera, renderer, animation loop, controls.
- `threejs-geometry`: backbone, feature arcs, tubes, ribbons, markers, instancing.
- `threejs-interaction`: raycasting, hover, click, selection, pointer events.
- `threejs-materials`: colors, lighting, transparency, emissive effects, visual style.
- `threejs-shaders`: only when built-in materials are not enough or performance requires custom GPU work.

Avoid `threejs-animation` for the MVP unless the task explicitly needs animation polish.

### 7. Completion Verification

Use:

- `verification-before-completion`

When:

- Before saying a task is done.

Purpose:

- Run the right checks, inspect browser output for visual work, and report what was verified.

### 8. Review

Use:

- `requesting-code-review`

When:

- After major changes, before merging, or after a rendering/performance milestone.

Purpose:

- Catch regressions, hidden risks, missing tests, and over-engineering.

## Standard Development Loop

For every non-trivial task, follow this order:

```text
brainstorming
-> writing-plans
-> test-driven-development
-> implement
-> systematic-debugging if anything fails
-> frontend-design / qa / browse for visual work
-> verification-before-completion
-> requesting-code-review for major changes
```

For tiny tasks, keep it lighter, but still verify before reporting done.

## Karpathy-Style Agent Guardrails

These rules are adapted from the `multica-ai/andrej-karpathy-skills` guidelines. They are useful for this repo because the Three.js rewrite can easily drift into guessing, over-building, or touching unrelated OVE code.

### Think Before Coding

- Do not guess silently.
- State assumptions when the request has more than one reasonable meaning.
- Ask only when the missing answer changes the implementation materially.
- If a simpler path exists, say it before taking the more complex path.

### Simplicity First

- Write the smallest change that solves the current request.
- Do not add options, abstractions, helpers, feature flags, or fallback paths for hypothetical future needs.
- If a change starts getting large, re-check whether a smaller demo or proof is the right next step.
- For `packages/ove-three`, prefer a focused working demo over a broad unfinished framework.

### Surgical Changes

- Touch only files directly needed for the task.
- Do not refactor, reformat, rename, or clean up nearby code unless the task requires it.
- Match the existing style even if a different style would be nicer.
- Remove only unused code created by the current change.
- Mention unrelated issues in the final response instead of fixing them silently.

### Goal-Driven Execution

- Define finishing criteria before implementation.
- For each meaningful step, know how it will be checked.
- For rendering work, include browser or screenshot verification whenever practical.
- Do not report success until the relevant install, build, test, demo, or browser check has actually run.

## Three.js MVP Skill Preset

For `packages/ove-three` work, assume this default skill set:

```text
brainstorming
writing-plans
test-driven-development
frontend-design
threejs-fundamentals
threejs-geometry
threejs-interaction
threejs-materials
qa
verification-before-completion
requesting-code-review
```

Add `threejs-shaders` only when custom shaders are actually needed.

## Hard Scope Rules

- Do not delete existing `packages/ove` SVG rendering code.
- Do not rewrite `CircularView`, `LinearView`, or `RowView` as part of the first MVP.
- Do not move existing OVE files into the new package.
- Do not replace OVE Redux.
- Do not add AI assistant, backend jobs, import/export rewrite, or full protein structure viewer in the first MVP.
- The first MVP is render-only plus hover/click selection. It is not a production replacement.

## Architecture Rules

- Keep biological logic in existing packages:
  - `@teselagen/range-utils`
  - `@teselagen/sequence-utils`
  - `@teselagen/bio-parsers`
- Keep Three.js rendering logic inside `packages/ove-three`.
- Communicate with OVE or app shell through props and callbacks.
- Every pickable Three.js object must map back to a sequence range using `object.userData`.
- Preserve OVE coordinate semantics: 0-based inclusive ranges, circular ranges may span origin with `start > end`.

## Preferred Dependencies For `packages/ove-three`

Start minimal:

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `zustand`
- `stats-gl`

Add later only when needed:

- `three-mesh-bvh`
- `@react-three/postprocessing`
- `troika-three-text`
- `leva`

Avoid in the first MVP:

- physics engines
- AI SDKs
- Radix/Tailwind UI rewrite
- Mol\* or full molecular structure viewer

## Required Demos

The MVP should include or support these demos:

1. Circular backbone demo: 2.7k and 5k bp.
2. Feature segment demo: colored promoter/CDS/tag/ori/MCS regions.
3. Label demo: 20, 50, and 100 labels.
4. Picking demo: hover and click feature objects.
5. Stress demo: 2.7k, 5k, and 50k bp datasets.

## Performance Metrics

Record:

- FPS
- first render time
- memory usage
- object count
- draw calls
- geometry rebuild count
- raycast latency

Targets:

- 2.7k bp: 60 FPS.
- 5k bp: 50+ FPS.
- 50k bp: 30+ FPS and no crash.
- Hover/click should feel immediate; aim for under 50ms raycast response.

## Development Style

- Keep changes small and directly tied to the two-week MVP.
- Prefer simple JS/React files unless the package already establishes TypeScript patterns.
- Do not introduce broad abstractions before the first demo proves performance.
- Use `rg` for searching.
- Use `apply_patch` for manual file edits.
- Do not run destructive commands.
- Work with existing uncommitted files; do not revert user changes.

## Verification Before Reporting Done

Before claiming completion:

- Inspect `git status --short`.
- Confirm `packages/ove` was not deleted or heavily changed.
- Confirm `packages/ove-three` can start its demo.
- Confirm required demos or placeholders are documented.
- Confirm performance results are recorded if performance work was done.
- If visual work is implemented, inspect it in a browser and take screenshots when possible.

## Key Reference Document

Use this as the main project plan:

```text
THREEJS_TWO_WEEK_MASTER_PLAN.md
```
