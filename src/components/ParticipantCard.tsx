import React, { useState } from "react";
import { Participant } from "../types";
import { Card, CardContent } from "./ui";
import {
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon,
  LockClosedIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface ParticipantCardProps {
  participant: Participant;
  onDelete: (id: string) => void;
  onToggleClaim: (id: string, currentStatus: boolean) => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onDelete,
  onToggleClaim,
}) => {
  const [showPin, setShowPin] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  participant.isClaimed
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {participant.isClaimed ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-dashed" />
                )}
              </div>
              <div>
                <h3
                  className={`font-semibold text-lg leading-tight ${
                    participant.isClaimed
                      ? "text-slate-500 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {participant.name}
                </h3>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                      participant.isClaimed
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {participant.isClaimed ? "Claimed" : "Waiting"}
                  </span>

                  {/* CLICK TO REVEAL PIN */}
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center font-mono tracking-wide cursor-pointer transition-colors ${
                      showPin
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    title={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showPin ? (
                      <EyeIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <LockClosedIcon className="w-3 h-3 mr-1" />
                    )}
                    {showPin ? participant.pin : "••••"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() =>
                  onToggleClaim(participant.id, participant.isClaimed)
                }
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
                title={
                  participant.isClaimed
                    ? "Mark as unclaimed"
                    : "Mark as claimed"
                }
              >
                {participant.isClaimed ? (
                  <XCircleIcon className="w-5 h-5" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => onDelete(participant.id)}
                className="p-1.5 text-slate-400 hover:text-destructive hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <GiftIcon className="w-4 h-4 text-primary/70" />
            <span className="truncate italic">
              {participant.wishlist || "No wishlist item"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
