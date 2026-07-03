import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  noteTitle: string;
}

export default function ShareModal({ isOpen, onClose, shareUrl, noteTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070811]/85 backdrop-blur-md"
            id="share-modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-[#151a30] border border-[#1e293b] rounded-2xl shadow-2xl p-6 overflow-hidden z-10 select-none font-sans"
            id="share-modal-container"
          >
            {/* Elegant glowing background accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]/70 mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans tracking-wide">Compartir Nota</h3>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5 max-w-[240px] truncate">
                    {noteTitle}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-share-modal"
                onClick={onClose}
                className="p-1.5 hover:bg-[#1e293b] text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code section */}
            <div className="flex flex-col items-center justify-center py-4 bg-[#0b0d19]/60 rounded-xl border border-[#1e293b] p-4 relative z-10 mb-5">
              <div className="p-3.5 bg-white rounded-xl shadow-inner border border-zinc-200/50 hover:scale-[1.02] transition-transform duration-200">
                <QRCodeSVG
                  value={shareUrl}
                  size={180}
                  level="M"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0B0D19"
                />
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-3 text-center leading-relaxed px-4">
                Escanea este código QR con la cámara de tu celular para abrir e importar esta nota inmediatamente en otro dispositivo.
              </p>
            </div>

            {/* URL Input Copy Section */}
            <div className="flex flex-col gap-2 relative z-10 mb-4">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-sans tracking-wider">
                Enlace para Compartir
              </label>
              <div className="flex items-center gap-2 bg-[#0b0d19] border border-[#1e293b] rounded-lg p-1.5 pl-3 focus-within:border-purple-500 transition-colors">
                <input
                  id="share-link-input"
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-purple-200 select-all outline-none flex-1 min-w-0"
                />
                <button
                  id="btn-copy-share-link"
                  onClick={handleCopy}
                  className={`p-2 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3'
                      : 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-[1.02]'
                  }`}
                  title="Copiar enlace al portapapeles"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action buttons (Open in new tab option) */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]/50 relative z-10">
              <button
                id="btn-close-share"
                onClick={onClose}
                className="px-4 py-2 bg-[#1e293b] hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <a
                id="link-open-share"
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/20 active:scale-95 transition-all"
              >
                <span>Probar Enlace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
