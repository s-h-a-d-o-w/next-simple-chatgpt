import "./global.css";
// import "../../styled-system/styles.css";
import type { Metadata } from "next";
import Link from "next/link";
import { styled } from "../../styled-system/jsx";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const Navigation = styled("nav", {
  base: {
    display: "flex",
    width: "100%",
    justifyContent: "right",
    gap: "10px",
    padding: "20px 50px",
  },
});

const Whatever = styled(Navigation, {
  base: {
    gap: "20px",
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* <Whatever>
          <Link href="/">Home</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/about">About</Link>
        </Whatever> */}
        {children}
      </body>
    </html>
  );
}
