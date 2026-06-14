import React, { useMemo } from "react";
import { motion } from "motion/react";

interface MascotBarnabyProps {
  mood: "happy" | "thinking" | "resting" | "correct" | "incorrect";
  message: string;
  equippedAccessory: string | null;
}

export default function MascotBarnaby({
  mood,
  message,
  equippedAccessory,
}: MascotBarnabyProps) {
  // Eye styling based on mood
  const eyeVariants = useMemo(() => {
    switch (mood) {
      case "happy":
      case "correct":
        return {
          left: (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-800 fill-none stroke-current stroke-[3]">
              <path d="M4 14c2-4 6-4 8 0" strokeLinecap="round" />
            </svg>
          ),
          right: (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-800 fill-none stroke-current stroke-[3]">
              <path d="M12 14c2-4 6-4 8 0" strokeLinecap="round" />
            </svg>
          ),
        };
      case "incorrect":
        return {
          left: (
            <span className="text-xl font-bold text-slate-800 select-none">×</span>
          ),
          right: (
            <span className="text-xl font-bold text-slate-800 select-none">×</span>
          ),
        };
      case "thinking":
        return {
          left: (
            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white -mt-1 -ml-1"></div>
            </div>
          ),
          right: (
            <div className="w-3 h-5 rounded-full bg-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white -mt-2 -ml-0.5"></div>
            </div>
          ),
        };
      case "resting":
      default:
        return {
          left: (
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center transition-all duration-300">
              <div className="w-2 h-2 rounded-full bg-white -mt-1.5 -ml-1.5"></div>
            </div>
          ),
          right: (
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center transition-all duration-300">
              <div className="w-2 h-2 rounded-full bg-white -mt-1.5 -ml-1.5"></div>
            </div>
          ),
        };
    }
  }, [mood]);

  return (
    <div id="barnaby-container" className="flex flex-col md:flex-row items-center gap-4 bg-white/75 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-indigo-100 max-w-2xl mx-auto my-3 relative overflow-visible">
      {/* Absolute floating decorations */}
      <div className="absolute -top-3 -left-3 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md uppercase tracking-wider select-none">
        Math Guide 🦉
      </div>

      {/* Barnaby Character Body */}
      <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center select-none">
        {/* Accessories Layer */}
        
        {/* WIZARD HAT */}
        {equippedAccessory === "wizard_hat" && (
          <motion.div 
            initial={{ scale: 0, y: 15 }} 
            animate={{ scale: 1, y: 0 }} 
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 text-5xl origin-bottom"
          >
            🧙‍♂️
          </motion.div>
        )}

        {/* ROYAL GOLDEN CROWN */}
        {equippedAccessory === "royal_crown" && (
          <motion.div 
            initial={{ scale: 0, y: 15 }} 
            animate={{ scale: 1.1, y: 0 }} 
            className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 text-5xl origin-bottom drop-shadow"
          >
            👑
          </motion.div>
        )}

        {/* EXPLORER HEADPHONES */}
        {equippedAccessory === "explorer_headphones" && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute -top-3 w-28 h-20 border-t-8 border-x-8 border-cyan-500 rounded-t-full z-20 flex justify-between px-0.5 items-end"
          >
            <div className="w-5 h-7 bg-cyan-600 rounded-lg shadow border border-cyan-400"></div>
            <div className="w-5 h-7 bg-cyan-600 rounded-lg shadow border border-cyan-400"></div>
          </motion.div>
        )}

        {/* Outer body circle */}
        <motion.div 
          animate={mood === "correct" ? 
            { y: [0, -15, 0, -10, 0], rotate: [0, 8, -8, 4, 0] } : 
            mood === "incorrect" ? { x: [-5, 5, -5, 5, 0] } : { y: [0, -4, 0] }
          }
          transition={{ duration: mood === "correct" ? 0.6 : mood === "incorrect" ? 0.4 : 3, repeat: mood === "resting" || mood === "thinking" ? Infinity : 0 }}
          className="w-28 h-28 bg-indigo-500 rounded-[50%_50%_45%_45%] relative border-4 border-indigo-700 shadow-lg flex flex-col items-center justify-center"
        >
          {/* Barnaby Ear tufts */}
          <div className="absolute -top-2 left-1 w-6 h-6 bg-indigo-500 border-l-4 border-t-4 border-indigo-700 rounded-tl-xl rotate-[12deg]"></div>
          <div className="absolute -top-2 right-1 w-6 h-6 bg-indigo-500 border-r-4 border-t-4 border-indigo-700 rounded-tr-xl rotate-[-12deg]"></div>

          {/* Golden Chest patch */}
          <div className="absolute bottom-1 w-16 h-12 bg-amber-100 rounded-full border border-amber-200 opacity-90 flex flex-col items-center pt-1 overflow-hidden">
            <span className="text-[10px] text-indigo-400 font-bold tracking-tight">Grade 5</span>
            {/* COMPASS BADGE NECKTIE */}
            {equippedAccessory === "explorer_backpack" && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="text-lg -mt-1"
              >
                🧣
              </motion.div>
            )}
          </div>

          {/* Wing Tufts */}
          <div className="absolute -left-1.5 top-1/3 w-4 h-12 bg-indigo-600 rounded-l-full border-l-2 border-indigo-700 origin-right hover:rotate-[-20deg] transition-transform"></div>
          <div className="absolute -right-1.5 top-1/3 w-4 h-12 bg-indigo-600 rounded-r-full border-r-2 border-indigo-700 origin-left hover:rotate-[20deg] transition-transform"></div>

          {/* Big Owl eyes containers */}
          <div className="flex gap-1.5 z-10 -mt-2">
            {/* Left Eye */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative border border-slate-200">
              {eyeVariants.left}
              {/* DETECTIVE MONOCLE Overlay */}
              {equippedAccessory === "detective_monocle" && (
                <div className="absolute inset-0 border-2 border-amber-400 rounded-full bg-amber-300/10 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20">
                  <div className="absolute right-0 bottom-0 w-3 h-0.5 bg-amber-400 rotate-45 transform origin-right"></div>
                </div>
              )}
            </div>

            {/* Right Eye */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative border border-slate-200">
              {eyeVariants.right}
              {/* COOL SHADES Overlay */}
              {equippedAccessory === "cool_shades" && (
                <div className="absolute -left-12 -top-1.5 w-[96px] h-9 bg-slate-900 rounded-xl border border-slate-700 opacity-95 flex justify-around p-0.5 z-15 shadow-md">
                  <div className="w-9 h-full bg-slate-800/80 rounded-lg"></div>
                  <div className="w-1 border-r border-slate-700"></div>
                  <div className="w-9 h-full bg-slate-800/80 rounded-lg"></div>
                </div>
              )}
            </div>
          </div>

          {/* Yellow Beak */}
          <div className="w-4 h-4 bg-amber-400 border border-amber-500 rounded-b-full z-10 mt-1 origin-top animate-bounce"></div>
        </motion.div>
      </div>

      {/* Conversation Bubble */}
      <div id="speech-bubble" className="flex-1 text-slate-700 relative">
        <div className="bg-indigo-50 border border-indigo-100/80 rounded-2xl p-4 text-sm md:text-base leading-relaxed font-medium shadow-inner relative">
          {/* Talk bubble arrow shape */}
          <div className="absolute top-1/2 -left-3 md:-left-2.5 -translate-y-1/2 w-4 h-4 bg-indigo-50 border-b border-l border-indigo-100/80 rotate-45 hidden md:block"></div>
          <div className="absolute -top-3 left-1/2 md:hidden -translate-x-1/2 w-4 h-4 bg-indigo-50 border-t border-l border-indigo-100/80 rotate-45 block"></div>
          
          <p className="text-slate-800 italic select-all">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
