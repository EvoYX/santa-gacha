import React, { useState, useEffect } from "react";
import { Participant, DrawState } from "../types";
import {
  Button,
  Modal,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockClosedIcon,
  EyeIcon,
  UserCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { ArcadeMachine } from "../components/ArcadeMachine";
import {
  getParticipants,
  getSettings,
  getParticipantById,
  drawRandomUnclaimed,
  toggleClaim,
  recordDraw,
} from "../apis/api";

const PrizeReveal = ({
  participant,
  onReset,
  isReplay,
}: {
  participant: Participant;
  onReset: () => void;
  isReplay: boolean;
}) => {
  const [step, setStep] = useState<"closed" | "open">("closed");

  useEffect(() => {
    const timer = setTimeout(() => setStep("open"), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-4 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
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
              {isReplay ? "Opening again..." : "Opening..."}
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
              <div className="max-h-60 overflow-y-auto scrollbar-hide">
                <p className="text-2xl text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">
                  "{participant.wishlist}"
                </p>
              </div>
            </div>

            {/* This is the ONLY close button we want. The modal wrapper button will be hidden. */}
            <Button
              onClick={onReset}
              size="lg"
              className="w-full rounded-xl h-14 text-lg font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 max-w-sm"
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PinEntryModal = ({
  user,
  onClose,
  onSuccess,
}: {
  user: Participant;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    if (pin === user.pin) {
      onSuccess();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden"
      >
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">Enter PIN</h3>
          <p className="text-slate-500 text-sm">for {user.name}</p>
        </div>
        <div className="p-6">
          {/* PIN Display */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  i < pin.length
                    ? "bg-slate-800 border-slate-800"
                    : error
                    ? "border-red-300 bg-red-50"
                    : "border-slate-300"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-500 text-xs font-bold -mt-4 mb-4">
              Incorrect PIN
            </p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num.toString())}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xl text-slate-700 transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={onClose}
              className="h-14 rounded-xl bg-slate-50 hover:bg-red-50 font-bold text-sm text-red-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xl text-slate-700 transition-colors active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition-colors active:scale-95 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={pin.length !== 4}
            className="w-full mt-6 h-12 text-lg"
          >
            Unlock
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const UserSelectionStep = ({
  participants,
  onSelect,
}: {
  participants: Participant[];
  onSelect: (p: Participant) => void;
}) => {
  const [filter, setFilter] = useState("");
  const [selectedForAuth, setSelectedForAuth] = useState<Participant | null>(
    null
  );

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAuthSuccess = () => {
    if (selectedForAuth) {
      onSelect(selectedForAuth);
      setSelectedForAuth(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md min-w-[300px] h-[80vh] flex flex-col shadow-2xl border-2 border-slate-200 bg-white relative">
        <CardHeader className="text-center pb-4 bg-slate-50/50 border-b border-slate-100">
          <div className="mx-auto w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3 ring-4 ring-red-50">
            <UserCircleIcon className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl text-slate-800 font-bold">
            Who are you?
          </CardTitle>
          <p className="text-slate-500 text-sm mt-1">
            Select your name to see your match
          </p>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search your name..."
              className="w-full p-3 pl-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none transition-all shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center">
              <p>No names found</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter("")}
                className="mt-2 text-red-400"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            filtered.map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedForAuth(p)}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all shadow-sm group"
              >
                <span className="font-bold text-slate-700 group-hover:text-red-600 text-lg">
                  {p.name}
                </span>
                {p.drawnMatchId ? (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">
                    View Match
                  </span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full group-hover:bg-red-100 group-hover:text-red-500 font-medium">
                    Locked
                  </span>
                )}
              </motion.button>
            ))
          )}
        </CardContent>
      </Card>

      {selectedForAuth && (
        <PinEntryModal
          user={selectedForAuth}
          onClose={() => setSelectedForAuth(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

const GachaPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [state, setState] = useState<DrawState>("idle");
  const [result, setResult] = useState<Participant | null>(null);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(5);
  const [isLocked, setIsLocked] = useState(true);
  const [rollingName, setRollingName] = useState("???");

  // Dynamic scaling state
  const [scale, setScale] = useState(1);

  // Auto-scale Logic to fit machine between header and footer
  useEffect(() => {
    const calculateScale = () => {
      const h = window.innerHeight;
      const w = window.innerWidth;

      // Approximate heights taken by other UI elements
      // Header ~100px, Footer ~100px, Padding ~40px = 240px reserved.
      const reservedHeight = 250;
      const availableHeight = h - reservedHeight;

      // Base dimensions of ArcadeMachine
      const baseHeight = 520;
      const baseWidth = 320;

      // Calculate max scale based on height available
      // Don't go below 0.4 to prevent it becoming too tiny
      const heightScale = Math.max(0.4, availableHeight / baseHeight);

      // Calculate max scale based on width available (with padding)
      const widthScale = Math.max(0.4, (w - 40) / baseWidth);

      // Use the smaller scale to ensure it fits in both dimensions
      // Cap at 1.1 for large screens
      const finalScale = Math.min(heightScale, widthScale, 1.1);

      setScale(finalScale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  const loadData = async () => {
    const [p, s] = await Promise.all([getParticipants(), getSettings()]);
    setParticipants(p);
    setCount(p.length);
    setTarget(s.targetCount);
    setIsLocked(p.length < s.targetCount);
    return p;
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserSelect = async (user: Participant) => {
    setCurrentUser(user);
    if (user.drawnMatchId) {
      const match = await getParticipantById(user.drawnMatchId);
      setResult(match);
    }
  };

  const handleDraw = async () => {
    if (isLocked || !currentUser) return;
    if (currentUser.drawnMatchId) {
      setState("revealed");
      return;
    }
    const possibleNames = participants
      .filter((p) => !p.isClaimed && p.id !== currentUser.id)
      .map((x) => x.name);

    if (possibleNames.length === 0) {
      setState("empty");
      return;
    }
    setState("drawing");
    const interval = setInterval(() => {
      const random =
        possibleNames[Math.floor(Math.random() * possibleNames.length)];
      setRollingName(random);
    }, 80);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const winner = await drawRandomUnclaimed(currentUser.id);
      clearInterval(interval);
      if (!winner) {
        setState("empty");
      } else {
        setResult(winner);
        await toggleClaim(winner.id, true);
        await recordDraw(currentUser.id, winner.id);
        setCurrentUser({ ...currentUser, drawnMatchId: winner.id });
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
    setRollingName("???");
  };

  const handleBackToSelection = () => {
    setCurrentUser(null);
    setResult(null);
    setState("idle");
    loadData();
  };

  const hasDrawn = !!currentUser?.drawnMatchId;
  const showLockedScreen = isLocked && !hasDrawn;

  if (!currentUser) {
    return (
      <div className="h-[100dvh] w-full bg-background relative overflow-hidden">
        <UserSelectionStep
          participants={participants}
          onSelect={handleUserSelect}
        />
        <div className="fixed inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none filter blur-sm">
          <div style={{ transform: `scale(${scale})` }}>
            <ArcadeMachine state={"idle"} rollingName={"???"} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-between relative bg-background overflow-y-auto overflow-x-hidden">
      {/* 1. Header Area */}
      <div className="flex-none w-full flex flex-col items-center pt-2 px-4 z-10 min-h-[100px]">
        <div className="w-full flex justify-start mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSelection}
            className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white pr-4 shadow-sm border border-white/50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Not {currentUser.name}?
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-red-600 tracking-tight drop-shadow-sm font-serif italic">
            Merry Gacha
          </h1>
          <p className="text-slate-400 font-bold tracking-widest text-xs mt-1 uppercase">
            Hello,{" "}
            <span className="text-slate-800 border-b-2 border-red-200">
              {currentUser.name}
            </span>
          </p>
        </div>
      </div>

      {/* Locked Overlay */}
      {showLockedScreen && (
        <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl border-4 border-red-100 w-[90%] max-w-sm mx-auto"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-red-400">
              <LockClosedIcon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Workshop Locked
            </h2>
            <div className="my-4 relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
              />
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium">
              Waiting for more elves...
              <br />
              <span className="text-red-500 font-bold">{count}</span> of{" "}
              <span className="text-slate-800 font-bold">{target}</span> joined
            </p>
            <Button
              onClick={() => (window.location.hash = "#/join")}
              className="mt-6 w-full h-12 text-lg rounded-xl bg-red-500 hover:bg-red-600"
            >
              Invite More
            </Button>
          </motion.div>
        </div>
      )}

      {/* 2. Machine Area - Dynamically Scaled */}
      <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
        <div
          className="flex items-center justify-center transition-all duration-300 ease-out"
          style={{
            width: 320 * scale,
            height: 520 * scale,
          }}
        >
          <div
            style={{ transform: `scale(${scale})` }}
            className="origin-center"
          >
            <ArcadeMachine
              state={state}
              rollingName={rollingName}
              onCapsuleClick={handleCapsuleClick}
            />
          </div>
        </div>
      </div>

      {/* 3. Button Area */}
      <div className="flex-none w-full px-6 z-20 flex justify-center pb-20 md:pb-8 min-h-[100px]">
        <div className="w-full max-w-[200px]">
          <AnimatePresence mode="wait">
            {state === "idle" && !showLockedScreen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {hasDrawn ? (
                  <Button
                    onClick={() => setState("revealed")}
                    className="w-full py-6 text-xl rounded-2xl shadow-xl shadow-green-500/30 bg-green-500 hover:bg-green-600 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-green-800 font-black tracking-wide text-white"
                  >
                    <EyeIcon className="w-6 h-6 mr-2" />
                    VIEW MATCH
                  </Button>
                ) : (
                  <Button
                    onClick={handleDraw}
                    className="w-full py-6 text-xl rounded-2xl shadow-xl shadow-red-500/30 bg-red-500 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-red-800 font-black tracking-wide text-white"
                  >
                    START
                  </Button>
                )}
              </motion.div>
            )}
            {state === "dropped" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-slate-400 font-bold animate-bounce text-sm bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm">
                  Click the ball to open!
                </p>
              </motion.div>
            )}
            {state === "empty" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-slate-500 font-bold text-sm mb-1">Oh no!</p>
                <p className="text-slate-400 text-xs mb-2 max-w-[200px] mx-auto leading-tight">
                  No eligible matches found. You might be the last one left, or
                  all remaining gifts are claimed!
                </p>
                <Button
                  onClick={() => setState("idle")}
                  size="sm"
                  variant="outline"
                >
                  Back
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        isOpen={state === "revealed"}
        onClose={reset}
        hideCloseButton={true}
      >
        {result && (
          <PrizeReveal
            participant={result}
            onReset={reset}
            isReplay={hasDrawn}
          />
        )}
      </Modal>
    </div>
  );
};

export default GachaPage;
