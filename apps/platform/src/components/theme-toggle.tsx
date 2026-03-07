"use client";

import { useTheme } from "next-themes";

import { Button } from "@ultra/ui";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";

  return <Button onClick={() => setTheme(nextTheme)}>Theme: {nextTheme}</Button>;
}
