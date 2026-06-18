"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMounted) {
      setMobileMenuOpen(false);
    }
  }, [pathname, isMounted]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Website Design", href: "/services/website-design" },
    { name: "Logo & Branding", href: "/services/branding" },
    { name: "SMM Strategy", href: "/services/smm-strategy" },
    { name: "SEO Strategy", href: "/services/seo-strategy" },
    { name: "Portfolio", href: "/portfolio" },
  ];


  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-[1000] px-6 md:px-12 transition-all duration-500 ${
          isMounted && mobileMenuOpen ? "bg-[#030610] py-4" : 
          isMounted && scrolled ? "glass-nav py-3" : 
          "bg-[#030610]/80 backdrop-blur-md py-4 border-b border-white/5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex justify-between items-center relative z-[1001]">
          {/* Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <img 
              src="/assets/logo-white.png" 
              alt="Digniteq Logo" 
              className="h-7 md:h-8 w-auto object-contain transition-all group-hover:brightness-125"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex gap-10 items-center">
            {navLinks.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`font-sans-premium text-[11px] font-bold uppercase tracking-[0.25em] transition-colors ${
                  pathname === item.href ? "text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-6">


            {/* Hamburger Button */}
            <button 
              className="lg:hidden flex flex-col gap-1.5 justify-center items-center w-10 h-10 border border-white/10 rounded-xl transition-all active:scale-90"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[4px]" : ""}`}></span>
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0 translate-x-2" : ""}`}></span>
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[4px]" : ""}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-[#030610] z-[1000] lg:hidden transition-all duration-700 flex flex-col items-center justify-start pt-40 px-6 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}>
          <div className="flex flex-col items-center gap-8 md:gap-10 w-full max-w-sm text-center">
            {navLinks.map((item, i) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`font-sans-premium text-2xl font-black uppercase tracking-[0.2em] transition-all duration-500 transform w-full ${
                  mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {item.name}
              </Link>
            ))}

          </div>
        </div>
      </nav>
    </>
  );
}
