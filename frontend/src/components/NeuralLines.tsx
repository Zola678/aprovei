"use client";
import React from "react";

export default function NeuralLines() {
  return (
    <svg className="neural-overlay pointer-events-none fixed inset-0 -z-5" aria-hidden="true">
      <defs>
        <linearGradient id="pulse" x1="0%" x2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" stopOpacity="0.0" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.95)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.9)" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Example neural connections — placed semantically near hero cards */}
      <g strokeWidth={1} strokeLinecap="round" stroke="rgba(255,255,255,0.18)">
        <path className="neural-path" d="M220 220 C 300 180, 420 260, 520 240" fill="none" />
        <path className="neural-path" d="M420 160 C 480 120, 600 180, 760 140" fill="none" />
        <path className="neural-path" d="M540 360 C 600 320, 720 360, 880 340" fill="none" />
      </g>

      {/* Animated pulse overlay using stroke of gradient */}
      <g strokeWidth={2} strokeLinecap="round" stroke="url(#pulse)">
        <path className="neural-pulse" d="M220 220 C 300 180, 420 260, 520 240" fill="none" strokeDasharray="200" strokeDashoffset="200" />
        <path className="neural-pulse" d="M420 160 C 480 120, 600 180, 760 140" fill="none" strokeDasharray="300" strokeDashoffset="300" />
      </g>
    </svg>
  );
}
