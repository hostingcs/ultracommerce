import { getAppConfig, getUltraConfig } from "@ultra/core";
import { getPlatformHealth, getPlugins } from "@ultra/modules";

let running = true;

function handleShutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  running = false;
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

async function run(): Promise<void> {
  const config = getUltraConfig();
  const appConfig = getAppConfig();
  const health = await getPlatformHealth();
  const plugins = getPlugins();

  console.log(
    JSON.stringify(
      {
        service: "ultra-worker",
        appName: appConfig.appName,
        startedAt: new Date().toISOString(),
        environment: config.NODE_ENV,
        plugins: plugins.map((plugin) => plugin.key),
        health,
      },
      null,
      2,
    ),
  );

  const POLL_INTERVAL_MS = 5_000;

  while (running) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  console.log("Worker shutdown complete.");
}

run().catch((error) => {
  console.error("Worker crashed:", error);
  process.exit(1);
});
