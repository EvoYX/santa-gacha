import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui";
import { GiftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { getSettings, addParticipant } from "../apis/api";

const JoinPage: React.FC = () => {
  const [name, setName] = useState("");
  const [wishlist, setWishlist] = useState("");
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
    if (!name.trim() || !wishlist.trim()) return;

    setIsSubmitting(true);
    try {
      await addParticipant(name, wishlist);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <SparklesIcon className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          You're on the list!
        </h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Thanks for joining,{" "}
          <span className="font-bold text-primary">{name}</span>! The Gacha draw
          will begin once everyone has signed up.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Add Another Person
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />

        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-primary rotate-3">
            <GiftIcon className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Join the Gift Exchange
          </CardTitle>
          <p className="text-slate-500 text-sm mt-2 whitespace-pre-wrap px-4 leading-relaxed">
            {eventSummary}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
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
                Your Wishlist
              </label>
              <Input
                placeholder="e.g. Handmade Scarf"
                value={wishlist}
                onChange={(e) => setWishlist(e.target.value)}
                className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20 transition-transform active:scale-95"
              disabled={isSubmitting || !name || !wishlist}
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
