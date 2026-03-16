import "./global.css";
import type { Metadata } from "next";
import { styled } from "../../styled-system/jsx";
import { Providers } from "./Providers";
import { fonts } from "@/lib/utils/fonts";
import type { ReactNode } from "react";

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  title: "Simple ChatGPT UI",
  description: "Barebones UI for using ChatGPT.",
};

const Body = styled("body", {
  base: {
    fontSize: "lg",

    backgroundColor: "amber.50",
    _dark: {
      backgroundColor: "gray.900",
      color: "gray.50",
    },
  },
});

const themeInitializerScript = `
(() => {
  const storageKey = "darkMode";
  let isDarkMode = false;

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (storedValue === null) {
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDarkMode = JSON.parse(storedValue);
    }
  } catch {
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.documentElement.classList.toggle("dark", isDarkMode);
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={fonts.aleo.className} lang="en" suppressHydrationWarning>
      <head>
        {/* oxlint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <Body>
        <Providers>{children}</Providers>
      </Body>
    </html>
  );
}
