"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const PROJECTS = [
  {
    id: 1,
    title: "Lumina Boutique",
    category: "Web Design",
    image: "/assets/portfolio/web-design.png",
    description: "A high-end e-commerce experience for a luxury fashion brand."
  },
  {
    id: 2,
    title: "Aura Identity",
    category: "Branding",
    image: "/assets/portfolio/branding.png",
    description: "Complete brand redesign and visual identity system."
  },
  {
    id: 3,
    title: "Vibe Social",
    category: "SMM Strategy",
    image: "/assets/portfolio/social-media.png",
    description: "Data-driven social media growth strategy for a lifestyle brand."
  },
  {
    id: 4,
    title: "Growth Metrics",
    category: "SEO Strategy",
    image: "/assets/portfolio/seo.png",
    description: "Dominating search results for a global tech consultancy."
  },
  {
    id: 5,
    title: "Ethos Watch",
    category: "Web Design",
    image: "/assets/portfolio/web-design.png",
    description: "Minimalist portfolio for an architectural firm."
  },
  {
    id: 6,
    title: "Nexus Brand",
    category: "Branding",
    image: "/assets/portfolio/branding.png",
    description: "Modern identity for a next-gen software house."
  }
];

const CATEGORIES = ["All", "Web Design", "SEO Strategy", "SMM Strategy", "Branding"];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [projects, setProjects] = useState(PROJECTS);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await apiFetch("/portfolio");
        if (data && data.length > 0) {
          const mapped = data.map(p => ({
            id: p._id,
            title: p.title,
            category: p.cat || p.category,
            image: p.img || p.image,
            description: p.desc || p.description,
            order: p.order || 0
          })).sort((a, b) => a.order - b.order);
          setProjects(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch portfolio projects, using fallbacks.");
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);


  return (
    <div className="flex flex-col min-h-screen relative font-inter bg-transparent">
      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-6 -translate-y-20 md:-translate-y-28">
          {/* Background Text Layer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
             <div className="font-serif-premium text-[40vw] leading-none uppercase translate-y-20">WORK</div>
          </div>

          <div className="max-w-[1400px] mx-auto w-full relative z-20 flex flex-col items-center text-center">
            {/* Top Floating Token */}
            <div className="mb-12 animate-reveal">
              <span className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 px-6 py-2 rounded-full font-sans-premium text-[9px] font-black tracking-[0.5em] text-blue-500 uppercase">
                Collection // Selected_Works_02
              </span>
            </div>

            <div className="max-w-4xl">
              <h1 className="font-serif-premium text-[clamp(3.5rem,12vw,10rem)] leading-[0.85] text-white uppercase tracking-[-0.04em] mb-12 text-glow-premium animate-reveal delay-100">
                OUR <br />
                <span className="text-gradient-premium">PORTFOLIO</span>
              </h1>
              
              <div className="flex flex-col items-center gap-8 mb-16 animate-reveal delay-200">
                <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <p className="font-inter text-xs md:text-sm text-white/40 leading-[2.2] max-w-2xl uppercase tracking-[0.25em]">
                  A curated collection of digital experiences engineered for growth and aesthetic excellence.
                </p>
              </div>

              {/* Refined Filters */}
              <div className="flex flex-wrap justify-center gap-4 animate-reveal delay-300">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-3 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat 
                        ? "bg-white text-black border-white shadow-xl shadow-white/10 scale-105" 
                        : "bg-white/[0.03] text-white/40 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
            <span className="text-xl">↓</span>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6">
          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <div 
                key={project.id}
                className="group glass-card rounded-[32px] overflow-hidden flex flex-col animate-reveal"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030610] via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest text-white">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans-premium text-lg font-black text-white uppercase tracking-tight mb-2.5 group-hover:text-blue-500 transition-colors">
                      {project.title}
                    </h3>
                    <p className="font-inter text-[9px] text-white/30 leading-relaxed uppercase tracking-wide">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-2 font-sans-premium text-[8px] font-black text-white uppercase tracking-widest group-hover:gap-4 transition-all">
                    View Project <span className="text-blue-500">➔</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
