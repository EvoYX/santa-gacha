import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MusicalNoteIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import type { DrawState } from "../types";

const SantaHat = () => (
  <motion.div
    initial={{ rotate: -5 }}
    animate={{ rotate: 5 }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    }}
    className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-32 z-30 pointer-events-none"
  >
    {/* Pom Pom */}
    <div className="absolute top-0 right-2 w-10 h-10 bg-white rounded-full shadow-md z-20" />
    {/* Hat Body */}
    <svg
      viewBox="0 0 100 100"
      className="absolute top-4 left-0 w-full h-full drop-shadow-lg"
    >
      <path d="M10,90 Q50,-10 90,90" fill="#dc2626" />
    </svg>
    {/* White Fur Brim */}
    <div className="absolute bottom-0 w-full h-10 bg-white rounded-full shadow-sm z-20 border-b-4 border-slate-100" />
  </motion.div>
);

const FallingSnow = () => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -20, x: Math.random() * 200, opacity: 0 }}
        animate={{ y: 300, x: Math.random() * 200 - 50, opacity: [0, 1, 0] }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "linear",
        }}
        className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
      />
    ))}
  </div>
);

const BouncingBalls = () => {
  // Array of colors for the balls
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-purple-400",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-8 h-8 rounded-full border-2 border-white/30 shadow-inner ${
            colors[i % colors.length]
          }`}
          initial={{
            x: Math.random() * 250,
            y: 300, // Start below
          }}
          animate={{
            x: [null, Math.random() * 250],
            y: [300, Math.random() * 100, 300], // Bounce up and down
            rotate: [0, 360],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            ease: "circOut", // Bouncy feel
            delay: Math.random() * 0.2,
          }}
        >
          {/* Shine on ball */}
          <div className="absolute top-1 left-2 w-2 h-2 bg-white/40 rounded-full" />
        </motion.div>
      ))}
    </div>
  );
};

// CSS-only Gacha Ball for the chute
const GachaBall = ({ onClick }: { onClick?: () => void }) => (
  <motion.div
    layoutId="gacha-capsule" // Shared layout ID for potential transitions
    onClick={onClick}
    initial={{ y: -150, rotate: -180 }}
    animate={{ y: 0, rotate: 0 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    className="w-14 h-14 rounded-full z-20 shadow-xl flex flex-col items-center justify-center overflow-hidden cursor-pointer relative group"
    whileHover={{ scale: 1.1, rotate: 10 }}
    whileTap={{ scale: 0.9 }}
  >
    {/* Top Half */}
    <div className="w-full h-1/2 bg-red-500 border-b-4 border-yellow-400 relative z-10">
      {/* Highlight */}
      <div className="absolute top-1 left-2 w-3 h-2 bg-white/40 rounded-full rotate-[-15deg]" />
    </div>
    {/* Bottom Half */}
    <div className="w-full h-1/2 bg-white relative z-0" />

    {/* Button/Lock mechanism detail */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-200 shadow-sm z-20" />

    {/* Glow on hover */}
    <div className="absolute inset-0 rounded-full ring-2 ring-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

interface ArcadeMachineProps {
  state: DrawState;
  rollingName: string;
  onCapsuleClick?: () => void;
}

export const ArcadeMachine: React.FC<ArcadeMachineProps> = ({
  state,
  rollingName,
  onCapsuleClick,
}) => {
  const isDrawing = state === "drawing";

  return (
    <div className="relative w-80 h-[520px] mx-auto select-none pt-12">
      <SantaHat />

      {/* MACHINE BODY - Christmas Red */}
      <div className="w-full h-full bg-red-600 rounded-[2.5rem] p-5 shadow-2xl border-b-[12px] border-r-[4px] border-red-800 relative flex flex-col z-10 ring-4 ring-yellow-400">
        {/* Snow on top */}
        <div className="absolute -top-2 left-8 w-16 h-8 bg-white rounded-b-full z-20 opacity-90 shadow-sm" />
        <div className="absolute -top-1 right-8 w-10 h-6 bg-white rounded-b-full z-20 opacity-90 shadow-sm" />

        {/* --- TOP SCREEN AREA --- */}
        <div className="bg-slate-900 rounded-[1.5rem] p-3 h-72 w-full relative overflow-hidden border-4 border-green-700 shadow-inner ring-4 ring-white">
          {/* Decorative Lights around screen */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_5px_red]"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_lime]"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_5px_yellow]"
            />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-800 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
            {/* Falling Snow bg */}
            <FallingSnow />

            <AnimatePresence mode="wait">
              {state === "idle" && (
                <motion.div
                  key="idle-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center z-10 space-y-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-6xl filter drop-shadow-md"
                  >
                    🦌
                  </motion.div>
                  <div className="text-white font-black text-xl tracking-wider uppercase drop-shadow-md font-sans">
                    Santa's
                    <br />
                    Gacha
                  </div>
                  <div className="text-green-300 text-xs font-bold bg-green-900/50 px-3 py-1 rounded-full border border-green-700">
                    Press Start
                  </div>
                </motion.div>
              )}

              {state === "drawing" && (
                <motion.div
                  key="drawing-screen"
                  className="z-10 w-full h-full flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-[2px]"
                >
                  {/* Bouncing Balls in background of screen */}
                  <BouncingBalls />

                  {/* Name overlay */}
                  <motion.div
                    className="text-4xl font-black text-white text-center break-words px-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-10"
                    animate={{ scale: [0.9, 1.1], opacity: [0.8, 1] }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                  >
                    {rollingName}
                  </motion.div>
                </motion.div>
              )}

              {state === "dropped" && (
                <motion.div
                  key="dropped-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="z-10 text-center"
                >
                  <div className="text-white font-bold text-lg animate-bounce">
                    👇 Collect 👇
                  </div>
                </motion.div>
              )}

              {state === "revealed" && (
                <motion.div
                  key="winner-screen"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="z-10 flex flex-col items-center"
                >
                  <StarIconSolid className="w-16 h-16 text-yellow-300 animate-spin-slow drop-shadow-[0_0_10px_gold]" />
                  <div className="text-white font-bold text-2xl mt-2 animate-pulse">
                    NICE LIST!
                  </div>
                </motion.div>
              )}

              {state === "empty" && (
                <div className="z-10 text-white/50 font-mono text-center px-4">
                  SACK IS EMPTY
                  <br />
                  Try Next Year
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- CONTROL PANEL AREA --- */}
        <div className="mt-4 flex-1 bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-inner relative overflow-hidden border-t-4 border-slate-100">
          {/* Decorative sticker */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-green-600 font-bold tracking-widest uppercase bg-green-100 px-2 rounded-b-md">
            North Pole Mfg.
          </div>

          {/* Left: Candy Cane Slot */}
          <div className="flex flex-col gap-2 items-center">
            <div className="w-3 h-10 bg-red-100 rounded-full border border-red-200 overflow-hidden flex flex-col items-center justify-center">
              <div className="w-full h-2 bg-red-400 -rotate-45 mb-1" />
              <div className="w-full h-2 bg-red-400 -rotate-45" />
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200 shadow-sm">
              <MusicalNoteIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>

          {/* Center: The Golden Ornament Knob */}
          <div className="relative">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-[4px] border-yellow-600 shadow-lg flex items-center justify-center z-10 relative cursor-pointer active:scale-95 transition-transform"
              animate={isDrawing ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 0.5,
                repeat: isDrawing ? Infinity : 0,
                ease: "linear",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-white/40" />
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center">
                {/* Snowflake Icon on Knob */}
                <SparklesIcon className="w-12 h-12 text-yellow-100 opacity-80" />
              </div>
              {/* Shine */}
              <div className="absolute top-4 left-4 w-6 h-6 bg-white/60 rounded-full blur-[2px]" />
            </motion.div>
          </div>

          {/* Right: Prize Chute */}
          <div className="w-16 h-16 bg-slate-800 rounded-full border-[6px] border-slate-300 shadow-inner flex items-center justify-center overflow-visible relative">
            <div className="absolute inset-0 bg-black/40 rounded-full pointer-events-none z-10" />
            <AnimatePresence>
              {state === "dropped" && <GachaBall onClick={onCapsuleClick} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Machine Feet - Boots? */}
      <div className="absolute bottom-[-10px] left-8 w-12 h-8 bg-black rounded-b-xl -z-10 border-t-4 border-white" />
      <div className="absolute bottom-[-10px] right-8 w-12 h-8 bg-black rounded-b-xl -z-10 border-t-4 border-white" />
    </div>
  );
};
