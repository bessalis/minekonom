import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

// ─── Charlie ──────────────────────────────────────────────────────────────────
// En SVG per pose (genererade ur spritearket med scripts/make-charlie.mjs).

const modules = import.meta.glob('./charlie/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const POSES = Object.fromEntries(
  Object.entries(modules).map(([p, url]) => [p.match(/\/(\w+)\.svg$/)![1], url]),
) as Record<string, string>;

export type Mood =
  | 'happy' | 'thinking' | 'sad' | 'worried' | 'celebrate' | 'calm'
  | 'cool' | 'shopping' | 'love' | 'money' | 'regret' | 'coin';

/** size < 70 → rund avatar med huvudet i fokus. Annars hela kroppen med höjd ≈ size. */
export function Charlie({ mood = 'happy', size = 80, style }: { mood?: Mood; size?: number; style?: CSSProperties }) {
  const src = POSES[mood] ?? POSES.happy;
  if (size < 70) {
    return (
      <div className="rounded-full overflow-hidden bg-[#F0C9AE]/50 shrink-0" style={{ width: size, height: size, ...style }}>
        <img src={src} alt="Charlie" draggable={false} className="w-full h-full object-cover object-top" />
      </div>
    );
  }
  return (
    <img src={src} alt="Charlie" draggable={false}
      style={{ height: size * 1.3, width: 'auto', maxWidth: '100%', flexShrink: 0, ...style }} />
  );
}

// ─── Primitiv UI ──────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'coral' | 'light';
export function Btn({ children, onClick, variant = 'primary', full = false, sm = false, disabled = false, className = '' }: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant;
  full?: boolean; sm?: boolean; disabled?: boolean; className?: string;
}) {
  const base = `font-extrabold rounded-full transition-all active:scale-[0.94] select-none cursor-pointer
    ${full ? 'w-full block text-center' : ''}
    ${sm ? 'px-4 py-2 text-sm' : 'px-6 py-3.5 text-base'}`;
  const vs: Record<BtnVariant, string> = {
    primary: 'bg-[#0F6E56] text-white shadow-[0_5px_16px_rgba(15,110,86,0.38),0_1px_3px_rgba(15,110,86,0.15),inset_0_1.5px_0_rgba(255,255,255,0.22)]',
    secondary: 'bg-[#EFD9C3] text-[#3D2C1E] shadow-[0_3px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]',
    ghost: 'bg-white/80 text-[#0F6E56] border-2 border-[#0F6E56]/40',
    coral: 'bg-[#C97B5C] text-white shadow-[0_4px_14px_rgba(201,123,92,0.4),inset_0_1.5px_0_rgba(255,255,255,0.22)]',
    light: 'bg-white/90 text-[#3D2C1E] shadow-[0_2px_8px_rgba(0,0,0,0.07)]',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${vs[variant]} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`rounded-3xl p-5 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] ${className}`}
      style={style}
    >{children}</div>
  );
}

export function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Tillbaka"
      className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-2xl font-bold text-[#3D2C1E] active:scale-90 shrink-0 leading-none"
    >
      ‹
    </button>
  );
}

export function CharlieComment({ text, mood = 'happy' }: { text: string; mood?: Mood }) {
  return (
    <div className="flex gap-3 items-start">
      <Charlie size={48} mood={mood} />
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#5A4235] leading-snug">{text}</p>
      </div>
    </div>
  );
}

// ─── Konfetti och regn ────────────────────────────────────────────────────────
// Slumpvärden skapas en gång per visning (useMemo), så att konfettin inte hoppar vid omrendering.

export function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    dur: 2.2 + Math.random() * 1.8,
    color: ['#F0C9AE', '#0F6E56', '#C97B5C', '#DCC4BC', '#F5C842', '#EFD9C3', '#EC4899'][i % 7],
    size: 5 + Math.random() * 8,
    round: i % 3 === 0,
  })), []);
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: -20,
          width: p.size, height: p.size,
          backgroundColor: p.color,
          borderRadius: p.round ? '50%' : '3px',
          animation: `confettiFall ${p.dur}s ${p.delay}s linear forwards`,
        }} />
      ))}
    </div>
  );
}

export function Rain() {
  const drops = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 2, dur: 1.2 + Math.random() * 1.2,
  })), []);
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
      {drops.map(d => (
        <div key={d.id} style={{
          position: 'absolute', left: `${d.left}%`, top: -30, fontSize: 20,
          animation: `rainFall ${d.dur}s ${d.delay}s linear infinite`,
        }}>💧</div>
      ))}
    </div>
  );
}

// ─── Nedre navigation ─────────────────────────────────────────────────────────

const TABS = [
  { icon: '💳', label: 'På kontot' },
  { icon: '🧾', label: 'Mina köp' },
  { icon: '⭐', label: 'Drömmar' },
  { icon: '🏅', label: 'Badges' },
  { icon: '👤', label: 'Profil' },
];

export function BottomNav({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <nav className="flex bg-[#0A4A3A] border-t border-[#073D2E] shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map((t, i) => (
        <button key={i} onClick={() => onChange(i)} aria-current={active === i ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-all active:scale-90 ${active === i ? 'opacity-100' : 'opacity-45'}`}
        >
          <span className={`text-xl transition-transform ${active === i ? 'scale-115' : ''}`}>{t.icon}</span>
          <span className="text-[10px] font-bold text-white leading-tight">{t.label}</span>
          {active === i && <div className="w-1 h-1 rounded-full bg-[#F0C9AE]" />}
        </button>
      ))}
    </nav>
  );
}

// ─── Skal: helskärm på mobil, telefonram på större skärmar ───────────────────

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh sm:min-h-screen sm:h-auto bg-[#F5EFE2] sm:bg-[#C8BEA8] sm:flex sm:items-center sm:justify-center sm:p-4">
      <div
        className="w-full h-dvh sm:h-[844px] sm:max-w-[390px] bg-[#F5EFE2] sm:rounded-[44px] overflow-hidden flex flex-col relative pt-[env(safe-area-inset-top)] sm:pt-0 sm:shadow-[0_28px_72px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.12)]"
      >
        {/* Fejkad iOS-statusbar visas bara i telefonramen på dator */}
        <div className="hidden sm:flex h-12 bg-[#F5EFE2] items-center justify-between px-7 shrink-0 pt-2" aria-hidden="true">
          <span className="text-xs font-black text-[#3D2C1E]">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#3D2C1E"><rect x="0" y="4" width="3" height="8" rx="1" /><rect x="4.5" y="2.5" width="3" height="9.5" rx="1" /><rect x="9" y="1" width="3" height="11" rx="1" /><rect x="13.5" y="0" width="2.5" height="12" rx="1" opacity="0.35" /></svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#3D2C1E" strokeOpacity="0.35" /><rect x="2" y="2" width="16" height="8" rx="2" fill="#3D2C1E" /><path d="M23 4v4a2 2 0 0 0 0-4z" fill="#3D2C1E" opacity="0.4" /></svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
