import { getAppConfig, getUltraConfig } from "@ultra/core";
import { getPlatformHealth, getPlugins } from "@ultra/modules";

const POLL_INTERVAL_MS = 5_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopBackgroundRuntime(signal: string) {
  if (!globalThis.__ultraPlatformRuntimeRunning) {
    return;
  }

  console.log(`Received ${signal}, stopping baked-in background runtime...`);
  globalThis.__ultraPlatformRuntimeRunning = false;
}

async function runLoop(): Promise<void> {
  while (globalThis.__ultraPlatformRuntimeRunning) {
    await sleep(POLL_INTERVAL_MS);
  }

  console.log("Ultra background runtime stopped.");
}

async function bootstrapRuntime(): Promise<void> {
  const config = getUltraConfig();
  const appConfig = getAppConfig();
  const health = await getPlatformHealth();
  const plugins = getPlugins();

  console.log(
    JSON.stringify(
      {
        service: "ultra-platform",
        backgroundRuntime: "enabled",
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

  await runLoop();
}

export function startPlatformBackgroundRuntime(): void {
  if (globalThis.__ultraPlatformRuntimeStarted) {
    return;
  }

  globalThis.__ultraPlatformRuntimeStarted = true;
  globalThis.__ultraPlatformRuntimeRunning = true;

  process.on("SIGTERM", () => stopBackgroundRuntime("SIGTERM"));
  process.on("SIGINT", () => stopBackgroundRuntime("SIGINT"));

  void bootstrapRuntime().catch((error) => {
    console.error("Platform background runtime crashed:", error);
    globalThis.__ultraPlatformRuntimeRunning = false;
  });
}
