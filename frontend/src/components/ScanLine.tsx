"use client";
import React, { useEffect, useState } from "react";

export default function ScanLine({ duration = 2200 }: { duration?: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // trigger animation on mount
    requestAnimationFrame(() => setActive(true));
    const t = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div className={`scan-line z-50 ${active ? 'scan-active' : ''}`} aria-hidden="true"></div>
  );
}
