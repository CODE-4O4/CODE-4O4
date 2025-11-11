"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { JoinClubForm } from "@/components/forms/join-club-form";

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

export const JoinClubModal = ({ open, onClose }: ModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-6 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="glass-panel relative w-full max-w-3xl border border-white/10 p-8"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mb-6 space-y-2">
            <span className="inline-flex items-center rounded-full border border-emerald-400/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Join CODE 4O4 Dev Club
            </span>
            <h3 className="text-3xl font-semibold">
              Tell us how you want to collaborate
            </h3>
            <p className="text-sm text-white/70">
              Once submitted, the admin desk reviews your request, tags mentors,
              and sends you portal access.
            </p>
          </div>
          <JoinClubForm onSuccess={onClose} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
