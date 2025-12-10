import React, { useState, useEffect } from "react";
import { Participant, DrawState } from "../types";
import { ParticipantCard } from "../components/ParticipantCard";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
} from "../components/ui";
import {
  Cog6ToothIcon,
  LinkIcon,
  CheckIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { ArcadeMachine } from "../components/ArcadeMachine";
import {
  getParticipants,
  getSettings,
  updateSettings,
  deleteParticipant,
  toggleClaim,
} from "../apis/api";

// Duplicate PrizeReveal for simulator
const SimPrizeReveal = ({
  participant,
  onReset,
}: {
  participant: Participant;
  onReset: () => void;
}) => {
  const [step, setStep] = useState<"closed" | "open">("closed");

  useEffect(() => {
    const timer = setTimeout(() => setStep("open"), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-4 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
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
            className="w-32 h-32 rounded-full shadow-2xl relative cursor-pointer"
            onClick={() => setStep("open")}
          >
            <div className="w-full h-1/2 bg-red-500 rounded-t-full border-b-4 border-yellow-400 relative z-10 flex items-end justify-center">
              <div className="absolute top-3 left-4 w-8 h-5 bg-white/30 rounded-full rotate-[-15deg]" />
            </div>
            <div className="w-full h-1/2 bg-white rounded-b-full relative z-0 shadow-inner" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-slate-200 shadow-md z-20" />
          </motion.div>
        ) : (
          <motion.div
            key="prize"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-full space-y-4"
          >
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="text-xs text-indigo-400 font-bold uppercase">
                Result
              </div>
              <div className="text-xl font-bold text-slate-800">
                {participant.name}
              </div>
              <div className="text-sm text-slate-500 italic">
                "{participant.wishlist}"
              </div>
            </div>
            <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
              Note: This result was NOT saved to the database.
            </p>
            <Button onClick={onReset} variant="outline" className="w-full">
              Reset Machine
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCount, setTargetCount] = useState<number>(5);
  const [eventSummary, setEventSummary] = useState("");

  // Settings State
  const [showSettings, setShowSettings] = useState(false);

  // Invite State
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState(
    "Hey! I'm hosting a Secret Santa gift exchange. Click the link below to join and add your wishlist!"
  );
  const [copied, setCopied] = useState(false);

  // Simulation State
  const [showSimulator, setShowSimulator] = useState(false);
  const [simState, setSimState] = useState<DrawState>("idle");
  const [simResult, setSimResult] = useState<Participant | null>(null);
  const [simRollingName, setSimRollingName] = useState("TEST");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [data, settings] = await Promise.all([
        getParticipants(),
        getSettings(),
      ]);
      setParticipants(data);
      setTargetCount(settings.targetCount);
      setEventSummary(settings.eventSummary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(targetCount, eventSummary);
    setShowSettings(false);
  };

  const getInviteLink = () => {
    return `${window.location.origin}${window.location.pathname}#/join`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const link = getInviteLink();
    const subject = "You are invited to the Gift Exchange!";
    const body = `${inviteMessage}\n\nJoin here:\n${link}`;
    window.location.href = `mailto:${inviteEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteParticipant(id);
      setParticipants(participants.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isClaimed: !currentStatus } : p))
      );
      await toggleClaim(id, !currentStatus);
    } catch (err) {
      console.error("Failed to toggle", err);
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isClaimed: currentStatus } : p))
      );
    }
  };

  // --- SIMULATION LOGIC ---
  const handleSimulateDraw = async () => {
    let simPool = participants;
    if (simPool.length === 0) {
      simPool = [
        {
          id: "sim-1",
          name: "Rudolph Rednose",
          wishlist: "Nose Polish",
          isClaimed: false,
          pin: "0000",
        },
        {
          id: "sim-2",
          name: "Frosty Snowman",
          wishlist: "Magic Hat",
          isClaimed: false,
          pin: "0000",
        },
        {
          id: "sim-3",
          name: "Buddy The Elf",
          wishlist: "Maple Syrup",
          isClaimed: false,
          pin: "0000",
        },
      ];
    }
    const names = simPool.map((p) => p.name);
    setSimState("drawing");
    const interval = setInterval(() => {
      const random = names[Math.floor(Math.random() * names.length)];
      setSimRollingName(random);
    }, 80);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    clearInterval(interval);
    try {
      const winner = simPool[Math.floor(Math.random() * simPool.length)];
      setSimResult(winner);
      setSimState("dropped");
    } catch (e) {
      console.error(e);
      setSimState("idle");
    }
  };

  const handleSimCapsuleClick = () => {
    if (simState === "dropped") {
      setSimState("revealed");
    }
  };

  const resetSim = () => {
    setSimState("idle");
    setSimResult(null);
    setSimRollingName("TEST");
  };

  const stats = {
    total: participants.length,
    claimed: participants.filter((p) => p.isClaimed).length,
    remaining: participants.filter((p) => !p.isClaimed).length,
  };

  // --- DASHBOARD VIEW ---
  return (
    <div className="max-w-5xl mx-auto pt-8 px-4 pb-28 space-y-8 w-full">
      {/* Header Section: Centered on mobile, Flex row on desktop */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">
            <span className="text-secondary">Secret</span>{" "}
            <span className="text-primary">Santa</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Dashboard</p>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSimulator(true)}
            className="rounded-full border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          >
            <BeakerIcon className="w-5 h-5 mr-2" />
            Test Gacha
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowInvite(!showInvite)}
            className={`rounded-full border-primary/20 hover:bg-primary/5 ${
              showInvite
                ? "bg-primary/10 text-primary"
                : "bg-white text-slate-600"
            }`}
          >
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Invite
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-full border-primary/20 hover:bg-primary/5 ${
              showSettings
                ? "bg-primary/10 text-primary"
                : "bg-white text-slate-600"
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Settings
          </Button>
          <Button
            onClick={copyInviteLink}
            className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 mr-2" />
            ) : (
              <LinkIcon className="w-5 h-5 mr-2" />
            )}
            {copied ? "Link Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Invite Panel */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-100 mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-indigo-900">
                  <PaperAirplaneIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  Send Email Invitation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Recipient Email
                    </label>
                    <Input
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Custom Message
                    </label>
                    <Textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="bg-white resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-slate-400">
                      The invite link will be automatically appended to your
                      message.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600"
                  >
                    Open Email App
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-white/90 border-2 border-dashed border-secondary/30 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-slate-700">
                  Event Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Total Participants Needed to Start
                    </label>
                    <Input
                      type="number"
                      min="2"
                      value={targetCount}
                      onChange={(e) => setTargetCount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Event Welcome Message (for Join Page)
                    </label>
                    <Textarea
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      placeholder="Welcome to our Secret Santa! Enter your wishlist below..."
                      className="resize-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button type="submit" className="w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-3xl font-bold text-slate-800">
            {stats.total}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
            Joined
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-3xl font-bold text-slate-800">
            {targetCount}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
            Target
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-3xl font-bold text-green-500">
            {stats.claimed}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
            Drawed
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-3xl font-bold text-primary">
            {stats.remaining}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
            Waiting
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Loading participants...
        </div>
      ) : (
        <motion.div layout className="flex flex-wrap justify-center gap-4">
          <AnimatePresence>
            {participants.map((p) => (
              <div
                key={p.id}
                className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.7rem)]"
              >
                <ParticipantCard
                  participant={p}
                  onDelete={handleDelete}
                  onToggleClaim={handleToggle}
                />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && participants.length === 0 && (
        <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">No one has joined yet!</p>
          <p className="text-slate-400 text-sm mt-2">
            Send the invite link to get started.
          </p>
        </div>
      )}

      {/* SIMULATOR MODAL */}
      <Modal
        isOpen={showSimulator}
        onClose={() => {
          setShowSimulator(false);
          resetSim();
        }}
        title="Gacha Simulator"
      >
        <div className="flex flex-col items-center">
          <div className="scale-75 -mt-16 -mb-16">
            <ArcadeMachine
              state={simState}
              rollingName={simRollingName}
              onCapsuleClick={handleSimCapsuleClick}
            />
          </div>

          <AnimatePresence mode="wait">
            {simState === "idle" && (
              <Button
                onClick={handleSimulateDraw}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Test Spin
              </Button>
            )}
            {simState === "drawing" && (
              <div className="text-slate-400 font-bold animate-pulse">
                Running Simulation...
              </div>
            )}
            {simState === "dropped" && (
              <div className="text-slate-500 font-medium animate-bounce">
                Click the capsule to reveal!
              </div>
            )}
            {simState === "revealed" && simResult && (
              <SimPrizeReveal participant={simResult} onReset={resetSim} />
            )}
            {simState === "empty" && (
              <div className="text-center">
                <p className="text-slate-500 mb-4">
                  No unclaimed participants found to test with!
                </p>
                <Button onClick={resetSim} variant="outline">
                  Reset
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
};

export default ParticipantsPage;
