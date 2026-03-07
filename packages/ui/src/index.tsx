import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
} from "react";

import { clsx } from "clsx";

export function AppShell({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={clsx("ultra-shell", className)} {...props}>
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <section className={clsx("ultra-card", className)} {...props}>
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ultra-page-header">
      <div>
        {eyebrow ? <p className="ultra-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="ultra-description">{description}</p>
      </div>
      {actions ? <div className="ultra-actions">{actions}</div> : null}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="ultra-grid ultra-grid-stats">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="ultra-muted">{item.label}</p>
          <strong className="ultra-stat">{item.value}</strong>
          {item.hint ? <p className="ultra-hint">{item.hint}</p> : null}
        </Card>
      ))}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="ultra-table-wrap">
      <table className="ultra-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0] ?? "row"}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: PropsWithChildren<{ tone?: "neutral" | "success" | "warning" }>) {
  return (
    <span className={clsx("ultra-badge", `ultra-badge-${tone}`)}>{children}</span>
  );
}

export function Button({
  children,
  className,
  type = "button",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button type={type} className={clsx("ultra-button", className)} {...props}>
      {children}
    </button>
  );
}
