// Tillstånd, lagring och regler för Min Ekonom Light.
// All data ligger enbart i enhetens localStorage – inget skickas någonstans.

export interface Purchase {
  id: number; name: string; amount: number; iso: string;
  emoji: string; regretted: boolean; category: string;
}
export interface Dream {
  id: number; name: string; target: number; saved: number; emoji: string;
}
export interface BadgeDef {
  id: number; name: string; desc: string; category: string; icon: string; color: string;
  rule: (s: Stats) => boolean;
}
export interface Badge extends Omit<BadgeDef, 'rule'> { unlocked: boolean }

export interface AppState {
  v: 1;
  onboarded: boolean;
  userName: string;
  userEmoji: string;
  balance: number | null;
  purchases: Purchase[];
  dreams: Dream[];
  openDays: string[];     // ISO-datum (lokal tid) då appen öppnats
  harRadCount: number;    // antal gånger "Har jag råd?" använts
  celebrated: number[];   // badge-id som redan firats
  testCode: string | null; // testkod från inbjudningslänken (?kod=…) – slår på riktig avläsning
  consent: string | null; // ISO-tidpunkt då användaren intygade vårdnadshavarens OK (lokalt, ej verifierat)
}

// ─── Datum ────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + n));
};
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
export const fmtDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};

// ─── Streak ───────────────────────────────────────────────────────────────────

/** Nuvarande streak = antal dagar i rad som slutar idag. Mjuk nollställning: missad dag börjar bara om från 1. */
export function currentStreak(openDays: string[], today = todayISO()): number {
  const set = new Set(openDays);
  let n = 0, d = today;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/** Längsta streak någonsin (används för badges så att de inte tas bort när streaken bryts). */
export function bestStreak(openDays: string[]): number {
  const sorted = [...new Set(openDays)].sort();
  let best = 0, run = 0, prev = '';
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

// ─── Veckodiagram ─────────────────────────────────────────────────────────────

export function weekSpending(purchases: Purchase[], today = todayISO()) {
  const [y, m, d] = today.split('-').map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7; // måndag = 0
  const monday = addDays(today, -dow);
  const labels = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
  return labels.map((day, i) => {
    const iso = addDays(monday, i);
    return { day, amt: purchases.filter(p => p.iso === iso).reduce((s, p) => s + p.amount, 0) };
  });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export interface Stats {
  purchases: Purchase[]; dreams: Dream[]; harRadCount: number; best: number; totalSaved: number;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 1, name: 'Första spararen', desc: 'Lade pengar i ett sparmål', category: 'Sparande', icon: '🌱', color: '#22C55E', rule: s => s.dreams.some(d => d.saved > 0) },
  { id: 2, name: 'Sparmästare', desc: 'Sparat totalt 1 000 kr', category: 'Sparande', icon: '💰', color: '#F59E0B', rule: s => s.totalSaved >= 1000 },
  { id: 3, name: 'Pengakung', desc: 'Sparat totalt 5 000 kr', category: 'Sparande', icon: '👑', color: '#8B5CF6', rule: s => s.totalSaved >= 5000 },
  { id: 4, name: 'Smart köpare', desc: 'Kollade "Har jag råd?" 5 gånger', category: 'Köp', icon: '🧠', color: '#3B82F6', rule: s => s.harRadCount >= 5 },
  { id: 5, name: 'Ångraren', desc: 'Registrerade ett ångrat köp', category: 'Köp', icon: '😬', color: '#EF4444', rule: s => s.purchases.some(p => p.regretted) },
  { id: 6, name: 'Kassaboken', desc: 'Registrerade 10 köp', category: 'Köp', icon: '📖', color: '#6B7280', rule: s => s.purchases.length >= 10 },
  { id: 7, name: '3 dagar i rad', desc: 'Öppnade appen 3 dagar i rad', category: 'Streak', icon: '🔥', color: '#F97316', rule: s => s.best >= 3 },
  { id: 8, name: 'Veckans champ', desc: '7 dagar i rad', category: 'Streak', icon: '⚡', color: '#EAB308', rule: s => s.best >= 7 },
  { id: 9, name: 'Månadshjälte', desc: '30 dagar i rad', category: 'Streak', icon: '🏆', color: '#D97706', rule: s => s.best >= 30 },
  { id: 10, name: 'Drömmaren', desc: 'Skapade ditt första mål', category: 'Drömmar', icon: '⭐', color: '#EC4899', rule: s => s.dreams.length >= 1 },
  { id: 11, name: 'Halvvägs!', desc: 'Nådde 50% av ett mål', category: 'Drömmar', icon: '🚀', color: '#06B6D4', rule: s => s.dreams.some(d => d.target > 0 && d.saved / d.target >= 0.5) },
  { id: 12, name: 'Nått målet!', desc: 'Uppnådde ett sparmål', category: 'Drömmar', icon: '🎉', color: '#E91E8C', rule: s => s.dreams.some(d => d.target > 0 && d.saved >= d.target) },
];

export function computeBadges(st: AppState): Badge[] {
  const stats: Stats = {
    purchases: st.purchases, dreams: st.dreams, harRadCount: st.harRadCount,
    best: bestStreak(st.openDays), totalSaved: st.dreams.reduce((s, d) => s + d.saved, 0),
  };
  return BADGE_DEFS.map(({ rule, ...b }) => ({ ...b, unlocked: rule(stats) || st.celebrated.includes(b.id) }));
}

// ─── Emoji-data ───────────────────────────────────────────────────────────────

export const EMOJI_OPTS = ['🍟', '🍕', '🍬', '🍦', '🧋', '🍩', '🍇', '🌮'];
export const EMOJI_META: Record<string, { name: string; price: number }> = {
  '🍟': { name: 'pommesfriter', price: 25 },
  '🍕': { name: 'pizzaslicar', price: 35 },
  '🍬': { name: 'godispåsar', price: 15 },
  '🍦': { name: 'glassar', price: 35 },
  '🧋': { name: 'bubble teas', price: 59 },
  '🍩': { name: 'munkar', price: 29 },
  '🍇': { name: 'druvklasar', price: 19 },
  '🌮': { name: 'taco-måltider', price: 75 },
};

export const CATEGORIES: { name: string; emoji: string }[] = [
  { name: 'Mat', emoji: '🍔' }, { name: 'Godis', emoji: '🍬' }, { name: 'Dryck', emoji: '🧋' },
  { name: 'Spel', emoji: '🎮' }, { name: 'Kläder', emoji: '👕' }, { name: 'Fika', emoji: '☕' },
  { name: 'Övrigt', emoji: '✨' },
];

// ─── Start- och demodata ──────────────────────────────────────────────────────

export const freshState = (): AppState => ({
  v: 1, onboarded: false, userName: '', userEmoji: '🍟', balance: null,
  purchases: [], dreams: [], openDays: [], harRadCount: 0, celebrated: [], consent: null, testCode: null,
});

/** Förifylld data för demo/visning (öppna appen med ?demo=1 första gången). */
function demoState(): AppState {
  const t = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, -i));
  const st: AppState = {
    ...freshState(), onboarded: true, consent: new Date().toISOString(), userName: 'Tobbe Päron', userEmoji: '🍟', balance: 1636,
    purchases: [
      { id: 1, name: 'Bubble Tea', amount: 59, iso: addDays(t, -1), emoji: '🧋', regretted: false, category: 'Dryck' },
      { id: 2, name: 'Lösgodis', amount: 35, iso: addDays(t, -2), emoji: '🍬', regretted: true, category: 'Godis' },
      { id: 3, name: 'Roblox Credits', amount: 89, iso: addDays(t, -3), emoji: '🎮', regretted: false, category: 'Spel' },
      { id: 4, name: 'Chips', amount: 25, iso: addDays(t, -4), emoji: '🍔', regretted: true, category: 'Mat' },
      { id: 5, name: 'Fika med Emma', amount: 62, iso: addDays(t, -6), emoji: '☕', regretted: false, category: 'Fika' },
    ],
    dreams: [
      { id: 1, name: 'Nintendo Switch', target: 3000, saved: 1200, emoji: '🎮' },
      { id: 2, name: 'Nike Air Force 1', target: 1200, saved: 350, emoji: '👟' },
      { id: 3, name: 'Konsertbiljett', target: 600, saved: 600, emoji: '🎵' },
    ],
    openDays: days, harRadCount: 5, celebrated: [],
  };
  st.celebrated = computeBadges(st).filter(b => b.unlocked).map(b => b.id);
  return st;
}

