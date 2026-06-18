"use client";

import { useState, useEffect } from "react";
import ContactForm from "../../components/ContactForm";
import { apiFetch } from "../../utils/api";

export default function WebsiteDesign() {
  const [expandedCard, setExpandedCard] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([
    { 
      plan: "Standard Website", 
      price: "₹11,999", 
      desc: "Specially designed for small businesses with 100% responsiveness.",
      targetAudience: ["Local Restaurant", "Cafe", "Gym", "Salon", "Coaching center"],
      features: [
        "1-5 Page",
        "1 year hosting",
        "1 business emails",
        "3 month support",
        "Free SSL",
        "Basic SEO setup",
        "Basic contact form",
        "Mobile responsive design",
        "Social media links",
        "Google map integration",
        "Fast loading"
      ], 
      button: "Deploy Standard" 
    },
    { 
      plan: "Premium Website", 
      price: "₹29,999", 
      desc: "Advanced growth-focused platform for expanding brands.",
      targetAudience: ["Bigger Restaurant", "Dental clinic", "Multi-branch Gym", "Construction company", "E-commerce Startup"],
      features: [
        "5-10 Pages",
        "1 domain free",
        "1 year hosting",
        "3 emails",
        "6 month support",
        "Free SSL",
        "Blog setup",
        "Google Analytics",
        "Basic on-page SEO",
        "Lead form setup",
        "Social media integ.",
        "Custom UI design"
      ], 
      highlight: true,
      tag: "Popular",
      button: "Deploy Premium" 
    },
    { 
      plan: "Elite Website", 
      price: "₹44,999", 
      desc: "The ultimate digital ecosystem for total market dominance.",
      targetAudience: ["Established companies", "Big Startup", "Agencies", "SaaS Startup", "Large Real Estate firms"],
      features: [
        "10-20 pages",
        "Advanced UI/UX",
        "Full Admin panel",
        "1 domain free",
        "Booking/inquiry system",
        "SEO Setup",
        "one domain free ",
        "CRM/WhatsApp integration",
        "1-year hosting & emails",
        "1-year maintenance",
        "Speed optimization",
        "GSC or Analytics"
      ], 
      button: "Deploy Elite" 
    }
  ]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiFetch("/pricing");
        if (data && data.length > 0) {
          const filtered = data
            .filter(plan => plan.serviceType === "website-design")
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          if (filtered.length > 0) {
            setPricingPlans(filtered.map(p => ({
              plan: p.planName,
              price: p.price,
              desc: p.desc,
              targetAudience: p.targetAudience || [],
              features: p.features || [],
              highlight: p.isPopular,
              tag: p.isPopular ? "Popular" : undefined,
              button: p.ctaLabel || "Deploy Plan"
            })));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch website-design pricing plans, using fallbacks.");
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-transparent selection:bg-blue-500/30">
      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section - Redesigned for Uniqueness */}
        <section className="min-h-[85vh] md:min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-6">
          {/* Background Text Layer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
             <div className="font-serif-premium text-[40vw] leading-none uppercase translate-y-0 md:translate-y-20">WEB</div>
          </div>

          <div className="max-w-[1400px] mx-auto w-full relative z-20 flex flex-col items-center -translate-y-10 md:-translate-y-16 text-center">
            <div className="max-w-4xl">
              <h1 className="font-serif-premium text-[clamp(4rem,14vw,9rem)] leading-[1] md:leading-[0.9] text-white uppercase tracking-[-0.04em] mb-12 text-glow-premium animate-reveal delay-100">
                Website <br />
                <span className="text-gradient-premium">Design</span>
              </h1>
              
              <div className="flex flex-col items-center gap-8 mb-16 animate-reveal delay-200">
                <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <p className="font-inter text-[13px] md:text-[16px] text-white/60 leading-[1.8] max-w-2xl uppercase tracking-[0.2em]">
                  We build beautiful, easy-to-use websites that turn visitors into customers. Your website should be your best salesperson, working for you 24/7.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 animate-reveal delay-300">
                {["Easy-to-use Design", "Mobile Friendly", "Ready to Sell"].map((tag) => (
                  <span key={tag} className="border border-white/10 bg-white/[0.03] backdrop-blur-md px-8 py-3 rounded-full font-sans-premium text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 left-10 hidden lg:block opacity-20 rotate-90 origin-left animate-reveal delay-500">
            <span className="font-sans-premium text-[8px] font-black tracking-[0.5em] uppercase text-white">SYS_WEB_ENG // 01.A</span>
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

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="font-sans-premium text-[8px] font-black tracking-[0.5em] text-blue-500 uppercase mb-3 block animate-reveal">Investment Architecture</span>
              <h2 className="font-sans-premium text-3xl md:text-4xl font-black uppercase tracking-tighter animate-reveal delay-100 text-white">
                Choose Your <span className="text-blue-500">Plan</span>
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
                      <span className="font-sans-premium text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 block">{item.plan}</span>
                      <div className="text-3xl md:text-5xl font-sans-premium font-black tracking-tighter text-white">
                         {item.price}
                        
                      </div>
                    </div>
                    {item.tag && (
                      <span className="bg-blue-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  
                  <p className="font-inter text-[11px] md:text-[12px] text-white/50 uppercase tracking-widest leading-relaxed mb-6 md:mb-10 text-left">
                    {item.desc}
                  </p>

                  {/* Mobile Toggle Indicator */}
                  <div className="flex md:hidden items-center gap-2 text-blue-500 mb-4">
                    <span className="font-sans-premium text-[9px] font-black uppercase tracking-widest">
                      {expandedCard === i ? "Tap to close ↑" : "Tap to know more ↓"}
                    </span>
                  </div>

                  <div className={`w-full overflow-hidden transition-all duration-500 ${expandedCard === i ? "max-h-[1200px] opacity-100 mb-8" : "max-h-0 md:max-h-none opacity-0 md:opacity-100"}`}>
                    <div className="h-[1px] w-full bg-white/5 mb-8 md:mb-10"></div>
                    
                    <div className="mb-8">
                      <span className="font-sans-premium text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 block text-left">Best For</span>
                      <div className="flex flex-wrap gap-2 text-left">
                        {item.targetAudience.map((audience, idx) => (
                          <span key={idx} className="font-inter text-[9px] md:text-[10px] text-white/70 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ul className="flex flex-col gap-5 mb-10 w-full">
                      {item.features.map((feat, j) => (
                        <li key={j} className="font-inter text-[10px] text-white/60 uppercase tracking-widest flex items-start gap-3 text-left">
                          <span className="text-blue-500 mt-1">✦</span> {feat}
                        </li>
                      ))}
                    </ul>

                    <a 
                      href={`https://wa.me/916205318620?text=${encodeURIComponent(`Hello! I'm interested in the ${item.plan} plan for Website Design.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-luxury w-full py-5 rounded-full font-sans-premium text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl flex flex-col items-center justify-center gap-1 ${item.highlight ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white hover:text-black"}`}
                    >
                      <span>{item.button} ➔</span>
                      <span className="text-[7px] opacity-60">Get 10% Off</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Aesthetic Toggle Component */}
            <div className="mt-16 flex flex-col items-center gap-4 animate-reveal delay-500">
               <div className="flex items-center gap-4">
                  <span className="font-sans-premium text-[9px] font-black text-white/20 uppercase tracking-widest">Project-Based</span>
                  <div className="w-10 h-5 bg-white/5 rounded-full border border-white/10 p-0.5 relative cursor-pointer group">
                    <div className="w-4 h-4 bg-blue-500 rounded-full transition-all group-hover:bg-white"></div>
                  </div>
                  <span className="font-sans-premium text-[9px] font-black text-white/60 uppercase tracking-widest">Retainer</span>
               </div>
               <p className="font-inter text-[8px] text-white/20 uppercase tracking-widest">Tailored strategies for every scale.</p>
            </div>
          </div>
        </section>

        {/* SEO Focused Content */}
        <section className="px-6 md:px-20 py-16 bg-white/[0.02] backdrop-blur-3xl rounded-[60px] mx-4 relative overflow-hidden border border-white/5">
           <div className="absolute top-0 left-0 w-full h-full grid-bg opacity-5"></div>
          <div className="max-w-[800px] mx-auto relative z-10">
            <h2 className="font-sans-premium text-2xl md:text-4xl font-black uppercase tracking-tighter mb-8 leading-[1.1]">
              Why Your Website Is <span className="text-white/30">Your Best Salesperson</span>
            </h2>
            <div className="prose prose-invert max-w-none font-inter text-white/50 text-[13px] md:text-[15px] leading-[1.8] space-y-8">
              <p>
                In today's world, your website is often the first thing a customer sees. A slow or confusing site can drive them away instantly. At Digniteq, we build custom websites that don't just look great—they're built to be fast, secure, and ready to sell your services.
              </p>
              <p>
                We start by learning about your customers and what they need. We don't just "design" a site; we create an experience. From a simple layout to fast loading times, every part is made to help you show up on Google and turn visitors into happy clients.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 mt-12">
                <li className="glass-card p-8 rounded-3xl">
                  <h3 className="text-white text-lg font-black uppercase mb-3">Custom Made</h3>
                  <p>No boring templates here. We build everything from scratch to make sure your site is as unique as your business.</p>
                </li>
                <li className="glass-card p-8 rounded-3xl">
                  <h3 className="text-white text-lg font-black uppercase mb-3">Mobile Ready</h3>
                  <p>Since most people use their phones to browse, we make sure your site looks and works perfectly on every device.</p>
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
