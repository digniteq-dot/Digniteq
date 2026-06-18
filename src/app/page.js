"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "./components/ContactForm";
import { apiFetch } from "./utils/api";

export default function Home() {
  const [hero, setHero] = useState({
    title: "DIGITAL",
    subtitle: "AGENCY",
    description: "We help you build your brand and find more customers online. We handle the digital stuff so you can focus on what you do best.",
    ctaText: "Get Free Consultation ➔",
    ctaLink: "https://wa.me/916205318620?text=Hello!%20I'd%20like%20to%20get%20a%20free%20consultation."
  });

  const [services, setServices] = useState([
    { title: "Modern Websites", desc: "Building beautiful sites that turn visitors into customers.", icon: "◈" },
    { title: "Brand & Design", desc: "Creating logos and styles that people remember.", icon: "⬢" },
    { title: "Social Media", desc: "Telling your story and building your community.", icon: "✧" },
    { title: "SEO (Ranking)", desc: "Helping you show up when customers search for you.", icon: "✦" }
  ]);

  const [stats, setStats] = useState([
    { label: "Active Clients", value: "50+", sub: "Trusted Partners" },
    { label: "Success Rate", value: "98%", sub: "Project Excellence" },
    { label: "ROI Average", value: "3.5x", sub: "Growth Driven" },
    { label: "Years Exp.", value: "02+", sub: "Digital Mastery" }
  ]);

  const [about, setAbout] = useState({
    title: "We Build Digital Legacies For Small Businesses",
    paragraph1: "Digniteq was born from a simple idea: that every business, no matter its size, deserves a world-class digital presence. We treat your business as our own.",
    paragraph2: "We combine creative design with smart technology to help you find more customers, build trust, and grow faster.",
    mission: "Making marketing simple & affordable for every business.",
    vision: "Empowering local brands to grow and thrive digitally.",
    yearsExp: "02+",
    happyClients: "50+"
  });

  const [portfolio, setPortfolio] = useState([
    { title: "Lumina", cat: "Web Architecture", desc: "A high-end architectural portfolio featuring pixel-perfect design and high-performance layouts.", img: "/assets/portfolio/web-design.png" },
    { title: "Vibe", cat: "SMM Strategy", desc: "Data-driven social media growth strategy focusing on lifestyle brands and audience engagement.", img: "/assets/portfolio/social-media.png" },
    { title: "Aura", cat: "Brand Identity", desc: "Complete brand redesign and visual identity system for premium fashion and lifestyle brands.", img: "/assets/portfolio/branding.png" },
    { title: "Ethos", cat: "Web Design", desc: "Minimalist and modern web design for digital-first companies seeking aesthetic excellence.", img: "/assets/portfolio/web-design.png" },
    { title: "Nexus", cat: "Growth Engine", desc: "Dominating search results and engineering market share through data-driven SEO strategies.", img: "/assets/portfolio/seo.png" }
  ]);

  const [processSteps, setProcessSteps] = useState([
    { step: "01", title: "Discovery", desc: "We learn about your business and goals." },
    { step: "02", title: "Planning", desc: "We create a simple roadmap for success." },
    { step: "03", title: "Building", desc: "We bring your vision to life." },
    { step: "04", title: "Growing", desc: "We help you scale and get more results." }
  ]);

  const [activeIndex, setActiveIndex] = useState(2);
  const [selectedProject, setSelectedProject] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    async function loadData() {
      try {
        const heroData = await apiFetch('/hero');
        if (heroData) setHero(heroData);
      } catch (e) { console.warn("Failed to load hero content from backend, using fallbacks."); }

      try {
        const servicesData = await apiFetch('/services');
        if (servicesData && servicesData.length > 0) {
          const sorted = servicesData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setServices(sorted.map(s => ({
            title: s.title,
            desc: s.description,
            icon: s.icon || "◈"
          })));
        }
      } catch (e) { console.warn("Failed to load services from backend, using fallbacks."); }

      try {
        const statsData = await apiFetch('/stats');
        if (statsData && statsData.length > 0) {
          const sorted = statsData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setStats(sorted);
        }
      } catch (e) { console.warn("Failed to load stats from backend, using fallbacks."); }

      try {
        const aboutData = await apiFetch('/about');
        if (aboutData) setAbout(aboutData);
      } catch (e) { console.warn("Failed to load about content from backend, using fallbacks."); }

      try {
        const portfolioData = await apiFetch('/portfolio');
        if (portfolioData && portfolioData.length > 0) {
          const sorted = portfolioData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setPortfolio(sorted);
        }
      } catch (e) { console.warn("Failed to load portfolio from backend, using fallbacks."); }

      try {
        const processData = await apiFetch('/process');
        if (processData && processData.length > 0) {
          const sorted = processData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setProcessSteps(sorted);
        }
      } catch (e) { console.warn("Failed to load process steps from backend, using fallbacks."); }
    }

    loadData();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = (idx) => {
    if (isMobile) {
      setSelectedProject(portfolio[idx]);
      return;
    }
    
    if (idx === activeIndex) {
      setSelectedProject(portfolio[idx]);
    } else {
      // Exchange positions with the center card
      const newPortfolio = [...portfolio];
      const temp = newPortfolio[activeIndex];
      newPortfolio[activeIndex] = newPortfolio[idx];
      newPortfolio[idx] = temp;
      
      setPortfolio(newPortfolio);
      
      // Open the project after a short delay for the swap animation
      setTimeout(() => {
        setSelectedProject(newPortfolio[activeIndex]);
      }, 600);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 50 && activeIndex < portfolio.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (distance < -50 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
    setTouchStart(null);
  };

  return (
    <div className="flex flex-col min-h-screen relative font-inter bg-transparent">
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen pt-32 pb-20 relative flex flex-col items-center justify-center overflow-hidden">
          
          {/* Background Text Layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
          </div>

          {/* Content Overlay */}
          <div className="relative z-30 w-full h-full flex flex-col items-center justify-center pointer-events-none select-none px-4">
            {/* Logical Metadata Tokens */}
            <div className="absolute top-32 left-6 hidden lg:block opacity-20 rotate-90 origin-left">
              <span className="font-sans-premium text-[8px] font-black tracking-[0.5em] uppercase text-white">SYS_CORE_V2.0 // 40.7128° N, 74.0060° W</span>
            </div>
            <div className="absolute bottom-32 right-6 hidden lg:block opacity-20 -rotate-90 origin-right">
              <span className="font-sans-premium text-[8px] font-black tracking-[0.5em] uppercase text-white">DIGNITEQ_ENGINEERING_DEPT // STATUS: OPTIMAL</span>
            </div>

            <div className="relative w-full max-w-[1800px] flex flex-col items-center">
               {/* Huge Top Title */}
               <div className="w-full text-center">
                  <h1 className="font-serif-premium text-[clamp(3.2rem,18vw,12rem)] leading-[0.9] text-white uppercase tracking-[-0.04em] text-glow-premium animate-reveal-right delay-500 text-gradient-premium">
                    {hero.title}
                  </h1>
               </div>
               
               {/* Split Bottom Layer */}
               <div className="w-full flex flex-col items-center px-6 md:px-20 mt-2 md:mt-8 gap-8">
                  <div className="text-center">
                     <h2 className="font-serif-premium text-[clamp(2.5rem,15vw,7rem)] leading-[0.8] text-white/90 uppercase tracking-[-0.04em] text-glow-premium animate-reveal-left delay-700 text-gradient-premium">
                       {hero.subtitle}
                     </h2>
                  </div>
                  
                  <div className="max-w-[600px] md:max-w-[800px] text-center animate-reveal delay-900 mt-4 pointer-events-auto">
                    <p className="font-inter text-[13px] md:text-[16px] leading-[1.8] text-white/60 font-medium uppercase tracking-[0.2em]">
                      {hero.description}
                    </p>
                    <div className="mt-10 flex justify-center">
                      <a 
                        href={hero.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-luxury bg-white text-black font-sans-premium text-[11px] md:text-[13px] font-black uppercase tracking-widest px-10 py-4 rounded-full shadow-2xl shadow-white/10 hover:scale-105 transition-transform inline-block"
                      >
                        {hero.ctaText}
                      </a>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Hero Centerpiece */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image 
                src="/assets/digni.png" 
                alt="Digniteq Branding" 
                fill
                priority
                unoptimized
                className="object-cover opacity-30 md:opacity-50 mix-blend-screen animate-fade-in delay-1000"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-500/[0.05] blur-[200px] rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-purple-500/[0.03] blur-[150px] rounded-full"></div>
            </div>
          </div>

          {/* Scroll to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute bottom-10 right-10 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 backdrop-blur-3xl rounded-2xl flex items-center justify-center border border-white/10 hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all z-[100] group active:scale-95 pointer-events-auto"
          >
            <span className="text-white text-2xl group-hover:-translate-y-2 transition-transform duration-500">↑</span>
          </button>
        </section>

        <div className="architectural-line opacity-20"></div>

        {/* Impact Section (Services) */}
        <section id="services" className="py-8 md:py-16 px-6 relative z-10 bg-[#0A0618] overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
              <div className="w-full lg:w-1/2 lg:sticky lg:top-40 mb-6 lg:mb-0 flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="font-sans-premium text-[9px] font-black tracking-[0.3em] text-blue-500 uppercase mb-4 block animate-reveal">How we help you grow</span>
                <h2 className="font-sans-premium text-[clamp(1.5rem,7vw,2.5rem)] font-black leading-[1.2] uppercase tracking-tight mb-8 animate-reveal delay-100">
                  Simple & Effective <br className="hidden md:block" />
                  <span className="text-white/20">Digital Marketing</span> <br className="md:hidden" /> That Actually Works
                </h2>
                <p className="font-inter text-[13px] md:text-[14px] text-white/50 leading-relaxed mb-10 max-w-lg animate-reveal delay-200 mx-auto lg:mx-0">
                  We are a digital agency that works with small businesses and startups. Our goal is simple: help you get more customers with smart, affordable strategies.
                </p>
                
                <div className="flex justify-center lg:justify-start gap-12 md:gap-16 animate-reveal delay-300 mb-6 lg:mb-0">
                  {[
                    { label: "Online Presence", value: "Build" },
                    { label: "Market Share", value: "Scale" }
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="text-3xl md:text-4xl font-serif-premium italic text-white mb-2">{stat.value}</div>
                      <div className="font-sans-premium text-[9px] font-black tracking-widest text-white/20 uppercase">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
                <p className="font-inter text-[14px] md:text-[16px] text-white/60 leading-relaxed animate-reveal delay-400 max-w-xl mx-auto lg:mx-0">
                  As your digital partner, we focus on building your brand, finding the right audience, and helping you turn visitors into loyal customers.
                </p>
                <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-5 w-full snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4">
                  {services.map((item, i) => (
                    <div 
                      key={i} 
                      className="group glass-card p-8 md:p-10 rounded-[30px] flex flex-col gap-6 relative overflow-hidden animate-reveal shrink-0 w-[280px] md:w-auto snap-center"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="absolute -right-6 -bottom-6 text-[8rem] text-white/[0.015] font-black pointer-events-none group-hover:text-blue-500/5 transition-colors font-sans-premium">
                        {i + 1}
                      </div>
                      <div className="text-blue-500 text-3xl group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                      <div>
                        <h3 className="font-sans-premium text-xl font-bold uppercase tracking-tight mb-3">{item.title}</h3>
                        <p className="font-inter text-[11px] md:text-[12px] text-white/50 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics & Trust Section */}
        <section className="py-12 md:py-16 px-6 relative overflow-hidden bg-gradient-to-b from-[#0A0618] to-[#0A0618]/40">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center animate-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="font-sans-premium text-[8px] font-black tracking-[0.3em] text-white/15 uppercase mb-2">{stat.label}</span>
                <div className="font-serif-premium text-3xl md:text-4xl text-white mb-1">{stat.value}</div>
                <p className="font-inter text-[8px] text-blue-500 uppercase tracking-[0.2em] font-bold">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* About Us Section */}
        <section id="about" className="py-16 md:py-28 px-6 relative overflow-hidden bg-transparent">
          {/* Top fade overlay for smooth transition */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#0A0618]/50 to-transparent pointer-events-none"></div>
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] blur-[200px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.03] blur-[180px] rounded-full pointer-events-none"></div>

          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
              {/* Image/Visual Side */}
              <div className="w-full lg:w-[45%] relative group">
                <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
                <div className="relative aspect-[3/2] md:aspect-[4/3] lg:aspect-[16/10] rounded-[30px] overflow-hidden border border-white/10 shadow-2xl bg-white/[0.02]">
                  <Image 
                    src="/assets/about-visual.png"
                    alt="About Digniteq"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0618]/90 via-[#0A0618]/20 to-transparent"></div>
                  
                  {/* Floating badges */}
                  <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl z-30 group-hover:bg-white/15 transition-all duration-500">
                    <div className="text-2xl font-serif-premium italic text-blue-400 mb-1">{about.yearsExp}</div>
                    <div className="font-sans-premium text-[8px] font-black tracking-[0.3em] text-white/60 uppercase whitespace-nowrap">Years of Vision</div>
                  </div>
                  <div className="absolute top-6 left-6 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-xl z-30 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                    <div className="text-lg font-serif-premium italic text-purple-400 mb-0.5">{about.happyClients}</div>
                    <div className="font-sans-premium text-[7px] font-black tracking-[0.2em] text-white/50 uppercase">Happy Clients</div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="font-sans-premium text-[9px] font-black tracking-[0.4em] text-blue-400 uppercase mb-5 block animate-reveal flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-blue-400/60"></span>
                  Our Story
                  <span className="w-8 h-[1px] bg-blue-400/60"></span>
                </span>
                <h2 className="font-sans-premium text-[clamp(1.6rem,4.5vw,2.8rem)] font-black leading-[1.05] uppercase tracking-normal mb-8 animate-reveal delay-100">
                  We Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Digital Legacies</span> <br /> For Small Businesses
                </h2>
                
                {/* Gradient accent line */}
                <div className="w-20 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8 animate-reveal delay-150 mx-auto lg:mx-0"></div>
                
                <div className="space-y-5 animate-reveal delay-200">
                  <p className="font-inter text-[14px] md:text-[15px] text-white/65 leading-[1.9] max-w-xl">
                    {about.paragraph1}
                  </p>
                  <p className="font-inter text-[13px] md:text-[14px] text-white/45 leading-[1.9] max-w-xl">
                    {about.paragraph2}
                  </p>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid grid-cols-2 gap-5 mt-12 w-full max-w-lg animate-reveal delay-300">
                   <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-blue-500/20 hover:bg-blue-500/[0.03] transition-all duration-500 group/card">
                     <div className="flex items-center gap-2 mb-3">
                       <span className="text-blue-400 text-sm group-hover/card:scale-110 transition-transform duration-500">◈</span>
                       <h3 className="font-sans-premium text-[10px] font-black text-white uppercase tracking-widest">Our Mission</h3>
                     </div>
                     <p className="font-inter text-[11px] text-white/40 leading-relaxed">{about.mission}</p>
                   </div>
                   <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-purple-500/20 hover:bg-purple-500/[0.03] transition-all duration-500 group/card">
                     <div className="flex items-center gap-2 mb-3">
                       <span className="text-purple-400 text-sm group-hover/card:scale-110 transition-transform duration-500">✧</span>
                       <h3 className="font-sans-premium text-[10px] font-black text-white uppercase tracking-widest">Our Vision</h3>
                     </div>
                     <p className="font-inter text-[11px] text-white/40 leading-relaxed">Empowering local brands to grow and thrive digitally.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Work Preview */}
        <section className="py-8 md:py-16 px-6 relative overflow-hidden bg-transparent">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-8 relative">
              {/* Background Decorative Text */}
              <div className="absolute -top-20 -left-10 text-[10rem] font-serif-premium font-black text-white/[0.02] pointer-events-none select-none uppercase tracking-tighter">
                Our Work
              </div>
              
              <div className="animate-reveal relative z-10">
                <span className="font-sans-premium text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase mb-3 block">Our Portfolio</span>
                <h2 className="font-sans-premium text-[clamp(1.5rem,5vw,2.2rem)] font-black leading-[1] uppercase tracking-tighter text-gradient-premium whitespace-nowrap">
                  Our Recent <span className="text-white/20 ml-3">Projects</span>
                </h2>
              </div>
              <div className="animate-reveal delay-200 relative z-10">
                <Link href="/portfolio" className="btn-luxury border border-white/10 px-10 py-4 md:px-8 md:py-3 rounded-full font-sans-premium text-[11px] md:text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all inline-block">
                  View All Projects ➔
                </Link>
              </div>
            </div>

            {/* 3D Fan Carousel Section */}
            <div 
              className={`mt-10 md:mt-16 relative pt-10 pb-10 ${isMobile ? 'overflow-x-auto flex px-6 gap-6 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'overflow-visible'}`}
              onTouchStart={!isMobile ? handleTouchStart : undefined}
              onTouchEnd={!isMobile ? handleTouchEnd : undefined}
            >
              {/* Central Glow Removed */}

              <div className={`${isMobile ? 'flex gap-6 items-center' : 'flex justify-center items-center gap-4 md:gap-8 perspective-[2000px]'}`}>
                {portfolio.map((work, idx) => {
                  const offset = idx - activeIndex;
                  
                  // Transform values - only used on desktop
                  const rotateY = offset * 20;
                  const translateZ = Math.abs(offset) * -150;
                  const translateX = offset * 40;
                  const translateY = Math.abs(offset) * 30;
                  
                  // Visibility logic - only used on desktop
                  const isVisible = isMobile ? true : Math.abs(offset) <= 2;
                  
                  return (
                    <div 
                      key={work.title}
                      onClick={() => handleCardClick(idx)}
                      className={`group relative w-[240px] h-[360px] md:w-[320px] md:h-[480px] shrink-0 transition-all duration-1000 ease-out cursor-pointer snap-center ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                      style={!isMobile ? { 
                        transform: `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px) translateX(${translateX}px) translateY(${translateY}px)`,
                        zIndex: 10 - Math.abs(offset)
                      } : {}}
                    >
                      <div className="absolute inset-0 rounded-[20px] md:rounded-[30px] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-blue-500/50 group-hover:scale-105">
                        <Image 
                          src={work.img} 
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className={`object-cover transition-all duration-700 ${idx === activeIndex ? 'grayscale-0' : 'grayscale-[0.5] group-hover:grayscale-0'}`} 
                          alt={work.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="font-sans-premium text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 block">{work.cat}</span>
                          <h3 className="font-serif-premium text-xl md:text-2xl text-white mb-4 italic">{work.title}</h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Features Grid - Enhanced UI */}
            <div className="mt-2 md:mt-4 flex flex-col items-center animate-reveal delay-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl w-full px-6">
                {[
                  { title: "Beautiful Design", desc: "Simple and clean layouts for your brand.", icon: "◈" },
                  { title: "Modern Tech", desc: "Fast and reliable websites that work.", icon: "✧" },
                  { title: "Growth Strategy", desc: "Planning your path to more customers.", icon: "✦" }
                ].map((feat, i) => (
                  <div key={i} className="flex flex-col gap-3 group text-center">
                    <div className="text-blue-500 text-xl group-hover:scale-110 transition-transform duration-500">{feat.icon}</div>
                    <div>
                      <h4 className="font-sans-premium text-[10px] font-black text-white uppercase tracking-widest mb-2">{feat.title}</h4>
                      <p className="font-inter text-[10px] md:text-[11px] text-white/50 uppercase tracking-widest leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#0A0618] pointer-events-none z-20"></div>
        </section>

        {/* Strategic Process Section - BLACK SHADE BACKGROUND */}
        <section id="process" className="py-12 md:py-20 px-6 relative overflow-hidden bg-gradient-to-b from-[#0A0618] via-[#0A0618] to-[#0A0618]/60">
          
          <div className="max-w-[1400px] mx-auto relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8 md:gap-10 text-center md:text-left">
                 <div className="max-w-2xl animate-reveal w-full flex flex-col items-center md:items-start">
                    <span className="font-sans-premium text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase mb-3 block">Our Process</span>
                    <h2 className="font-sans-premium text-[clamp(1.8rem,5vw,2.5rem)] font-black leading-[1.05] uppercase tracking-tighter text-gradient-premium">
                       How we work <br />
                       <span className="text-white/20">Together</span>
                    </h2>
                 </div>
             </div>

             <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 relative snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-8">
                {processSteps.map((item, i) => (
                  <div key={i} className="relative bg-white/[0.02] border border-white/5 p-8 rounded-[24px] group hover:border-blue-500/30 transition-all animate-reveal shrink-0 w-[260px] md:w-auto snap-center" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="mb-6 flex items-center justify-between">
                       <span className="font-sans-premium text-2xl font-black text-white/5 group-hover:text-blue-500/20 transition-colors">{item.step || `0${i+1}`}</span>
                    </div>
                    <h3 className="font-sans-premium text-base font-black text-white uppercase tracking-tight mb-2.5">{item.title}</h3>
                    <p className="font-inter text-[10px] md:text-[11px] text-white/40 leading-relaxed uppercase tracking-widest">{item.desc || item.description}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center px-6">
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity animate-fade-in"
              onClick={() => setSelectedProject(null)}
            ></div>
            
            <div className="relative w-full max-w-5xl bg-[#030610] border border-white/10 rounded-[40px] overflow-hidden animate-reveal flex flex-col md:flex-row shadow-[0_0_100px_rgba(37,99,235,0.2)] mx-4 md:mx-0">
              <button 
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold hover:scale-110 transition-all shadow-2xl"
                onClick={() => setSelectedProject(null)}
              >
                ✕
              </button>

              <div className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden group">
                <img 
                  src={selectedProject.img} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  alt={selectedProject.title} 
                />
              </div>

              <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-gradient-to-br from-blue-500/[0.02] to-transparent">
                <div className="mb-8">
                  <span className="bg-blue-500/10 text-blue-500 px-4 py-1.5 rounded-full font-sans-premium text-[9px] font-black uppercase tracking-[0.3em] mb-4 inline-block">
                    {selectedProject.cat} // Case Study
                  </span>
                  <h2 className="font-serif-premium text-4xl md:text-6xl text-white mb-2 uppercase tracking-tight">
                    {selectedProject.title}
                  </h2>
                </div>
                
                <div className="h-[1px] w-full bg-white/5 mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/40 w-1/3"></div>
                </div>

                <p className="font-inter text-sm md:text-base text-white/50 leading-relaxed mb-12">
                  {selectedProject.desc}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <Link 
                    href="/portfolio" 
                    className="btn-luxury bg-white text-black text-center px-10 py-4 rounded-full font-sans-premium text-[11px] font-black uppercase tracking-widest shadow-xl shadow-white/5"
                    onClick={() => setSelectedProject(null)}
                  >
                    View Project <span className="ml-2">➔</span>
                  </Link>
                  <button 
                    className="group border border-white/10 text-white px-10 py-4 rounded-full font-sans-premium text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                    onClick={() => {
                      const nextIdx = (displayPortfolio.indexOf(selectedProject) + 1) % displayPortfolio.length;
                      setSelectedProject(displayPortfolio[nextIdx]);
                    }}
                  >
                    Next Artifact <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
