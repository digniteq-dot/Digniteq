"use client";

import { useState, useEffect } from "react";
import ContactForm from "../../components/ContactForm";
import { apiFetch } from "../../utils/api";

export default function SMMStrategy() {
  const [expandedCard, setExpandedCard] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([
    { 
      plan: "SMM Silver", 
      price: "₹7,000", 
      desc: "Build a social identity and maintain a consistent online presence.",
      features: [
        "Profile Optimization",
        "Branded Designs",
        "2 Platforms: FB & Instagram",
        "3 Posts Per Week",
        "Posts: Info/Testimonial/Offer/BTS",
        "12 Static Posts + 2 Reels/Mo",
        "Hashtag & Caption Optimization",
        "Basic Engagement & Report"
      ], 
      button: "Deploy Silver" 
    },
    { 
      plan: "SMM Gold", 
      price: "₹12,000", 
      desc: "Start your journey into professional social media marketing.",
      features: [
        "Profile Optimization",
        "Premium Designs",
        "3 Platforms: FB, Insta, LI/YT",
        "4 Posts Per Week",
        "Posts: Info/Testimonial/Offer/BTS",
        "12 Posts + 4 Reels/Mo",
        "Hashtag & Caption Optimization",
        "Content Calendar Sheet",
        "Meta Ads Setup",
        "2 Ad Campaigns Setup",
        "Awareness & Lead Gen Strategy",
        "Monthly Growth & Insights Report"
      ], 
      button: "Deploy Gold", 
      highlight: true 
    },
    { 
      plan: "SMM Diamond", 
      price: "₹18,000", 
      desc: "Build strong presence and drive revenue with positive ROAS.",
      features: [
        "Profile & GMB Optimization",
        "Premium Designs",
        "5 Platforms: FB, IG, LI, YT, GMB",
        "5 Posts Per Week",
        "Total: 16 Posts + 8 Reels/Mo",
        "Competitor & Audience Analysis",
        "Hashtag & Caption Optimization",
        "Content Calendar Sheet",
        "Meta Ads & Pixel Setup",
        "5 Ad Campaigns Setup",
        "Custom Conversion Setup",
        "Monthly Growth & Insights Report"
      ], 
      button: "Deploy Diamond" 
    }
  ]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiFetch("/pricing");
        if (data && data.length > 0) {
          const filtered = data
            .filter(plan => plan.serviceType === "smm-strategy")
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
        console.warn("Failed to fetch smm-strategy pricing plans, using fallbacks.");
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
             <div className="font-serif-premium text-[40vw] leading-none uppercase translate-y-0 md:translate-y-20">SMM</div>
          </div>

          <div className="max-w-[1400px] mx-auto w-full relative z-20 flex flex-col items-center -translate-y-10 md:-translate-y-16 text-center">
            <div className="max-w-4xl">
              <h1 className="font-serif-premium text-[clamp(4rem,14vw,9rem)] leading-[1] md:leading-[0.9] text-white uppercase tracking-[-0.04em] mb-12 text-glow-premium animate-reveal delay-100">
                Social <br />
                <span className="text-gradient-premium">Media</span>
              </h1>
              
              <div className="flex flex-col items-center gap-8 mb-16 animate-reveal delay-200">
                <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <p className="font-inter text-[13px] md:text-[16px] text-white/60 leading-[1.8] max-w-2xl uppercase tracking-[0.2em]">
                  We help you build a real community on social media. We create posts that people actually want to see, helping you build trust and find new customers.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 animate-reveal delay-300">
                {["Content Strategy", "Viral Ideas", "Building a Following"].map((tag) => (
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
            <span className="font-sans-premium text-[8px] font-black tracking-[0.5em] text-blue-500 uppercase mb-4 block animate-reveal">Narrative Plans</span>
            <h2 className="font-sans-premium text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 animate-reveal delay-100 text-gradient-premium">
              Social <span className="text-white/20">Growth</span>
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
                
                <p className="font-inter text-[11px] md:text-[12px] text-white/50 uppercase tracking-widest leading-relaxed mb-6 md:mb-10 text-left">
                  {item.desc}
                </p>

                {/* Mobile Toggle Indicator */}
                <div className="flex md:hidden items-center gap-2 text-blue-500 mb-4">
                  <span className="font-sans-premium text-[9px] font-black uppercase tracking-widest">
                    {expandedCard === i ? "Tap to close ↑" : "Tap to know more ↓"}
                  </span>
                </div>

                <div className={`w-full overflow-hidden transition-all duration-500 ${expandedCard === i ? "max-h-[1000px] opacity-100 mb-8" : "max-h-0 md:max-h-none opacity-0 md:opacity-100"}`}>
                  <div className="h-[1px] w-full bg-white/5 mb-8 md:mb-10"></div>
                  <ul className="flex flex-col gap-5 mb-10 w-full">
                    {item.features.map((feat, j) => (
                      <li key={j} className="font-inter text-[10px] text-white/60 uppercase tracking-widest flex items-start gap-3 text-left">
                        <span className="text-blue-500 mt-1">✦</span> {feat}
                      </li>
                    ))}
                  </ul>
                  <a 
                    href={`https://wa.me/916205318620?text=${encodeURIComponent(`Hello! I'm interested in the ${item.plan} plan for SMM Strategy.`)}`}
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
              Making Your Brand <span className="text-white/30">Social</span>
            </h2>
            <div className="prose prose-invert max-w-none font-inter text-white/50 text-[13px] md:text-[15px] leading-[1.8] space-y-8 text-center md:text-left">
              <p>
                In a world where everyone is scrolling, you need to stand out. At Digniteq, we build social pages that people actually stop to look at. We focus on real talk and real results, making sure your brand isn't just another post, but a story people care about.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 mt-12">
                <li className="glass-card p-8 rounded-3xl">
                  <h3 className="text-white text-lg font-black uppercase mb-3">Community Growth</h3>
                  <p>Building a real, engaged following that cares about your brand and what you have to say.</p>
                </li>
                <li className="glass-card p-8 rounded-3xl">
                  <h3 className="text-white text-lg font-black uppercase mb-3">Engaging Posts</h3>
                  <p>Keeping your social media active with high-quality posts that people love to share.</p>
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
