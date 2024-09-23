import "./global.css";
import type { Metadata } from "next";
import { styled } from "../../styled-system/jsx";
import { fonts } from "@/utils/fonts";

export const metadata: Metadata = {
  title: "Simple ChatGPT UI",
  description: "Barebones UI for using ChatGPT.",
};

const Body = styled("body", {
  base: {
    backgroundColor: "amber.50",
    fontSize: "lg",
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={fonts.aleo.className}>
      <Body>{children}</Body>
    </html>
  );
}
