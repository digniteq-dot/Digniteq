"use client";

import { useState, useEffect } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setActive(true);
    };
    const handleMouseLeave = () => setActive(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div 
        className="custom-cursor hidden md:block" 
        style={{ 
          left: position.x, 
          top: position.y, 
          opacity: active ? 1 : 0,
          transition: "opacity 0.3s ease"
        }}
      />
      <div 
        className="custom-cursor-outline hidden md:block" 
        style={{ 
          left: position.x, 
          top: position.y, 
          opacity: active ? 1 : 0,
          transition: "opacity 0.3s ease, transform 0.15s ease-out"
        }}
      />
    </>
  );
}
