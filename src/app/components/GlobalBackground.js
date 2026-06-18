"use client";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-[#030610] to-purple-900/10"></div>
      
      {/* Mesh & Grid Layer */}
      <div className="absolute inset-0 mesh-gradient opacity-100 scale-110"></div>
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      
      {/* Global Brand Watermark Layer */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-screen">
        <img 
          src="/assets/digni.png" 
          alt="Digniteq Brand Pattern" 
          className="w-full h-full object-cover scale-105"
        />
      </div>
      
      {/* Massive Glow Orbs for depth */}
      <div className="absolute top-[-30%] left-[-30%] w-[160%] h-[160%] bg-blue-600/[0.05] rounded-full blur-[250px]"></div>
      <div className="absolute bottom-[-30%] right-[-30%] w-[160%] h-[160%] bg-purple-600/[0.05] rounded-full blur-[250px]"></div>
      
    </div>
  );
}
