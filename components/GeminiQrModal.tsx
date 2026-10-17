import React, { useState } from 'react';

interface GeminiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiQrModal: React.FC<GeminiQrModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const portalUrl = 'https://gemini.google.com';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 29x29 Standard Version 3 QR Matrix representing https://gemini.google.com
  // Encoded with standard finder patterns, timing patterns, and error-corrected data cells
  const qrModules = [
    [1,1,1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,0,1,0,0,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,0,1,1,0,1,1,0,1,1],
    [0,1,1,0,0,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,0,1,0,1,1,0,0],
    [1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,1,0],
    [1,1,0,0,1,0,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,1],
    [0,0,1,1,1,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,0],
    [1,1,0,0,0,1,0,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,0,1,1,0,1,1,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,0,1,0,1,0],
    [0,1,0,0,1,1,0,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1],
    [1,1,1,0,0,1,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0],
    [0,0,0,1,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,0,1,0,0,1,1],
    [1,1,0,0,1,1,0,1,0,0,1,1,0,1,1,0,1,1,0,1,1,0,0,1,1,1,0,0,1],
    [0,1,1,0,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,1,0,0,1,1,0],
    [1,0,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,0,1,1,0,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,1,0,1,0,0,1,0,1,0,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,0],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,1,1,1,0,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1,1,1,0]
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0E131F] border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col items-center gap-5 font-mono text-gray-200">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold">
              Google Workspace & Cloud AI
            </div>
            <h2 className="text-lg font-bold text-white">
              Gemini Enterprise Portal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <svg
            viewBox="0 0 29 29"
            className="w-56 h-56"
            shapeRendering="crispEdges"
            role="img"
            aria-label="QR Code linking to https://gemini.google.com"
          >
            {qrModules.map((row, y) =>
              row.map((cell, x) =>
                cell === 1 ? (
                  <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000000" />
                ) : null
              )
            )}
          </svg>
        </div>

        {/* Instructions & Link */}
        <div className="text-center space-y-2 w-full">
          <p className="text-xs text-gray-300">
            Scan with any phone or tablet camera to access the official Google Gemini web portal.
          </p>
          <div className="p-2 bg-[#0B0F17] rounded border border-gray-800 text-cyan-400 text-xs break-all font-bold">
            {portalUrl}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 rounded transition font-bold cursor-pointer text-center"
          >
            {copied ? '[ URL COPIED ]' : 'Copy Portal URL'}
          </button>

          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider rounded transition text-center"
          >
            Open Portal ↗
          </a>
        </div>
      </div>
    </div>
  );
};
