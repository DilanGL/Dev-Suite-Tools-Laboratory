import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-md bg-[#161616] border border-[#2d2d2d] rounded-xl shadow-2xl overflow-hidden px-6 py-6 font-sans text-gray-300"
          >
            <div className="flex items-start gap-4">
              {/* Icon Container based on type */}
              <div className={`p-2.5 rounded-lg shrink-0 ${
                type === 'danger' 
                  ? 'bg-red-950/40 text-red-500 border border-red-900/30' 
                  : type === 'warning'
                    ? 'bg-amber-950/40 text-amber-500 border border-amber-900/30'
                    : 'bg-orange-950/40 text-orange-500 border border-orange-900/30'
              }`}>
                {type === 'danger' ? (
                  <Trash2 size={20} />
                ) : type === 'warning' ? (
                  <AlertCircle size={20} />
                ) : (
                  <HelpCircle size={20} />
                )}
              </div>

              {/* Text content */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white tracking-wide font-sans">
                  {title}
                </h3>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-[#252525] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#222] border border-[#333] hover:border-[#444] rounded transition cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-1.5 text-xs font-bold text-white rounded transition cursor-pointer ${
                  type === 'danger'
                    ? 'bg-red-700 hover:bg-red-600 border border-red-650'
                    : type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-500 border border-amber-550'
                      : 'bg-orange-600 hover:bg-orange-500 border border-orange-550'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
