import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PlasmaButtonAdvancedProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: string;
  orbSize?: number;
  className?: string;
}

export default function PlasmaButtonAdvanced({
  children,
  color = "hsl(142, 80%, 30%)", // Couleur plus foncée et saturée
  orbSize = 80, // Encore plus petit
  className = "",
  ...rest
}: PlasmaButtonAdvancedProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function onMove(e: React.PointerEvent) {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPos({ x, y });
  }

  // Conversion utilitaire pour générer des variantes transparentes de la couleur
  function toRGBA(c: string, alpha: number) {
    if (/^rgba?\(|^hsla?\(/i.test(c)) return c.replace(/\)$/, `, ${alpha})`).replace(/,\s*\d*\.?\d+\)$/, `, ${alpha})`);
    const hex = c.replace('#', '');
    const bigint = parseInt(hex.length === 3 ? hex.split('').map((h) => h + h).join('') : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const base = toRGBA(color, 0.9);
  const mid = toRGBA(color, 0.55);
  const faint = toRGBA(color, 0.18);

  return (
    <button
      ref={btnRef}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerMove={onMove}
      className={cn(
        "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...rest}
    >
      {/* Contenu */}
      <span className="relative z-20 flex items-center gap-2">{children}</span>

      {/* Halo extérieur doux (plus subtil) */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${hover ? 'opacity-40' : 'opacity-0'}`}
        style={{
          background: `radial-gradient(80% 80% at 50% 50%, ${toRGBA(color, 0.08)} 0%, transparent 70%)`,
        }}
      />

      {/* Boule d'énergie / plasma qui suit le curseur */}
      <div
        aria-hidden
        className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 will-change-[transform,opacity] ${
          hover ? 'opacity-80' : 'opacity-0'
        }`}
        style={{
          left: pos.x,
          top: pos.y,
          width: orbSize,
          height: orbSize,
        }}
      >
        {/* Contenant pour animer une rotation indépendante de la translation */}
        <div
          className="h-full w-full rounded-full mix-blend-screen"
          style={{
            backgroundImage: [
              // Coeur lumineux
              `radial-gradient(closest-side, ${base} 0%, ${mid} 45%, ${faint} 72%, transparent 78%)`,
              // Anneaux tournants
              `repeating-conic-gradient(from 0deg, ${toRGBA(color, 0)} 0deg 20deg, ${toRGBA(color, 0.35)} 24deg 36deg, ${toRGBA(
                color,
                0
              )} 40deg 60deg)`
            ].join(', '),
            filter: 'blur(14px) saturate(1.2) brightness(1.1)',
            animation: 'plasma-spin 6s linear infinite, plasma-pulse 3.7s ease-in-out infinite',
          }}
        />
        {/* Reflet central très intense */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${toRGBA(color, 0.9)} 0%, ${toRGBA(color, 0.35)} 60%, transparent 70%)`,
            filter: 'blur(6px) brightness(1.1)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Lueur interne très subtile */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 rounded-lg transition-opacity duration-400 ${
          hover ? 'opacity-60' : 'opacity-0'
        }`}
        style={{ boxShadow: `inset 0 0 16px ${toRGBA(color, 0.1)}` }}
      />

      {/* Bordure gradient très subtile */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-400 ${
          hover ? 'opacity-50' : 'opacity-0'
        }`}
        style={{
          boxShadow: `0 0 0 1px ${toRGBA(color, 0.12)} inset, 0 4px 12px -4px ${toRGBA(color, 0.15)}`,
        }}
      />

      {/* Styles CSS spécifiques injectés (keyframes) */}
      <style>{`
        @keyframes plasma-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes plasma-pulse {
          0%   { filter: blur(12px) saturate(1.1) brightness(1.05); }
          50%  { filter: blur(16px) saturate(1.3) brightness(1.15); }
          100% { filter: blur(12px) saturate(1.1) brightness(1.05); }
        }
      `}</style>
    </button>
  );
}