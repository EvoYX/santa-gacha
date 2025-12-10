import React, { useState, useEffect } from "react";
import { Button, Modal } from "../components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { LockClosedIcon, StarIcon } from "@heroicons/react/24/solid";
import { ArcadeMachine } from "../components/ArcadeMachine";
import {
  getParticipants,
  getSettings,
  drawRandomUnclaimed,
  toggleClaim,
} from "../apis/api";
import type { Participant, DrawState } from "../types";

// Inner component for the capsule opening sequence
const PrizeReveal = ({
  participant,
  onReset,
}: {
  participant: Participant;
  onReset: () => void;
}) => {
  const [step, setStep] = useState<"closed" | "open">("closed");

  useEffect(() => {
    // Automatically open after a brief shake
    const timer = setTimeout(() => setStep("open"), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-4 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
      {/* Christmas bg pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(#ef4444 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <AnimatePresence mode="wait">
        {step === "closed" ? (
          <motion.div
            key="capsule"
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              rotate: [0, -10, 10, -10, 10, 0], // Shake
            }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 0.8,
              rotate: { delay: 0.5, duration: 0.5 },
            }}
            className="w-48 h-48 rounded-full shadow-2xl relative cursor-pointer"
            onClick={() => setStep("open")}
          >
            {/* Big Capsule Visual */}
            <div className="w-full h-1/2 bg-red-500 rounded-t-full border-b-8 border-yellow-400 relative z-10 flex items-end justify-center">
              <div className="absolute top-4 left-6 w-12 h-8 bg-white/30 rounded-full rotate-[-15deg]" />
            </div>
            <div className="w-full h-1/2 bg-white rounded-b-full relative z-0 shadow-inner" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-slate-200 shadow-md z-20" />

            <motion.div
              className="absolute -bottom-12 left-0 right-0 text-center text-slate-400 font-bold uppercase tracking-widest text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1 } }}
            >
              Opening...
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="prize"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-block p-6 rounded-full bg-gradient-to-tr from-green-400 to-green-600 shadow-xl mb-6 scale-110 ring-4 ring-green-100">
              <span className="text-6xl filter drop-shadow-md">🎁</span>
            </div>

            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
              Your Match Is
            </h2>
            <h1 className="text-5xl font-black text-slate-800 mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              {participant.name}
            </h1>

            <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 mx-2 mb-8 relative w-full max-w-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-red-200 text-xs font-bold text-red-400 uppercase">
                Their Wish
              </div>
              <p className="text-2xl text-slate-700 font-medium leading-relaxed italic">
                "{participant.wishlist}"
              </p>
            </div>

            <Button
              onClick={onReset}
              size="lg"
              className="w-full rounded-xl h-14 text-lg font-bold bg-green-600 hover:bg-green-700 max-w-sm"
            >
              Draw Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GachaPage: React.FC = () => {
  const [state, setState] = useState<DrawState>("idle");
  const [result, setResult] = useState<Participant | null>(null);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(5);
  const [isLocked, setIsLocked] = useState(true);

  // Rolling name animation state
  const [rollingName, setRollingName] = useState("???");
  const [allNames, setAllNames] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getParticipants(), getSettings()]).then(([p, s]) => {
      setCount(p.length);
      setTarget(s.targetCount);
      // Only lock if we don't have enough people AND we are currently idle/empty
      setIsLocked(p.length < s.targetCount);
      setAllNames(p.filter((x) => !x.isClaimed).map((x) => x.name));
    });
  }, [state]);

  const handleDraw = async () => {
    if (isLocked) return;
    if (allNames.length === 0) {
      setState("empty");
      return;
    }

    setState("drawing");

    // Rolling Animation
    const interval = setInterval(() => {
      const random = allNames[Math.floor(Math.random() * allNames.length)];
      setRollingName(random);
    }, 80);

    // Simulate delay for spin
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const winner = await drawRandomUnclaimed();
      clearInterval(interval);

      if (!winner) {
        setState("empty");
      } else {
        setResult(winner);
        // We do NOT toggle claim yet. Wait until they open it?
        // Or toggle it now to prevent races. Let's toggle now.
        await toggleClaim(winner.id, true);

        // Change state to dropped so the ball appears in the chute
        setState("dropped");
      }
    } catch (e) {
      console.error(e);
      clearInterval(interval);
      setState("idle");
    }
  };

  const handleCapsuleClick = () => {
    if (state === "dropped") {
      setState("revealed");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setRollingName("???");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] relative py-8">
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-[2rem] shadow-2xl border-4 border-red-100 max-w-sm"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
              <LockClosedIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Workshop Locked
            </h2>
            <div className="my-4 relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
              />
            </div>
            <p className="text-slate-500 font-medium">
              Waiting for more elves...
              <br />
              <span className="text-red-500 font-bold">{count}</span> of{" "}
              <span className="text-slate-800 font-bold">{target}</span> joined
            </p>
            <Button
              onClick={() => (window.location.hash = "#/participants")}
              className="mt-6 w-full h-12 text-lg rounded-xl bg-red-500 hover:bg-red-600"
            >
              Invite More
            </Button>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-5xl font-black text-red-600 tracking-tight drop-shadow-sm font-serif italic">
          Merry Gacha
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-xs mt-1 uppercase">
          Draw your secret santa
        </p>
      </div>

      {/* Machine */}
      <div className="relative mb-8 z-10 scale-90 sm:scale-100">
        <ArcadeMachine
          state={state}
          rollingName={rollingName}
          onCapsuleClick={handleCapsuleClick}
        />
      </div>

      {/* Main Action Button */}
      <div className="w-full max-w-xs z-30 h-16">
        <AnimatePresence mode="wait">
          {state === "idle" && !isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button
                onClick={handleDraw}
                className="w-full py-7 text-xl rounded-2xl shadow-xl shadow-red-500/30 bg-red-500 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-red-800 font-black tracking-wide text-white"
              >
                START DRAW
              </Button>
            </motion.div>
          )}
          {state === "dropped" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-slate-400 font-bold animate-bounce text-sm">
                Click the ball to open!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reveal Modal */}
      <Modal isOpen={state === "revealed"} onClose={reset}>
        {result && <PrizeReveal participant={result} onReset={reset} />}
      </Modal>
    </div>
  );
};

export default GachaPage;
