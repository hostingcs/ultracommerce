import type { ModuleDescriptor } from "@ultra/api-contracts";

export class ModuleRegistry {
  private readonly modules = new Map<ModuleDescriptor["name"], ModuleDescriptor>();

  register(moduleDescriptor: ModuleDescriptor): void {
    this.modules.set(moduleDescriptor.name, moduleDescriptor);
  }

  getAll(): ModuleDescriptor[] {
    return [...this.modules.values()];
  }

  getByName(name: ModuleDescriptor["name"]): ModuleDescriptor | undefined {
    return this.modules.get(name);
  }
}
