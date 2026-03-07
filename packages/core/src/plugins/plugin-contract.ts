import type { ModuleDescriptor, PluginDescriptor } from "@ultra/api-contracts";

import type { DomainEventBus } from "../events/domain-events";

export type PluginContext = {
  env: Record<string, string | undefined>;
  modules: ModuleDescriptor[];
  eventBus: DomainEventBus;
};

export type PluginRouteDefinition = {
  path: string;
  summary: string;
};

export type PluginAdminExtension = {
  path: string;
  title: string;
  summary: string;
};

export type UltraPlugin = PluginDescriptor & {
  register(context: PluginContext): void | Promise<void>;
  adminExtensions?: PluginAdminExtension[];
  eventSubscriptions?: string[];
  storeRoutes?: PluginRouteDefinition[];
};

export function definePlugin(plugin: UltraPlugin): UltraPlugin {
  return plugin;
}

export class PluginRegistry {
  private readonly plugins: UltraPlugin[] = [];

  register(plugin: UltraPlugin): void {
    this.plugins.push(plugin);
  }

  list(): UltraPlugin[] {
    return [...this.plugins];
  }

  async initialize(context: PluginContext): Promise<void> {
    for (const plugin of this.plugins) {
      try {
        await plugin.register(context);
      } catch (error) {
        console.error(`Plugin "${plugin.key}" failed to initialize:`, error);
      }
    }
  }
}
