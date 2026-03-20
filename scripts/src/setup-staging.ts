import { spawnSync } from "node:child_process";

function runStep(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to prepare staging.");
  }

  console.log("🚀 Preparing RenoPack staging database...");
  runStep("pnpm", ["--filter", "@workspace/db", "push"]);
  runStep("pnpm", ["--filter", "@workspace/scripts", "seed"]);
  console.log("✅ RenoPack staging is ready.");
}

try {
  main();
} catch (error) {
  console.error("❌ Staging preparation failed:", error);
  process.exit(1);
}
