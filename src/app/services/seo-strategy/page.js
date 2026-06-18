"use client";

import { useState, useEffect } from "react";
import ContactForm from "../../components/ContactForm";
import { apiFetch } from "../../utils/api";

export default function SEOStrategy() {
  const [expandedCard, setExpandedCard] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([
    { 
      plan: "Local SEO", 
      price: "₹9,500", 
      goal: "Calls, Leads & Map Visibility",
      desc: "Best for service-based and location-focused businesses.",
      features: [
        "Site Analyses & Report",
        "Local Keyword Research",
        "Google Business Profile Optimization",
        "On-page SEO for 5 Core Pages",
        "Local Schema Markup",
        "NAP Consistency & Citation Cleanup",
        "Review Strategy Guidance",
        "Monthly Lead & Ranking Report"
      ], 
      perfect: "Doctors, Salons, Real Estate Agents",
      button: "Deploy Local" 
    },
    { 
      plan: "Growth SEO", 
      price: "₹17,500", 
      goal: "Ranking + Qualified Traffic",
      desc: "Best for businesses competing on Google search.",
      features: [
        "Site Analyses & Report",
        "Competitor-Driven Keyword Research",
        "On-page SEO for 10 Pages",
        "Technical SEO & Core Web Vitals",
        "Indexing & Crawl Optimization",
        "Content Published (2 SEO Blogs)",
        "High-Quality Backlinks (6-8/Mo)",
        "Conversion-Focused SEO Suggestions",
        "Monthly Ranking & Traffic Insights"
      ], 
      button: "Deploy Growth", 
      highlight: true 
    },
    { 
      plan: "Premium SEO", 
      price: "₹27,500", 
      goal: "Authority & Sustainable Rankings",
      desc: "Best for brands that want long-term dominance.",
      features: [
        "Advanced SEO Audit & Roadmap",
        "Keyword Strategy (50+ Intent Terms)",
        "On-page SEO for 20 Pages",
        "Content Publish (4 SEO Blogs/Mo)",
        "Authority Backlinks (12-15/Mo)",
        "Internal Linking & Topical Clusters",
        "Competitor Backlink Gap Analysis",
        "CRO-Focused SEO Improvements",
        "Detailed Monthly Growth Report"
      ], 
      perfect: "E-commerce, SaaS, National Brands",
      button: "Deploy Premium" 
    }
  ]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiFetch("/pricing");
        if (data && data.length > 0) {
          const filtered = data
            .filter(plan => plan.serviceType === "seo-strategy")
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          if (filtered.length > 0) {
            setPricingPlans(filtered.map(p => ({
              plan: p.planName,
              price: p.price,
              goal: p.period || "Calls, Leads & Visibility",
              desc: p.desc,
              perfect: p.targetAudience ? p.targetAudience.join(", ") : undefined,
              features: p.features || [],
              highlight: p.isPopular,
              tag: p.isPopular ? "Popular" : undefined,
              button: p.ctaLabel || "Deploy Plan"
            })));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch seo-strategy pricing plans, using fallbacks.");
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-transparent selection:bg-blue-500/30">
      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="min-h-[85vh] md:min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-6">
          {/* Background Text Layer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
             <div className="font-serif-premium text-[40vw] leading-none uppercase translate-y-0 md:translate-y-20">SEO</div>
          </div>

          <div className="max-w-[1400px] mx-auto w-full relative z-20 flex flex-col items-center -translate-y-10 md:-translate-y-16 text-center">
            <div className="max-w-4xl">
              <h1 className="font-serif-premium text-[clamp(4rem,14vw,9rem)] leading-[1] md:leading-[0.9] text-white uppercase tracking-[-0.04em] mb-12 text-glow-premium animate-reveal delay-100">
                SEO <br />
                <span className="text-gradient-premium">Strategy</span>
              </h1>
              
              <div className="flex flex-col items-center gap-8 mb-16 animate-reveal delay-200">
                <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <p className="font-inter text-[13px] md:text-[16px] text-white/60 leading-[1.8] max-w-2xl uppercase tracking-[0.2em]">
                  We help your website show up when people search for your services online. It's about being in the right place when customers are looking for you.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 animate-reveal delay-300">
                {["Smart Keywords", "Site Health", "Growth Reports"].map((tag) => (
                  <span key={tag} className="border border-white/10 bg-white/[0.03] backdrop-blur-md px-8 py-3 rounded-full font-sans-premium text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
            <span className="text-xl">↓</span>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 md:px-20 py-8 md:py-24 relative overflow-hidden">
          {/* Large Background Typography */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 opacity-[0.02]">
            <h2 className="font-sans-premium text-[28vw] font-black leading-none uppercase tracking-tighter text-white">PRICING</h2>
          </div>
          <div className="max-w-[1400px] mx-auto text-center mb-16">
            <span className="font-sans-premium text-[8px] font-black tracking-[0.5em] text-blue-500 uppercase mb-4 block animate-reveal">Strategic Plans</span>
            <h2 className="font-sans-premium text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 animate-reveal delay-100 text-gradient-premium">
              Growth <span className="text-white/20">Models</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
            {pricingPlans.map((item, i) => (
              <div 
                key={i} 
                className={`glass-card p-8 md:p-12 rounded-[32px] md:rounded-[40px] flex flex-col items-start animate-reveal transition-all duration-500 cursor-pointer md:cursor-default ${
                  item.highlight ? "border-blue-500/30 bg-blue-500/[0.02] scale-[1.02] z-10" : "border-white/5"
                } ${expandedCard === i ? "ring-2 ring-blue-500/50" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setExpandedCard(expandedCard === i ? null : i);
                  }
                }}
              >
                <div className="w-full flex justify-between items-start mb-6 md:mb-8">
                  <div>
                    <span className="font-sans-premium text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 block">{item.plan} Package</span>
                    <div className="text-3xl md:text-5xl font-sans-premium font-black tracking-tighter text-white">{item.price}</div>
                  </div>
                  {item.highlight && (
                    <span className="bg-blue-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Sale</span>
                  )}
                </div>
                
                <div className="mb-6 md:mb-8">
                   <p className="font-inter text-[10px] text-white font-black uppercase tracking-widest mb-2">Goal: {item.goal}</p>
                   <p className="font-inter text-[11px] md:text-[12px] text-white/50 uppercase tracking-widest leading-relaxed text-left">
                     {item.desc}
                   </p>
                </div>

                {/* Mobile Toggle Indicator */}
                <div className="flex md:hidden items-center gap-2 text-blue-500 mb-4">
                  <span className="font-sans-premium text-[9px] font-black uppercase tracking-widest">
                    {expandedCard === i ? "Tap to close ↑" : "Tap to know more ↓"}
                  </span>
                </div>

                <div className={`w-full overflow-hidden transition-all duration-500 ${expandedCard === i ? "max-h-[1200px] opacity-100 mb-8" : "max-h-0 md:max-h-none opacity-0 md:opacity-100"}`}>
                  <div className="h-[1px] w-full bg-white/5 mb-8 md:mb-10"></div>
                  <ul className="flex flex-col gap-5 mb-10 w-full">
                    {item.features.map((feat, j) => (
                      <li key={j} className="font-inter text-[10px] text-white/60 uppercase tracking-widest flex items-start gap-3 text-left">
                        <span className="text-blue-500 mt-1">✦</span> {feat}
                      </li>
                    ))}
                  </ul>

                  {item.perfect && (
                    <p className="font-inter text-[8px] text-white/20 uppercase tracking-[0.2em] mb-8 text-left border-t border-white/5 pt-6 w-full">
                      Perfect for: {item.perfect}
                    </p>
                  )}

                  <a 
                    href={`https://wa.me/916205318620?text=${encodeURIComponent(`Hello! I'm interested in the ${item.plan} plan for SEO Strategy.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-luxury w-full py-5 rounded-full font-sans-premium text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center ${item.highlight ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white hover:text-black"}`}
                  >
                    {item.button} ➔
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6 md:px-20 py-16 bg-white/[0.02] backdrop-blur-3xl rounded-[60px] mx-4 relative overflow-hidden border border-white/5">
          <div className="max-w-[800px] mx-auto relative z-10">
            <h2 className="font-sans-premium text-2xl md:text-4xl font-black uppercase tracking-tighter mb-8 leading-[1.1]">
              How SEO Helps <span className="text-white/30">You Get Customers</span>
            </h2>
            <div className="prose prose-invert max-w-none font-inter text-white/50 text-[13px] md:text-[15px] leading-[1.8] space-y-8 text-center md:text-left">
              <p>
                Showing up on Google is the best way to grow your business online. We don't just "rank" your site; we make sure you're seen by people who are ready to buy. We use a simple, data-led approach to help you stay ahead of the competition.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 mt-12">
                <li className="glass-card p-8 rounded-3xl">
                  <h3 className="text-white text-lg font-black uppercase mb-3">The Right Keywords</h3>
                  <p>We find the words and phrases your customers are actually using, so they can find you easily.</p>
                </li>
                <li className="glass-card p-8 rounded-3xl">
                  <h3 className="text-white text-lg font-black uppercase mb-3">Technical Health</h3>
                  <p>We make sure your website is fast and easy for Google to read, so it stays at the top of the results.</p>
                </li>
              </ul> 
            </div>
          </div>
        </section>

        <section id="contact" className="px-6 md:px-20 py-24">
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
