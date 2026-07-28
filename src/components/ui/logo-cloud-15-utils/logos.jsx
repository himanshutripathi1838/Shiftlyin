import * as React from "react";

export const Logo01 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto" viewBox="0 0 140 40">
      <rect x="5" y="5" width="130" height="30" rx="8" fill="#dc2626" />
      <text x="70" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="900" fill="#ffffff">
        CAFÉ COFFEE DAY
      </text>
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Café Coffee Day</span>
  </div>
);

export const Logo02 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto" viewBox="0 0 140 40">
      <polygon points="45,5 65,0 65,35 45,30" fill="#0284c7" />
      <polygon points="65,0 85,5 85,30 65,35" fill="#e11d48" />
      <circle cx="55" cy="17" r="3" fill="#ffffff" />
      <circle cx="75" cy="12" r="3" fill="#ffffff" />
      <circle cx="75" cy="23" r="3" fill="#ffffff" />
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Domino's</span>
  </div>
);

export const Logo03 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto text-amber-500" viewBox="0 0 140 40">
      <rect x="15" y="5" width="110" height="30" rx="6" fill="rgba(245, 158, 11, 0.15)" stroke="currentColor" strokeWidth="2" />
      <text x="70" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fill="currentColor" letterSpacing="1px">
        BARISTA
      </text>
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Barista</span>
  </div>
);

export const Logo04 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto" viewBox="0 0 140 40">
      <path d="M55,32 C55,10 63,6 70,22 C77,6 85,10 85,32" fill="none" stroke="#eab308" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">McDonald's</span>
  </div>
);

export const Logo05 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto" viewBox="0 0 140 40">
      <text x="70" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="900" fontStyle="italic" fill="#e11d48">
        zomato
      </text>
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Zomato</span>
  </div>
);

export const Logo06 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto" viewBox="0 0 140 40">
      <path d="M60,8 C74,2 80,14 82,18 C72,32 60,26 60,8 Z" fill="#fc8019" />
      <circle cx="70" cy="16" r="2.5" fill="#ffffff" />
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Swiggy</span>
  </div>
);

export const Logo07 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto text-indigo-500 dark:text-indigo-400" viewBox="0 0 140 40">
      <text x="70" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="900" fill="currentColor" letterSpacing="1.5px">
        Radisson
      </text>
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Radisson Hotels</span>
  </div>
);

export const Logo08 = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[140px] px-3">
    <svg className="h-9 w-auto" viewBox="0 0 140 40">
      <circle cx="70" cy="20" r="14" fill="#059669" />
      <polygon points="70,11 73,17 79,18 74,22 76,28 70,25 64,28 66,22 61,18 67,17" fill="#ffffff" />
    </svg>
    <span className="text-xs font-bold text-[var(--text)] tracking-tight">Starbucks</span>
  </div>
);
