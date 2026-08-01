"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title,
  description,
  confirmLabel = "Delete",
}: ConfirmDeleteDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>

              {/* Content */}
              <h2 className="text-base font-extrabold text-slate-900 mb-1.5">{title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
