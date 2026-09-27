"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingProvider } from "@/components/LoadingProvider";
import { DyslexicProvider } from "@/components/Dyslexic";
import Loader from "@/components/Loader"; // Import Loader
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideChrome =
    pathname?.startsWith("/resume/view/pdf") ||
    pathname?.startsWith("/resume/view/printout");
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen bg-white`}>
        {/* Loader splash always on top */}
        <LoadingProvider initialDelay={300} betweenDelay={200}>
          <DyslexicProvider>
            {!hideChrome && <Header />}
            {children}
            {!hideChrome && <Footer />}
          </DyslexicProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