// ─── Lagring ──────────────────────────────────────────────────────────────────

const KEY = 'min-ekonom-light:v1';

/** Teknisk felorsak visas bara om sidan öppnades med ?debug=1 (läses innan loadState rensar adressen). */
export const DEBUG = (() => { try { return new URLSearchParams(window.location.search).has('debug'); } catch { return false; } })();

export function loadState(): AppState {
  let params: URLSearchParams | null = null;
  try { params = new URLSearchParams(window.location.search); } catch { /* ignore */ }

  // ?reset=1 rensar allt (praktiskt vid användartester), ?demo=1 fyller med exempeldata,
  // ?kod=… sparar testkoden som slår på riktig skärmdumpsavläsning (kan kombineras: ?reset=1&kod=…)
  const kod = params?.get('kod')?.trim().slice(0, 64) || null;
  const special = !!(params && (params.has('reset') || params.has('demo')));
  let st: AppState | null = null;

  if (special) {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    st = params!.has('demo') ? demoState() : freshState();
  } else {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<AppState>;
        if (p && p.v === 1) st = { ...freshState(), ...p } as AppState;
      }
    } catch { /* trasig eller blockerad lagring – börja om */ }
  }
  if (!st) st = freshState();
  if (kod) st = { ...st, testCode: kod };
  if (special || kod) {
    try { window.history.replaceState(null, '', window.location.pathname); } catch { /* ignore */ }
  }
  return st;
}

export function saveState(st: AppState) {
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* privat läge/full lagring: fortsätt utan att spara */ }
}

export function clearState() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
