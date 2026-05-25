import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dir, "../../");

const projectRoot = process.argv[2];
const args = process.argv.slice(3).filter(arg => arg !== "{args}");

if (!projectRoot) {
  console.error("Project root is required");
  process.exit(1);
}

const fullProjectRoot = path.resolve(workspaceRoot, projectRoot);
const distDir = path.resolve(workspaceRoot, "dist", projectRoot);

console.info(`Building ${projectRoot}...`);

function run(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

fs.rmSync(distDir, { recursive: true, force: true });

try {
  console.info(`Running build for ${projectRoot}...`);
  run(
    "bun",
    ["vite", "build", "--config", "vite.config.ts", ...args],
    fullProjectRoot
  );
} catch (error) {
  console.error("Build failed");
  process.exit(1);
}

/**
 * 5. Update package dependencies
 * Skip if building in demo mode (no package.json to update)
 */
if (args.some(arg => arg.includes("mode=demo"))) {
  console.info("Demo build detected. Skipping dependency updates.");
  process.exit(0);
}

try {
  const updateDepsScript = path.resolve(
    workspaceRoot,
    "tools/scripts/updatePkgDeps.mjs"
  );
  console.info(`Updating dependencies...`);
  run("bun", [updateDepsScript, projectRoot], workspaceRoot);
} catch (error) {
  console.error("Dependency update failed");
  process.exit(1);
}
