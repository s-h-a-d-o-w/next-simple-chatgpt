import "./global.css";
import type { Metadata } from "next";
import { styled } from "../../styled-system/jsx";
import { fonts } from "@/utils/fonts";
import { isDev } from "@/utils/consts";

if (!isDev) {
  const buildInfo = process.env.NEXT_PUBLIC_BUILD_INFO?.split(",");
  if (buildInfo) {
    console.log(
      new Date(parseInt(buildInfo[0], 10)).toLocaleString(),
      buildInfo[1],
    );
  }
}

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
    <html className={fonts.aleo.className} lang="en">
      <Body>{children}</Body>
    </html>
  );
}
