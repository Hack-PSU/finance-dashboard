import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SideNavbar from "../components/Menu/Menu";
import { LayoutProvider } from "@/common/context";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material";
import theme from "@/theme";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <SideNavbar />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
