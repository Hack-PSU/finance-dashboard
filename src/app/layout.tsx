import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SideNavbar from "../components/Menu/Menu";
import { LayoutProvider } from "@/common/context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HackPSU Finance Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <LayoutProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SideNavbar />
          {children}
        </body>
      </LayoutProvider>
    </html>
  );
}
