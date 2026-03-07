"use client";

import type { PropsWithChildren } from "react";

import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "light"]}
    >
      {children}
    </NextThemeProvider>
  );
}
