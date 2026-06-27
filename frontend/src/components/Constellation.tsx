"use client";
import React from "react";

export default function Constellation() {
  // Lightweight SVG constellation overlay — purely decorative
  return (
    <svg className="constellation-overlay pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1" filter="url(#glow)">
        <circle cx="8%" cy="12%" r="1.6" fill="rgba(255,255,255,0.22)" />
        <circle cx="18%" cy="26%" r="1.2" fill="rgba(255,255,255,0.18)" />
        <circle cx="36%" cy="18%" r="1.4" fill="rgba(255,255,255,0.16)" />
        <circle cx="62%" cy="22%" r="1.1" fill="rgba(255,255,255,0.17)" />
        <circle cx="78%" cy="12%" r="1.6" fill="rgba(255,255,255,0.22)" />

        <line x1="8%" y1="12%" x2="18%" y2="26%" strokeOpacity="0.12" />
        <line x1="18%" y1="26%" x2="36%" y2="18%" strokeOpacity="0.10" />
        <line x1="36%" y1="18%" x2="62%" y2="22%" strokeOpacity="0.09" />
        <line x1="62%" y1="22%" x2="78%" y2="12%" strokeOpacity="0.12" />
      </g>
      <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.9">
        <circle cx="20%" cy="70%" r="1.3" fill="rgba(255,255,255,0.14)" />
        <circle cx="36%" cy="64%" r="1" fill="rgba(255,255,255,0.12)" />
        <circle cx="54%" cy="76%" r="1.5" fill="rgba(255,255,255,0.16)" />
        <line x1="20%" y1="70%" x2="36%" y2="64%" strokeOpacity="0.08" />
        <line x1="36%" y1="64%" x2="54%" y2="76%" strokeOpacity="0.08" />
      </g>
    </svg>
  );
}
