import type { ModuleName } from "@ultra/api-contracts";

export type DomainEventName =
  | "catalog.product.published"
  | "cart.updated"
  | "checkout.validated"
  | "order.placed"
  | "order.refunded"
  | "payment.captured"
  | "payment.failed"
  | "cms.post.published"
  | "analytics.snapshot.generated"
  | "audit.log.created";

export type DomainEvent<TPayload = Record<string, unknown>> = {
  id: string;
  name: DomainEventName;
  module: ModuleName;
  payload: TPayload;
  occurredAt: string;
};

export type DomainEventHandler = (
  event: DomainEvent,
) => Promise<void> | void;

export class DomainEventBus {
  private readonly handlers = new Map<DomainEventName, DomainEventHandler[]>();

  subscribe(name: DomainEventName, handler: DomainEventHandler): void {
    const existing = this.handlers.get(name) ?? [];
    existing.push(handler);
    this.handlers.set(name, existing);
  }

  unsubscribe(name: DomainEventName, handler: DomainEventHandler): void {
    const existing = this.handlers.get(name) ?? [];
    this.handlers.set(
      name,
      existing.filter((h) => h !== handler),
    );
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];
    await Promise.allSettled(handlers.map((handler) => Promise.resolve(handler(event))));
  }
}

export function createDomainEvent<TPayload>(
  module: ModuleName,
  name: DomainEventName,
  payload: TPayload,
): DomainEvent<TPayload> {
  return {
    id: crypto.randomUUID(),
    name,
    module,
    payload,
    occurredAt: new Date().toISOString(),
  };
}
