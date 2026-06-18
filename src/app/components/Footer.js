"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const footerLinks = {
    Solutions: [
      { name: "Website Design", href: "/services/website-design" },
      { name: "Logo & Branding", href: "/services/branding" },
      { name: "SMM Strategy", href: "/services/smm-strategy" },
      { name: "Strategic SEO", href: "/services/seo-strategy" },
    ],

    Company: [
      { name: "About Us", href: "#" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Our Process", href: "/#process" },
      { name: "Contact", href: "/#contact" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Settings", href: "#" },
    ]
  };

  return (
    <footer className="pt-24 pb-12 px-6 md:px-20 border-t border-white/5 relative z-10 bg-[#030610] overflow-hidden">
      {/* Background Anchor Text */}
      <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-full font-sans-premium text-[18vw] font-black leading-none opacity-[0.02] pointer-events-none select-none z-0 whitespace-nowrap text-center">
        DIGNITEQ
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <div className="flex flex-col gap-8 text-center md:text-left items-center md:items-start">
             <Link href="/" className="flex items-center">
                <img 
                  src="/assets/logo-white.png" 
                  alt="Digniteq Logo" 
                  className="h-9 w-auto object-contain transition-all hover:brightness-125"
                />
             </Link>
             <p className="font-inter text-lg text-white/40 leading-relaxed max-w-sm">
               Engineering high-performance digital experiences for the next generation of global brands. Precision, elegance, and disruptive innovation.
             </p>
             <div className="flex gap-4">
                {[
                  { id: "IG", url: "https://www.instagram.com/digniteqdigital" },
                  { id: "FB", url: "https://www.facebook.com/DigniteqOfficial" },
                  { id: "TW", url: "https://twitter.com/digniteqdigital" }
                ].map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-sm font-black hover:bg-white hover:text-[#030610] transition-all">
                    {s.id}
                  </a>
                ))}
             </div>
          </div>

          {/* Solutions Column */}
          <div className="flex flex-col gap-6 text-center md:text-left">
             <h4 className="font-sans-premium text-sm font-black tracking-[0.3em] uppercase text-blue-500">Solutions</h4>
             <ul className="flex flex-col gap-4">
                {footerLinks.Solutions.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="font-sans-premium text-base font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest">{link.name}</Link>
                  </li>
                ))}
             </ul>
          </div>

          {/* Company Column */}
          <div className="flex flex-col gap-6 text-center md:text-left">
             <h4 className="font-sans-premium text-sm font-black tracking-[0.3em] uppercase text-blue-500">Company</h4>
             <ul className="flex flex-col gap-4">
                {footerLinks.Company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="font-sans-premium text-base font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest">{link.name}</Link>
                  </li>
                ))}
             </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-6 text-center md:text-left">
             <h4 className="font-sans-premium text-sm font-black tracking-[0.3em] uppercase text-blue-500">Inquiries</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="font-sans-premium text-sm font-black text-white/60 uppercase tracking-widest mb-1">Direct Contact</div>
                  <p className="font-inter text-base text-white/30 leading-relaxed hover:text-blue-400 transition-colors cursor-pointer">+91 6205318620</p>
                </div>
                <div>
                  <div className="font-sans-premium text-sm font-black text-white/60 uppercase tracking-widest mb-1">Social Channels</div>
                  <p className="font-inter text-sm text-white/30 leading-relaxed uppercase tracking-widest">
                    IG: @digniteqdigital <br />
                    FB: Digniteq - Official <br />
                    Twitter: digniteqdigital
                  </p>
                </div>
                <div>
                  <div className="font-sans-premium text-sm font-black text-white/60 uppercase tracking-widest mb-1">Global Support</div>
                  <p className="font-inter text-base text-white/30 leading-relaxed underline hover:text-blue-400 cursor-pointer">info@digniteq.in</p>
                </div>
              </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm font-bold text-white/20 uppercase tracking-[0.2em] font-sans-premium">
              {footerLinks.Legal.map((link) => (
                <a key={link.name} href={link.href} className="hover:text-blue-500 transition-colors">{link.name}</a>
              ))}
           </div>

           <p className="font-sans-premium text-sm text-white/20 uppercase tracking-[0.2em]">
              DIGNITEQ. BORN FROM EXCELLENCE.
           </p>
        </div>
      </div>
    </footer>
  );
}
