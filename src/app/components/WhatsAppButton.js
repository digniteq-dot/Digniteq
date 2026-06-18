"use client";

import { motion } from "framer-motion";

export default function WhatsAppButton() {
  const phoneNumber = "916205318620";
  const message = "Hello! I'm interested in your services.";
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
      className="fixed bottom-10 left-10 z-[100]"
    >
      <a 
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl hover:bg-white hover:border-white transition-all duration-500 overflow-hidden"
      >
        {/* Pulse Effect */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl animate-ping group-hover:hidden"></div>
        
        {/* WhatsApp Icon (Simplified SVG) */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6 fill-white group-hover:fill-black transition-colors duration-500 relative z-10"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.984-.365-1.739-.757-2.874-2.513-2.96-2.63-.086-.116-.694-.921-.694-1.758 0-.837.446-1.248.605-1.414.159-.166.346-.208.461-.208.116 0 .231 0 .332.005.107.004.252-.041.396.301.144.342.491 1.196.534 1.282.043.087.072.188.014.302-.058.115-.087.188-.173.289l-.26.302c-.087.101-.18.21-.079.382.101.173.446.735.956 1.19.658.584 1.21.765 1.382.852.173.087.274.072.375-.043.101-.115.432-.504.548-.677.116-.172.231-.144.389-.086.158.058 1.001.472 1.174.558.173.087.288.13.332.202.043.072.043.419-.101.824z"/>
        </svg>

        {/* Hover Label */}
        <div className="absolute left-full ml-4 py-2 px-4 bg-white text-black font-sans-premium text-[8px] font-black uppercase tracking-widest rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 whitespace-nowrap pointer-events-none shadow-xl border border-white/20">
          Chat with us
        </div>
      </a>
    </motion.div>
  );
}
