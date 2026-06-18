"use client";

import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { apiFetch } from "../utils/api";

export default function ContactForm() {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // Gather form data
    const formData = new FormData(form.current);
    const payload = {
      name: formData.get("user_name"),
      email: formData.get("user_email"),
      phone: formData.get("user_phone"),
      message: formData.get("message"),
    };

    let backendSuccess = false;

    // 1. Post to backend API
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      backendSuccess = true;
    } catch (error) {
      console.error("Backend Contact Submission Error:", error);
    }

    // 2. Fallback or parallel EmailJS send if configured
    const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
      try {
        await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY);
      } catch (error) {
        console.error("EmailJS Error:", error);
      }
    }

    setLoading(false);
    if (backendSuccess) {
      setStatus({ 
        type: "success", 
        message: "MISSION SUCCESSFUL. OUR TEAM WILL CONTACT YOU SHORTLY." 
      });
      form.current.reset();
    } else {
      setStatus({ 
        type: "error", 
        message: "CONNECTION FAILED. PLEASE TRY AGAIN OR EMAIL DIRECTLY." 
      });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pt-16 md:pt-24 pb-4 px-10 md:px-20 lg:px-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        
        {/* Left Side: Branding & Heading */}
        <div className="flex flex-col animate-reveal">
          <div className="mb-0">
            <span className="font-sans-premium text-[8px] font-black tracking-[0.4em] text-white/10 uppercase mb-20 block">SECURE CHANNEL</span>
            
            <div className="relative">
              <h2 className="font-serif-premium text-[clamp(4rem,12vw,8.5rem)] leading-[0.88] text-white uppercase tracking-[-0.04em]">
                LET'S <br />
                <span className="pl-16 md:pl-32 block whitespace-nowrap">GET IN</span>
                <span className="text-white/20">TOUCH</span>
              </h2>
              
              {/* Stylized Graphic - Positioned relative to heading */}
              <div className="absolute top-[0%] left-[80%] w-20 h-20 pointer-events-none opacity-60">
                <div className="absolute top-0 left-0 w-8 h-8 bg-white rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-16 h-8 border border-white/20 rounded-b-full"></div>
                <div className="absolute top-4 left-12 w-px h-16 bg-white/10 -rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Minimal Form */}
        <div className="flex flex-col animate-reveal delay-200 lg:-translate-y-10">
          <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-10">
            
            <div className="relative group">
              <label className="font-sans-premium text-[8px] font-black text-white/40 uppercase tracking-widest absolute -top-5 left-0 transition-all group-focus-within:text-white">Full Name</label>
              <input 
                type="text" 
                name="user_name" 
                required 
                className="w-full bg-transparent border-b border-white/20 py-3 font-inter text-xs md:text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-transparent"
              />
              <div className="absolute right-0 bottom-3 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="relative group">
                <label className="font-sans-premium text-[8px] font-black text-white/40 uppercase tracking-widest absolute -top-5 left-0 transition-all group-focus-within:text-white">Email</label>
                <input 
                  type="email" 
                  name="user_email" 
                  required 
                  className="w-full bg-transparent border-b border-white/20 py-3 font-inter text-xs md:text-sm text-white focus:outline-none focus:border-white transition-all"
                />
                <div className="absolute right-0 bottom-3 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
              </div>
              <div className="relative group">
                <label className="font-sans-premium text-[8px] font-black text-white/40 uppercase tracking-widest absolute -top-5 left-0 transition-all group-focus-within:text-white">Phone</label>
                <input 
                  type="tel" 
                  name="user_phone" 
                  className="w-full bg-transparent border-b border-white/20 py-3 font-inter text-xs md:text-sm text-white focus:outline-none focus:border-white transition-all"
                />
                <div className="absolute right-0 bottom-3 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
              </div>
            </div>

            <div className="relative group">
              <label className="font-sans-premium text-[8px] font-black text-white/40 uppercase tracking-widest absolute -top-5 left-0 transition-all group-focus-within:text-white">Message</label>
              <textarea 
                name="message" 
                required 
                rows="1"
                className="w-full bg-transparent border-b border-white/20 py-3 font-inter text-xs md:text-sm text-white focus:outline-none focus:border-white transition-all resize-none overflow-hidden"
              ></textarea>
              <div className="absolute right-0 bottom-3 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
            </div>

            {/* Submission Status & Arrow Button */}
            <div className="flex items-center justify-between mt-6">
               <div className="max-w-[150px]">
                  {status.message && (
                    <span className={`text-[7px] font-black uppercase tracking-widest ${status.type === "success" ? "text-green-500/60" : "text-red-500/60"}`}>
                      {status.message}
                    </span>
                  )}
               </div>

               <button 
                type="submit" 
                disabled={loading}
                className={`group flex items-center gap-6 transition-all ${loading ? 'opacity-50' : 'hover:gap-8'}`}
               >
                 <span className="font-sans-premium text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white/50 transition-colors">
                   {loading ? "Sending" : "Send"}
                 </span>
                 <div className="text-3xl md:text-4xl text-white/60 font-light group-hover:translate-x-2 transition-transform duration-500">
                   →
                 </div>
               </button>
            </div>
          </form>
          
          <div className="mt-12 pt-10 border-t border-white/5 flex flex-col items-start gap-4 animate-reveal delay-500">
            <span className="font-sans-premium text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Alternative Channel</span>
            <a 
              href="https://wa.me/916205318620?text=Hello!%20I'd%20like%20to%20chat%20about%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 py-2 px-6 rounded-full bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500 hover:border-blue-500 transition-all duration-500"
            >
              <span className="font-sans-premium text-[9px] font-black text-blue-500 group-hover:text-white uppercase tracking-widest transition-colors">
                Let's Talk
              </span>
              <span className="text-blue-500 group-hover:text-white transition-colors group-hover:translate-x-1 transition-transform">➔</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
