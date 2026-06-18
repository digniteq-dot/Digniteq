import { Inter, Outfit, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import GlobalBackground from "./components/GlobalBackground";
import ClientOnly from "./components/ClientOnly";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "DIGNITEQ | Premium Digital Agency",
  description: "Next-generation digital marketing and design solutions for world-class brands.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${bodoni.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-[#030610] text-white overflow-x-hidden" suppressHydrationWarning>
        <ClientOnly><GlobalBackground /><CustomCursor /></ClientOnly>
        <Navbar />

        <SmoothScroll>
          <main className="relative z-10">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
