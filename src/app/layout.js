import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteShell from "@/components/SiteShell";

export default function RootLayout({ children }) {
  return <html lang="en"><body className="antialiased min-h-screen bg-white">
    <SiteShell header={<Header />} footer={<Footer />}>{children}</SiteShell>
  </body></html>;
}
