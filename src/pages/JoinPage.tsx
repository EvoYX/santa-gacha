import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui";
import {
  GiftIcon,
  SparklesIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { getSettings, addParticipant } from "../apis/api";

const JoinPage: React.FC = () => {
  const [name, setName] = useState("");
  const [wishlist, setWishlist] = useState("");
  const [pin, setPin] = useState("");
  const [eventSummary, setEventSummary] = useState(
    "Welcome! Please join our gift exchange."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings.eventSummary) {
        setEventSummary(settings.eventSummary);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !wishlist.trim() || pin.length < 4) return;

    setIsSubmitting(true);
    try {
      await addParticipant(name, wishlist, pin);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(val);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-green-200 shadow-xl"
        >
          <SparklesIcon className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          You're on the list!
        </h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
          Thanks for joining,{" "}
          <span className="font-bold text-primary">{name}</span>!
          <br />
          <span className="text-sm mt-4 block bg-yellow-50 p-4 rounded-xl text-yellow-800 border border-yellow-200 shadow-sm text-left">
            <span className="font-bold block mb-1 text-yellow-900 uppercase tracking-wide text-xs">
              Important
            </span>
            Remember your PIN:{" "}
            <strong className="font-mono text-lg mx-1">{pin}</strong>
            <br />
            You will need this PIN to verify your identity when you open your
            gift.
          </span>
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={() => navigate("/gacha")}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            Go to Gacha Machine <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={() => {
              setSubmitted(false);
              setName("");
              setWishlist("");
              setPin("");
            }}
            variant="outline"
            className="w-full h-12 text-slate-500 border-slate-300 hover:bg-slate-50"
          >
            Add Another Person
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50/50">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />

        <CardHeader className="text-center pb-2 relative z-10">
          <div
            className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-primary rotate-3 shrink-0"
            style={{ width: "64px", height: "64px" }}
          >
            <GiftIcon className="w-8 h-8 text-primary" width={32} height={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Join the Gift Exchange
          </CardTitle>
          <p className="text-slate-500 text-sm mt-2 whitespace-pre-wrap px-4 leading-relaxed">
            {eventSummary}
          </p>
        </CardHeader>

        <CardContent className="pt-6 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Your Name
              </label>
              <Input
                placeholder="e.g. Santa Claus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Your Wishlist & Preferences
              </label>
              <Textarea
                placeholder="Drop a few hints lah (what u want / don’t want… like no snacks, need tumbler, etc.)"
                value={wishlist}
                onChange={(e) => setWishlist(e.target.value)}
                className="min-h-[120px] text-lg bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
              <p className="text-xs text-slate-400 ml-1">
                Tip: List things you like, and also things you prefer not to
                receive.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" />
                Set a 4-Digit PIN
              </label>
              <Input
                type="tel"
                placeholder="0000"
                value={pin}
                onChange={handlePinChange}
                className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 tracking-widest text-center font-mono"
                maxLength={4}
              />
              <p className="text-xs text-slate-400 ml-1">
                You will need this PIN to see your result later.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20 transition-transform active:scale-95"
              disabled={isSubmitting || !name || !wishlist || pin.length < 4}
            >
              {isSubmitting ? "Joining..." : "Submit Wishlist"}
            </Button>

            <p className="text-xs text-center text-slate-400 mt-4">
              Don't worry, others can't see your wishlist until the draw!
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinPage;
