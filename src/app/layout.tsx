import "./global.css";
import type { Metadata } from "next";
import { Aleo } from "next/font/google";
import { styled } from "../../styled-system/jsx";

const nextFont = Aleo({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simple ChatGPT UI",
  description: "Barebones UI for using ChatGPT.",
};

const Body = styled("body", {
  base: {
    backgroundColor: "amber.50",
    fontSize: "sm",
    md: {
      fontSize: "lg",
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={nextFont.className}>
      <Body>{children}</Body>
    </html>
  );
}
