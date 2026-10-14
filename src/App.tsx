import { useEffect, useRef, useState } from 'react';
import { BackBtn, BottomNav, Btn, Card, Charlie, CharlieComment, Confetti, Rain, Shell } from './ui';
import {
  BADGE_DEFS, CATEGORIES, EMOJI_META, EMOJI_OPTS, clearState, computeBadges, currentStreak, fmtDate,
  freshState, loadState, saveState, todayISO, addDays, weekSpending,
} from './lib';
import type { AppState, Badge, Dream, Purchase } from './lib';

type Nav = (s: string, p?: Record<string, unknown>) => void;

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ realReading, onComplete }: { realReading: boolean; onComplete: (name: string, emoji: string, consent: string) => void }) {
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍟');

  const FEATURES = [
    { icon: '👋', title: 'Välkommen!', desc: 'Håll koll på vad du har och vad du spenderar – enkelt och tydligt.', bg: '#F0C9AE' },
    { icon: '🤔', title: 'Har du råd?', desc: 'Kolla snabbt om du har råd innan du köper. Inga tomma fickor mer!', bg: '#EFD9C3' },
    { icon: '😅', title: 'Ångrat dig?', desc: 'Vi hjälper dig komma ihåg vad du ångrar och hur du kan lämna tillbaka.', bg: '#DCC4BC' },
  ];

  if (step === 0) return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-between px-6 py-10">
      <div />
      <div className="flex flex-col items-center gap-5">
        <Charlie size={130} mood="celebrate" />
        <div className="text-center">
          <h1 className="text-5xl font-black text-[#3D2C1E] leading-none">Min Ekonom</h1>
          <p className="text-[#C97B5C] font-black text-2xl mt-1 tracking-wide">Light ✨</p>
        </div>
        <p className="text-[#6B5344] text-center text-base leading-relaxed max-w-[280px]">
          Din personliga pengakomis.<br />Spara smartare, ångra mindre!
        </p>
      </div>
      <Btn onClick={() => setStep(1)} full>Kom igång →</Btn>
    </div>
  );

  if (step === 1 && !consent) return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-6 py-8 gap-5">
      <div className="flex-1 flex flex-col gap-4">
        <Charlie size={80} mood="calm" style={{ alignSelf: 'center' }} />
        <div className="text-center">
          <h2 className="text-3xl font-black text-[#3D2C1E]">Fråga en vuxen först</h2>
          <p className="text-[#6B5344] mt-1 text-sm">Visa det här för en förälder eller annan vårdnadshavare.</p>
        </div>
        <Card>
          <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest mb-2">Till vårdnadshavaren</p>
          <ul className="flex flex-col gap-2 text-sm text-[#5A4235] leading-snug list-disc pl-5">
            <li>Min Ekonom Light är en <b>testversion</b> som hjälper barn och unga att hålla koll på sina pengar.</li>
            <li>Det finns <b>inget konto och ingen bankkoppling</b>. Allt barnet skriver in sparas bara i den här telefonen.</li>
            {realReading ? (
              <li>När barnet väljer en skärmbild från mobilbanken <b>skickas bilden krypterat till en AI-tjänst</b> som läser av siffrorna. Min Ekonom sparar inte bilden. Enligt AI-tjänstens villkor kan den under en begränsad tid finnas kvar hos leverantören.</li>
            ) : (
              <li>Skärmbilder från mobilbanken <b>skickas inte någonstans</b> och sparas inte. I den här versionen läses de inte ens av.</li>
            )}
            <li>Barnet kan när som helst radera allt under Inställningar.</li>
          </ul>
        </Card>
        <label className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 w-6 h-6 shrink-0 accent-[#0F6E56]" />
          <span className="text-sm font-semibold text-[#3D2C1E] leading-snug">
            En vårdnadshavare har läst det här och är okej med att jag testar appen.
          </span>
        </label>
      </div>
      <Btn full disabled={!checked} onClick={() => setConsent(new Date().toISOString())}>Fortsätt →</Btn>
    </div>
  );

  if (step === 1) return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-6 py-10 gap-6">
      <div className="flex-1 flex flex-col justify-center gap-5">
        <Charlie size={80} mood="happy" style={{ alignSelf: 'center' }} />
        <div className="text-center">
          <h2 className="text-3xl font-black text-[#3D2C1E]">Vad heter du?</h2>
          <p className="text-[#6B5344] mt-1">Hej! Jag är Charlie, din pengakomis 😊</p>
        </div>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Skriv ditt namn..."
          autoComplete="off" maxLength={30} aria-label="Ditt namn"
          className="w-full rounded-2xl px-5 py-4 text-xl font-bold text-[#3D2C1E] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)] outline-none focus:ring-2 focus:ring-[#0F6E56] placeholder:text-[#C4A99A]"
        />
      </div>
      <Btn onClick={() => name.trim() && setStep(2)} disabled={!name.trim()} full>Nästa →</Btn>
    </div>
  );

  if (step >= 2 && step <= 4) {
    const f = FEATURES[step - 2];
    return (
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-6 py-10 gap-5">
        <div className="flex gap-2 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step - 2 ? 'w-8 bg-[#0F6E56]' : 'w-2 bg-[#DCC4BC]'}`} />
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div
            className="w-full rounded-3xl p-8 flex flex-col items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: f.bg }}
          >
            <span className="text-7xl">{f.icon}</span>
            <h3 className="text-3xl font-black text-[#3D2C1E] text-center">{f.title}</h3>
            <p className="text-[#6B5344] text-center leading-relaxed">{f.desc}</p>
          </div>
          {step === 2 && (
            <CharlieComment text={`Hej ${name.split(' ')[0] || name}! Jag är SÅ glad att träffa dig! 🎉`} mood="happy" />
          )}
        </div>
        <Btn onClick={() => setStep(step + 1)} full>{step < 4 ? 'Nästa →' : 'Sista steget →'}</Btn>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-6 py-10 gap-5">
      <div className="flex-1 flex flex-col justify-center gap-5">
        <Charlie size={80} mood="happy" style={{ alignSelf: 'center' }} />
        <div className="text-center">
          <h2 className="text-3xl font-black text-[#3D2C1E]">Välj din likhets-emoji!</h2>
          <p className="text-[#6B5344] mt-2 text-sm">Vi jämför summan på ditt konto med den här saken 😄</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {EMOJI_OPTS.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all active:scale-90
                ${emoji === e ? 'bg-[#0F6E56] shadow-[0_4px_16px_rgba(15,110,86,0.4)] scale-105' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'}`}
            >{e}</button>
          ))}
        </div>
        <div className="bg-white/80 rounded-2xl px-4 py-3 text-center">
          <p className="text-2xl font-black text-[#3D2C1E]">{emoji}</p>
          <p className="text-sm text-[#6B5344]">{EMOJI_META[emoji]?.name} · {EMOJI_META[emoji]?.price} kr styck</p>
        </div>
      </div>
      <Btn onClick={() => onComplete(name, emoji, consent ?? new Date().toISOString())} full>Jag är redo! 🚀</Btn>
    </div>
  );
}

function HomeTab({ balance, userName, userEmoji, purchases, streak, navigate }: {
  balance: number | null; userName: string; userEmoji: string; purchases: Purchase[];
  streak: number; navigate: Nav;
}) {
  const meta = EMOJI_META[userEmoji] || { name: 'saker', price: 30 };
  const eqCount = balance === null ? 0 : Math.floor(balance / meta.price);
  const sorted = [...purchases].sort((a, b) => b.iso.localeCompare(a.iso) || b.id - a.id);
  const last = sorted[0];
  const week = weekSpending(purchases);
  const maxAmt = Math.max(...week.map(d => d.amt), 1);
  const weekTotal = week.reduce((s, d) => s + d.amt, 0);
  const first = userName.split(' ')[0];

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-[#9B8070]">Hej {first}! 👋</p>
          <h2 className="text-xl font-black text-[#3D2C1E]">På kontot</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FFF3EC] border border-[#F0C9AE] rounded-full px-3 py-1.5" aria-label={`${streak} dagar i rad`}>
          <span className="text-sm">🔥</span>
          <span className="text-xs font-black text-[#C97B5C]">{streak} {streak === 1 ? 'dag' : 'dagar'}</span>
        </div>
      </div>

      {/* Saldo */}
      {balance === null ? (
        <div className="rounded-3xl p-5 bg-gradient-to-br from-[#0F6E56] via-[#0D6050] to-[#0A4A3A] shadow-[0_8px_32px_rgba(15,110,86,0.35),0_2px_8px_rgba(15,110,86,0.2)] flex flex-col items-center text-center gap-3">
          <Charlie size={90} mood="calm" />
          <p className="text-white text-xl font-black">Lägg in det du har på ditt konto</p>
          <p className="text-white/75 text-sm max-w-[260px]">Ta en skärmbild av hemskärmen i din mobilbank, så hjälper jag dig härifrån.</p>
          <button onClick={() => navigate('update')}
            className="w-full bg-[#F0C9AE] rounded-2xl py-3 text-sm font-extrabold text-[#3D2C1E] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all active:scale-95">
            📷 Lägg in vad du har på kontot
          </button>
        </div>
      ) : (
        <div className="rounded-3xl p-5 bg-gradient-to-br from-[#0F6E56] via-[#0D6050] to-[#0A4A3A] shadow-[0_8px_32px_rgba(15,110,86,0.35),0_2px_8px_rgba(15,110,86,0.2)]">
          <p className="text-white/70 text-sm font-semibold">Vad finns på kontot</p>
          <p className="text-5xl font-black text-white mt-1">{balance.toLocaleString('sv-SE')} <span className="text-2xl text-white/70">kr</span></p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate('update')}
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-2xl py-2.5 text-sm font-bold text-white transition-all active:scale-95 backdrop-blur-sm">
              📷 Uppdatera
            </button>
            <button onClick={() => navigate('har-rad')}
              className="flex-1 bg-[#F0C9AE] rounded-2xl py-2.5 text-sm font-bold text-[#3D2C1E] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all active:scale-95">
              🤔 Har jag råd?
            </button>
          </div>
        </div>
      )}

      {/* Charlie kommenterar */}
      {balance === null ? (
        <CharlieComment mood="happy" text={`Hej ${first}! Så fort du lagt in vad du har på ditt konto kan jag räkna ut om du har råd med saker 💪`} />
      ) : last ? (
        <CharlieComment
          mood={balance > 300 ? 'happy' : 'thinking'}
          text={`Ditt senaste köp: ${last.emoji} ${last.name} för ${last.amount} kr. ${balance > 300 ? 'Du har en bra buffert! 🎉' : 'Tänk på att spara lite! 💪'}`}
        />
      ) : (
        <CharlieComment mood="happy" text="Lägg in dina köp under Mina köp, så kan vi se vad pengarna går till 👀" />
      )}

      {/* Likhets-kort: visar varje enhet som en egen ikon, tio per rad, så att mängden syns och inte bara läses */}
      {balance !== null && (() => {
        const MAX = 100;
        const shown = Math.min(eqCount, MAX);
        return (
          <div className="rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]" style={{ backgroundColor: '#EFD9C3' }}>
            <p className="text-xs font-bold text-[#8B6040]">Summan på ditt konto motsvarar</p>
            <p className="text-3xl font-black text-[#3D2C1E]">{eqCount.toLocaleString('sv-SE')} {meta.name}</p>
            <p className="text-sm text-[#8B6040]">á {meta.price} kr styck</p>
            {eqCount === 0 ? (
              <p className="text-sm text-[#8B6040] mt-3">Inte en hel en ännu 🙂</p>
            ) : (
              <div role="img" aria-label={`${eqCount} ${meta.name}`} className="grid grid-cols-10 gap-x-0.5 gap-y-1 mt-4">
                {Array.from({ length: shown }, (_, i) => (
                  <span key={i} className="text-[22px] leading-none text-center select-none" aria-hidden="true">{userEmoji}</span>
                ))}
              </div>
            )}
            {eqCount > MAX && (
              <p className="text-xs font-bold text-[#8B6040] mt-3">…och {(eqCount - MAX).toLocaleString('sv-SE')} till</p>
            )}
          </div>
        );
      })()}

      {/* Veckodiagram */}
      <Card>
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-sm font-black text-[#3D2C1E]">Veckans utgifter</p>
          <p className="text-xs font-bold text-[#9B8070]">{weekTotal} kr totalt</p>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {week.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-lg ${d.amt > 0 ? 'bg-[#C97B5C]' : 'bg-[#F0EAE0]'}`}
                style={{ height: `${(d.amt / maxAmt) * 68}px`, minHeight: d.amt > 0 ? 6 : 4 }}
              />
              <span className="text-[10px] font-bold text-[#9B8070]">{d.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Se alla köp */}
      <button onClick={() => navigate('tab', { tab: 1 })}
        className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <span className="text-2xl w-10 h-10 flex items-center justify-center bg-[#F5EFE2] rounded-xl">🧾</span>
          <div className="text-left">
            <p className="font-bold text-[#3D2C1E] text-sm">Se alla köp</p>
            <p className="text-xs text-[#9B8070]">{purchases.length} köp registrerade</p>
          </div>
        </div>
        <span className="text-[#9B8070] text-xl">›</span>
      </button>
    </div>
  );
}

// ─── Purchases tab ────────────────────────────────────────────────────────────

function PurchasesTab({ purchases, navigate }: { purchases: Purchase[]; navigate: Nav }) {
  const [tab, setTab] = useState(0);
  const sorted = [...purchases].sort((a, b) => b.iso.localeCompare(a.iso) || b.id - a.id);
  const list = tab === 0 ? sorted : sorted.filter(p => p.regretted);

  if (purchases.length === 0) return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col">
      <h2 className="text-2xl font-black text-[#3D2C1E] mb-3">Mina köp</h2>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 pb-10">
        <Charlie size={110} mood="shopping" />
        <div>
          <h3 className="text-2xl font-black text-[#3D2C1E]">Just nu är det tomt här</h3>
          <p className="text-[#6B5344] text-sm mt-2 max-w-[260px] mx-auto leading-relaxed">
            Ta en skärmbild på dina senaste köp i mobilbanken, så sorterar jag dem åt dig.
          </p>
        </div>
        <Btn full onClick={() => navigate('update', { mode: 'purchases' })}>📷 Uppdatera med dina köp</Btn>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-6 flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-black text-[#3D2C1E]">Mina köp</h2>
          <Btn variant="secondary" sm onClick={() => navigate('update', { mode: 'purchases' })}>📷 Uppdatera</Btn>
        </div>
        <div className="flex gap-1.5 p-1 bg-white/80 rounded-2xl shadow-sm">
          {['Alla', '😬 Ångrade'].map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === i ? 'bg-[#0F6E56] text-white shadow' : 'text-[#6B5344]'}`}
            >{t}</button>
          ))}
        </div>
      </div>
      <div className="px-4 flex flex-col gap-2.5 pt-1">
        {list.map(p => (
          <button key={p.id} onClick={() => navigate('purchase-detail', { id: p.id })}
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all text-left w-full">
            <span className="text-2xl w-11 h-11 flex items-center justify-center bg-[#F5EFE2] rounded-xl shrink-0">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#3D2C1E] text-sm truncate">{p.name}</p>
              <p className="text-xs text-[#9B8070]">{p.category} · {fmtDate(p.iso)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-[#3D2C1E] text-sm">−{p.amount} kr</p>
              {p.regretted && <span className="text-[10px] bg-[#DCC4BC] text-[#7A4A3A] rounded-full px-2 py-0.5">Ångrat</span>}
            </div>
          </button>
        ))}
        {list.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Charlie size={90} mood="happy" />
            <p className="text-[#6B5344] font-bold text-center">Inga ångrade köp! 🎉<br /><span className="font-normal text-sm">Du är en smart köpare!</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Purchase detail ──────────────────────────────────────────────────────────

function PurchaseDetail({ purchase, onBack, navigate }: { purchase: Purchase; onBack: () => void; navigate: Nav }) {
  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">Köpdetalj</h2>
      </div>
      <Card className="flex flex-col items-center gap-3 py-8">
        <span className="text-6xl">{purchase.emoji}</span>
        <div className="text-center">
          <h3 className="text-2xl font-black text-[#3D2C1E]">{purchase.name}</h3>
          <p className="text-sm text-[#9B8070]">{purchase.category} · {fmtDate(purchase.iso)}</p>
        </div>
        <div className="bg-[#F5EFE2] rounded-2xl px-10 py-4 text-center mt-1">
          <p className="text-xs text-[#9B8070] font-semibold uppercase tracking-wide">Belopp</p>
          <p className="text-4xl font-black text-[#3D2C1E] mt-1">{purchase.amount} kr</p>
        </div>
        {purchase.regretted && (
          <span className="bg-[#DCC4BC] text-[#7A4A3A] rounded-full px-4 py-1.5 text-sm font-bold">😬 Markerat som ångrat</span>
        )}
      </Card>
      <CharlieComment
        text={purchase.regretted ? 'Du ångrade det här köpet. Ska vi försöka lämna tillbaka det?' : 'Hoppas du är nöjd med köpet! Värde pengar?'}
        mood={purchase.regretted ? 'thinking' : 'happy'}
      />
      {!purchase.regretted
        ? <Btn variant="coral" full onClick={() => navigate('angra', { id: purchase.id })}>😬 Ångra köpet</Btn>
        : <Btn variant="primary" full onClick={() => navigate('angra', { id: purchase.id })}>🔄 Starta lämna-tillbaka-guide</Btn>
      }
    </div>
  );
}

// ─── Ångra guide ──────────────────────────────────────────────────────────────

function AngraGuide({ purchase, onBack, onDone }: { purchase: Purchase; onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<number, string>>({});

  const Qs = [
    { q: 'Har du kvar förpackningen?', opts: ['Ja, hel och ren', 'Ja men lite skadad', 'Nej, den är borta'], emoji: '📦' },
    { q: 'Har du kvar kvittot?', opts: ['Ja, digitalt', 'Ja, papperskvitto', 'Nej, tappat det'], emoji: '🧾' },
    { q: 'Varför ångrar du dig?', opts: ['Behövde det inte', 'För dyrt i efterhand', 'Levde inte upp till förväntningarna', 'Köpte fel sak'], emoji: '🤔' },
  ];

  if (step === Qs.length) {
    const hasPkg = ans[0]?.includes('Ja');
    const hasRcp = ans[1]?.includes('Ja');
    const ok = hasPkg && hasRcp;
    return (
      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <BackBtn onClick={onBack} />
          <h2 className="text-xl font-black text-[#3D2C1E]">Sammanfattning</h2>
        </div>
        <div className="flex flex-col items-center gap-4 py-4">
          <Charlie size={80} mood={ok ? 'happy' : 'sad'} />
          <div className="text-center">
            <h3 className="text-2xl font-black text-[#3D2C1E]">{ok ? '🎉 Bra chans att lämna tillbaka!' : '😕 Kan vara svårt...'}</h3>
            <p className="text-[#6B5344] mt-2 leading-relaxed text-sm max-w-[280px] mx-auto">
              {ok ? 'Du har förpackning och kvitto. Gå till butiken och förklara att du ångrar dig!'
                : `Det saknas ${!hasPkg ? 'förpackning' : ''}${!hasPkg && !hasRcp ? ' och ' : ''}${!hasRcp ? 'kvitto' : ''}. Fråga ändå – butiker är ofta snälla!`}
            </p>
          </div>
        </div>
        <Card>
          <h4 className="font-bold text-[#3D2C1E] text-sm mb-3">Dina svar:</h4>
          {Qs.map((q, i) => (
            <div key={i} className="flex gap-2 items-start mb-2.5 last:mb-0">
              <span className="text-lg shrink-0">{q.emoji}</span>
              <div>
                <p className="text-xs text-[#9B8070]">{q.q}</p>
                <p className="text-sm font-semibold text-[#3D2C1E]">{ans[i] || '–'}</p>
              </div>
            </div>
          ))}
        </Card>
        <Btn variant="primary" full onClick={onDone}>Tillbaka till köp →</Btn>
      </div>
    );
  }

  const q = Qs[step];
  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">Lämna tillbaka-guide</h2>
      </div>
      <div className="flex gap-1 mt-1">
        {Qs.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i < step ? 'bg-[#0F6E56]' : i === step ? 'bg-[#C97B5C]' : 'bg-[#DCC4BC]'}`} />
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="text-center">
          <span className="text-6xl">{q.emoji}</span>
          <h3 className="text-2xl font-black text-[#3D2C1E] mt-3">{q.q}</h3>
          <p className="text-sm text-[#9B8070] mt-1">Om: {purchase.emoji} {purchase.name} ({purchase.amount} kr)</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {q.opts.map(opt => (
            <button key={opt} onClick={() => { setAns(a => ({ ...a, [step]: opt })); setStep(s => s + 1); }}
              className="bg-white rounded-2xl px-5 py-4 text-left font-semibold text-[#3D2C1E] shadow-[0_2px_12px_rgba(0,0,0,0.07)] active:scale-[0.97] active:bg-[#EFD9C3] transition-all">
              {opt}
            </button>
          ))}
        </div>
      </div>
      <Charlie size={56} mood="thinking" style={{ alignSelf: 'center' }} />
    </div>
  );
}

// ─── Har jag råd ──────────────────────────────────────────────────────────────

function HarJagRad({ balance, onBack, onChecked, navigate }: {
  balance: number | null; onBack: () => void; onChecked: () => void; navigate: Nav;
}) {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<{ name: string; amt: number }[]>([]);
  const [result, setResult] = useState<'none' | 'yes' | 'no'>('none');

  if (balance === null) return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">Har jag råd?</h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <Charlie size={100} mood="thinking" />
        <p className="text-[#6B5344] font-bold max-w-[260px]">Jag behöver veta hur mycket du har på kontot först.</p>
        <Btn full onClick={() => navigate('update')}>📷 Lägg in vad du har på ditt konto</Btn>
      </div>
    </div>
  );

  const curAmt = parseInt(input) || 0;
  const numpad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const press = (n: string) => {
    if (n === '⌫') setInput(v => v.slice(0, -1));
    else if (n === '') return;
    else setInput(v => (v === '' && n === '0') ? v : v.length < 7 ? v + n : v);
  };

  const addItem = () => {
    if (!input) return;
    setItems(it => [...it, { name: `Sak ${it.length + 1}`, amt: parseInt(input) }]);
    setInput('');
  };

  const check = () => {
    const t = items.reduce((s, i) => s + i.amt, 0) + curAmt;
    setResult(t <= balance ? 'yes' : 'no');
    onChecked();
  };

  if (result !== 'none') {
    const t = items.reduce((s, i) => s + i.amt, 0) + curAmt;
    return (
      <div className="flex-1 flex flex-col items-center justify-between px-6 pb-8 pt-4 overflow-y-auto">
        {result === 'yes' ? <Confetti /> : <Rain />}
        <div className="flex items-center gap-3 w-full">
          <BackBtn onClick={onBack} />
          <h2 className="text-xl font-black text-[#3D2C1E]">Har jag råd?</h2>
        </div>
        <div className="flex flex-col items-center gap-5 py-4">
          <Charlie size={100} mood={result === 'yes' ? 'celebrate' : 'sad'} />
          <h2 className={`text-4xl font-black text-center ${result === 'yes' ? 'text-[#0F6E56]' : 'text-[#C97B5C]'}`}>
            {result === 'yes' ? '🎉 Ja, du har råd!' : '😅 Inte riktigt...'}
          </h2>
          <Card className="w-full text-center">
            <p className="text-xs text-[#9B8070] font-semibold uppercase tracking-wide">Du vill köpa för</p>
            <p className="text-3xl font-black text-[#3D2C1E] mt-1">{t.toLocaleString('sv-SE')} kr</p>
            <div className="my-3 h-px bg-[#F5EFE2]" />
            <p className="text-xs text-[#9B8070] font-semibold uppercase tracking-wide">Vad finns på kontot</p>
            <p className={`text-2xl font-black mt-1 ${result === 'yes' ? 'text-[#0F6E56]' : 'text-[#C97B5C]'}`}>{balance.toLocaleString('sv-SE')} kr</p>
            {result === 'yes' && <p className="text-sm text-[#0F6E56] mt-2 font-semibold">Du har {(balance - t).toLocaleString('sv-SE')} kr kvar efteråt ✓</p>}
          </Card>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Btn variant="primary" full onClick={() => { setResult('none'); setItems([]); setInput(''); }}>Testa igen</Btn>
          <Btn variant="secondary" full onClick={onBack}>Tillbaka</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4 pt-4 gap-3">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">Har jag råd?</h2>
      </div>
      <div className="flex justify-between items-center bg-white/80 rounded-2xl px-4 py-2.5">
        <span className="text-sm font-bold text-[#6B5344]">Vad finns på kontot</span>
        <span className="text-lg font-black text-[#0F6E56]">{balance.toLocaleString('sv-SE')} kr</span>
      </div>
      {items.length > 0 && (
        <div className="flex flex-col gap-1 max-h-[88px] overflow-y-auto">
          {items.map((it, i) => (
            <div key={i} className="flex justify-between bg-white rounded-xl px-3 py-2 shadow-sm">
              <span className="text-sm font-semibold text-[#3D2C1E]">{it.name}</span>
              <span className="text-sm font-bold text-[#C97B5C]">{it.amt} kr</span>
            </div>
          ))}
        </div>
      )}
      <div className="text-center py-1">
        <p className="text-sm text-[#9B8070] font-semibold">Hur mycket vill du köpa för?</p>
        <p className="text-5xl font-black text-[#3D2C1E] mt-1">{input || '0'}<span className="text-xl text-[#9B8070] ml-1">kr</span></p>
      </div>
      <div className="flex gap-2">
        <Btn variant="secondary" sm onClick={addItem} disabled={!input} className="whitespace-nowrap">+ Lägg till sak</Btn>
        <Btn variant="primary" sm onClick={check} disabled={!input && items.length === 0} className="flex-1">Kolla! →</Btn>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-auto">
        {numpad.map((n, i) => (
          <button key={i} onClick={() => press(n)}
            aria-label={n === '⌫' ? 'Radera' : n || undefined}
            className={`rounded-2xl py-3.5 text-xl font-bold text-[#3D2C1E] transition-all active:scale-90 active:bg-[#EFD9C3]
              ${n === '' ? 'pointer-events-none' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)]'}
              ${n === '⌫' ? 'text-[#C97B5C]' : ''}`}
          >{n}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Dreams tab ───────────────────────────────────────────────────────────────

function DreamsTab({ dreams, setDreams, navigate }: {
  dreams: Dream[];
  setDreams: (fn: (ds: Dream[]) => Dream[]) => void;
  navigate: Nav;
}) {
  const [fillTarget, setFillTarget] = useState<Dream | null>(null);
  const [fillAmt, setFillAmt] = useState('');

  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#3D2C1E]">Mina drömmar</h2>
        <Btn variant="primary" sm onClick={() => navigate('new-dream')}>+ Nytt mål</Btn>
      </div>
      {dreams.length === 0 && (
        <div className="flex flex-col items-center text-center gap-3 py-8">
          <Charlie size={100} mood="coin" />
          <h3 className="text-xl font-black text-[#3D2C1E]">Vad drömmer du om?</h3>
          <p className="text-sm text-[#6B5344] max-w-[250px]">Lägg till något du vill spara till, så kan du fylla på lite i taget.</p>
        </div>
      )}
      {dreams.map(d => {
        const pct = d.target > 0 ? Math.min((d.saved / d.target) * 100, 100) : 0;
        const done = pct >= 100;
        const segs = 10;
        return (
          <div key={d.id} className={`rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] ${done ? 'bg-gradient-to-br from-[#E8F8F0] to-[#D0F0E0]' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl w-12 h-12 flex items-center justify-center bg-[#F5EFE2] rounded-xl">{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[#3D2C1E] truncate">{d.name}</p>
                <p className="text-xs text-[#9B8070]">{d.saved.toLocaleString('sv-SE')} / {d.target.toLocaleString('sv-SE')} kr</p>
              </div>
              {done && <span className="text-2xl">🎉</span>}
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: segs }, (_, i) => {
                const filled = (i + 1) / segs * 100 <= pct;
                const partial = !filled && i / segs * 100 < pct;
                return (
                  <div key={i} className={`flex-1 h-3 rounded-full ${filled ? 'bg-[#0F6E56]' : partial ? 'bg-[#0F6E56]/35' : 'bg-[#EFD9C3]'}`} />
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#0F6E56]">{Math.round(pct)}% klart</span>
              {!done
                ? <Btn variant="secondary" sm onClick={() => { setFillTarget(d); setFillAmt(''); }}>💰 Fyll på</Btn>
                : <span className="text-sm font-bold text-[#0F6E56]">Mål uppnått ✓</span>
              }
            </div>
          </div>
        );
      })}

      {fillTarget && (
        <div className="absolute inset-0 bg-black/40 z-40 flex items-end" onClick={() => setFillTarget(null)}>
          <div className="bg-[#F5EFE2] rounded-t-3xl w-full p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-[#3D2C1E] text-center">Fyll på {fillTarget.emoji} {fillTarget.name}</h3>
            <input type="number" inputMode="numeric" value={fillAmt} onChange={e => setFillAmt(e.target.value)} placeholder="Hur mycket kr?"
              className="w-full rounded-2xl px-5 py-4 text-2xl font-bold text-[#3D2C1E] bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#0F6E56] text-center"
              />
            <Btn variant="primary" full onClick={() => {
              const n = parseInt(fillAmt) || 0;
              setDreams(ds => ds.map(d => d.id === fillTarget!.id ? { ...d, saved: Math.min(d.saved + n, d.target) } : d));
              setFillTarget(null);
            }} disabled={!fillAmt}>
              Spara {fillAmt ? `${fillAmt} kr` : ''} →
            </Btn>
            <Btn variant="secondary" full onClick={() => setFillTarget(null)}>Avbryt</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── New dream ────────────────────────────────────────────────────────────────

function NewDream({ onBack, onAdd }: { onBack: () => void; onAdd: (name: string, target: number, emoji: string) => void }) {
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const emojis = ['⭐','🎮','👟','🎵','📱','🚴','✈️','🎨','📚','🏀','🧸','🎸'];

  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">Nytt sparmål</h2>
      </div>
      <Charlie size={70} mood="happy" style={{ alignSelf: 'center' }} />
      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-[#9B8070] uppercase tracking-wide block mb-2">Vad drömmer du om?</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="t.ex. Nintendo Switch"
              className="w-full rounded-2xl px-4 py-3 font-bold text-[#3D2C1E] bg-[#F5EFE2] outline-none focus:ring-2 focus:ring-[#0F6E56] text-base"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9B8070] uppercase tracking-wide block mb-2">Hur mycket kostar det?</label>
            <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0 kr"
              className="w-full rounded-2xl px-4 py-3 font-bold text-[#3D2C1E] bg-[#F5EFE2] outline-none focus:ring-2 focus:ring-[#0F6E56] text-base"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9B8070] uppercase tracking-wide block mb-2">Välj emoji</label>
            <div className="grid grid-cols-6 gap-2">
              {emojis.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all active:scale-90 ${emoji === e ? 'bg-[#0F6E56] scale-110 shadow-md' : 'bg-[#F5EFE2]'}`}
                >{e}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Btn variant="primary" full onClick={() => onAdd(name, parseInt(amt) || 0, emoji)} disabled={!name || !amt}>
        Skapa mål {emoji} →
      </Btn>
    </div>
  );
}

// ─── Badges tab ───────────────────────────────────────────────────────────────

function BadgesTab({ badges, navigate }: { badges: Badge[]; navigate: Nav }) {
  const cats = [...new Set(badges.map(b => b.category))];
  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-black text-[#3D2C1E]">Mina badges</h2>
        <p className="text-sm text-[#9B8070] mt-0.5">{badges.filter(b => b.unlocked).length}/{badges.length} upplåsta</p>
      </div>
      {cats.map(cat => (
        <div key={cat}>
          <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest mb-3">{cat}</p>
          <div className="grid grid-cols-3 gap-3">
            {badges.filter(b => b.category === cat).map(badge => (
              <button key={badge.id}
                onClick={() => badge.unlocked && navigate('badge-celebrate', { id: badge.id })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${badge.unlocked ? 'active:scale-95' : 'opacity-60'} ${badge.unlocked ? 'bg-white' : 'bg-white/50'}`}
                style={badge.unlocked ? {
                  boxShadow: `0 8px 28px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06), 0 0 0 1.5px ${badge.color}30`,
                  transform: 'translateY(-1px)',
                } : { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: badge.unlocked ? `linear-gradient(145deg, ${badge.color}25 0%, ${badge.color}45 100%)` : '#EEE8E0',
                    boxShadow: badge.unlocked ? `0 4px 14px ${badge.color}40, inset 0 1.5px 0 rgba(255,255,255,0.65)` : 'none',
                    filter: badge.unlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  {badge.unlocked ? badge.icon : '🔒'}
                </div>
                <p className={`text-[10px] font-bold leading-tight text-center ${badge.unlocked ? 'text-[#3D2C1E]' : 'text-[#B0A090]'}`}>
                  {badge.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Badge celebration ────────────────────────────────────────────────────────

function BadgeCelebrate({ badge, onBack }: { badge: Badge; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-6 pb-8 pt-6">
      <Confetti />
      <div className="flex items-center gap-3 w-full">
        <BackBtn onClick={onBack} />
        <span className="text-sm font-bold text-[#9B8070]">Ny badge!</span>
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="animate-bounce-in w-40 h-40 rounded-[38px] flex items-center justify-center text-7xl"
          style={{
            background: `linear-gradient(145deg, ${badge.color}30 0%, ${badge.color}60 100%)`,
            boxShadow: `0 20px 56px ${badge.color}50, 0 4px 14px ${badge.color}30, inset 0 2px 0 rgba(255,255,255,0.55)`,
          }}
        >{badge.icon}</div>
        <div className="text-center">
          <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest">Badge upplåst!</p>
          <h2 className="text-3xl font-black text-[#3D2C1E] mt-1">{badge.name}</h2>
          <p className="text-[#6B5344] mt-2 text-sm">{badge.desc}</p>
        </div>
        <Charlie size={80} mood="celebrate" />
        <div className="bg-white/90 rounded-2xl px-5 py-3 shadow-sm">
          <p className="text-sm text-[#5A4235] text-center font-semibold">
            "YES! Du är en riktig {badge.name}! 🎊"
          </p>
        </div>
      </div>
      <Btn variant="primary" full onClick={onBack}>Tillbaka till hyllan →</Btn>
    </div>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ userName, userEmoji, purchases, streak, navigate }: {
  userName: string; userEmoji: string; purchases: Purchase[]; streak: number;
  navigate: Nav;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
          style={{ background: 'linear-gradient(145deg, #F0C9AE, #EFD9C3)' }}>
          {userEmoji}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#3D2C1E]">{userName}</h2>
          <p className="text-sm text-[#9B8070]">Ekonom i upplärning 🌱</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Streak', val: `${streak} 🔥`, bg: '#F0C9AE' },
          { label: 'Köp', val: String(purchases.length), bg: '#EFD9C3' },
          { label: 'Ångrat', val: String(purchases.filter(p => p.regretted).length), bg: '#DCC4BC' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3.5 text-center shadow-[0_4px_16px_rgba(0,0,0,0.07)]" style={{ backgroundColor: s.bg }}>
            <p className="text-2xl font-black text-[#3D2C1E]">{s.val}</p>
            <p className="text-xs font-bold text-[#6B5344]">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] opacity-55">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-bold text-[#3D2C1E] text-sm">Köpkompisar</p>
              <p className="text-xs text-[#9B8070]">Jämför med vänner</p>
            </div>
          </div>
          <span className="bg-[#EFD9C3] text-[#8B6040] text-[10px] font-black rounded-full px-2.5 py-1 uppercase tracking-wide">Snart</span>
        </div>
      </div>
      {[
        { icon: '⚙️', label: 'Inställningar', action: () => navigate('settings') },
      ].map(item => (
        <button key={item.label} onClick={item.action}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all text-left w-full">
          <span className="text-2xl">{item.icon}</span>
          <span className="font-bold text-[#3D2C1E] flex-1 text-sm">{item.label}</span>
          <span className="text-[#9B8070] text-xl">›</span>
        </button>
      ))}
      {[{ icon: '🧠', label: 'Ekonomi-quiz' }, { icon: '❓', label: 'Support & hjälp' }].map(item => (
        <div key={item.label} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] opacity-55">
          <span className="text-2xl">{item.icon}</span>
          <span className="font-bold text-[#3D2C1E] flex-1 text-sm">{item.label}</span>
          <span className="bg-[#EFD9C3] text-[#8B6040] text-[10px] font-black rounded-full px-2.5 py-1 uppercase tracking-wide">Snart</span>
        </div>
      ))}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsScreen({ userName, userEmoji, consent, realReading, onBack, onSave, onReset }: {
  userName: string; userEmoji: string; consent: string | null; realReading: boolean; onBack: () => void;
  onSave: (name: string, emoji: string) => void; onReset: () => void;
}) {
  const [name, setName] = useState(userName);
  const [emoji, setEmoji] = useState(userEmoji);
  const [saved, setSaved] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">Inställningar</h2>
      </div>
      <Card>
        <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest mb-3">Konto</p>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="nm" className="text-xs font-bold text-[#9B8070] block mb-1.5">Namn</label>
            <input id="nm" value={name} onChange={e => { setName(e.target.value); setSaved(false); }}
              className="w-full rounded-xl px-4 py-3 bg-[#F5EFE2] font-bold text-[#3D2C1E] outline-none focus:ring-2 focus:ring-[#0F6E56] text-base"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9B8070] mb-1.5">Likhets-emoji</p>
            <div className="grid grid-cols-4 gap-2">
              {EMOJI_OPTS.map(e => (
                <button key={e} onClick={() => { setEmoji(e); setSaved(false); }}
                  className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all active:scale-90 ${emoji === e ? 'bg-[#0F6E56] shadow-md scale-105' : 'bg-[#F5EFE2]'}`}
                >{e}</button>
              ))}
            </div>
          </div>
        </div>
        <Btn variant="primary" sm full className="mt-3" disabled={!name.trim()}
          onClick={() => { onSave(name, emoji); setSaved(true); }}>
          {saved ? '✓ Sparat!' : 'Spara ändringar'}
        </Btn>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest">Notiser</p>
          <span className="bg-[#EFD9C3] text-[#8B6040] text-[10px] font-black rounded-full px-2.5 py-1 uppercase tracking-wide">Snart</span>
        </div>
        <div className="flex justify-between items-center opacity-50">
          <div>
            <p className="font-bold text-[#3D2C1E] text-sm">Dagliga påminnelser</p>
            <p className="text-xs text-[#9B8070]">Kommer i en senare version</p>
          </div>
          <div className="w-12 h-7 rounded-full bg-[#CCC] relative" aria-hidden="true">
            <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 left-1" />
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest mb-3">Din data och vårdnadshavare</p>
        <ul className="flex flex-col gap-2 text-sm text-[#5A4235] leading-relaxed list-disc pl-5">
          <li>Allt du lägger in sparas bara i den här telefonen. Det finns inget konto.</li>
          {realReading
            ? <li>När du väljer en skärmbild skickas den krypterat till en AI-tjänst som läser av siffrorna. Min Ekonom sparar inte bilden.</li>
            : <li>Dina skärmbilder lämnar aldrig telefonen och sparas inte.</li>}
          <li>Du kan radera allt själv, när du vill, längst ner på den här sidan.</li>
          <li>Det här är en testversion. Frågor? Kontakta den som bjöd in dig till testet.</li>
        </ul>
        <p className="text-xs text-[#9B8070] mt-3">
          {consent ? `Vårdnadshavare okej angavs ${new Date(consent).toLocaleDateString('sv-SE')}.` : 'Ingen vårdnadshavare har godkänt ännu.'}
        </p>
      </Card>

      <Card>
        <p className="text-xs font-black text-[#9B8070] uppercase tracking-widest mb-3">Börja om</p>
        {!confirmDel ? (
          <Btn variant="coral" full sm onClick={() => setConfirmDel(true)}>Radera all min data</Btn>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#3D2C1E]">Säker? Summan på kontot, köp, drömmar och badges försvinner för alltid.</p>
            <div className="flex gap-2">
              <Btn variant="secondary" sm full onClick={() => setConfirmDel(false)}>Avbryt</Btn>
              <Btn variant="coral" sm full onClick={onReset}>Ja, radera</Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Update balance / purchases ───────────────────────────────────────────────

const FAKE_SHOPS: { name: string; emoji: string; category: string; min: number; max: number }[] = [
  { name: 'Pressbyrån', emoji: '🍫', category: 'Godis', min: 15, max: 60 },
  { name: 'Max Burgers', emoji: '🍔', category: 'Mat', min: 59, max: 129 },
  { name: 'Espresso House', emoji: '☕', category: 'Fika', min: 35, max: 75 },
  { name: 'Steam', emoji: '🎮', category: 'Spel', min: 49, max: 199 },
  { name: 'H&M', emoji: '👕', category: 'Kläder', min: 99, max: 349 },
  { name: 'Bubble Tea', emoji: '🧋', category: 'Dryck', min: 45, max: 69 },
];
const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));

function UpdateBalance({ mode, testCode, existing, onBack, onBalance, onPurchases }: {
  mode: 'balance' | 'purchases'; testCode: string | null; existing: Purchase[]; onBack: () => void;
  onBalance: (n: number) => void; onPurchases: (list: Purchase[]) => void;
}) {
  const isBal = mode === 'balance';
  const [step, setStep] = useState<'start' | 'loading' | 'detected' | 'manual' | 'error'>('start');
  const [detected, setDetected] = useState(0);
  const [found, setFound] = useState<Purchase[]>([]);
  const [manAmt, setManAmt] = useState('');
  const [pName, setPName] = useState('');
  const [pCat, setPCat] = useState(CATEGORIES[0].name);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Testversion: bilden läses aldrig. Siffrorna är påhittade och användaren bekräftar eller ändrar dem.
  const simulate = () => {
    setStep('loading');
    timer.current = window.setTimeout(() => {
      if (Math.random() < 0.15) { setStep('error'); return; }
      if (isBal) setDetected(rnd(150, 2400));
      else {
        const t = todayISO();
        const picks = [...FAKE_SHOPS].sort(() => Math.random() - 0.5).slice(0, 3);
        setFound(picks.map((s, i) => ({
          id: Date.now() + i, name: s.name, amount: rnd(s.min, s.max), iso: addDays(t, -i),
          emoji: s.emoji, regretted: false, category: s.category,
        })));
      }
      setStep('detected');
    }, 2200);
  };

  // Riktig avläsning (när testkod finns): bilden förminskas och görs om till JPEG i telefonen
  // (det tar också bort metadata) och skickas till vår serverfunktion. Den sparas inte.
  const readReal = async (file: File) => {
    setStep('loading'); setErrMsg(null);
    const fail = (msg?: string) => { setErrMsg(msg ?? null); setStep('error'); };
    try {
      const bmp = await createImageBitmap(file);
      const sc = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
      c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
      const image = c.toDataURL('image/jpeg', 0.85).split(',')[1];

      const ctl = new AbortController();
      const to = window.setTimeout(() => ctl.abort(), 45000);
      const res = await fetch('/api/read-screenshot', {
        method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: testCode, mode, today: todayISO(), image }),
      });
      window.clearTimeout(to);
      const j = await res.json();

      if (j.error === 'bad_code') return fail('Testkoden fungerar inte. Be den som bjöd in dig om en ny länk.');
      if (!j.ok) return fail();
      if (isBal) {
        if (typeof j.balance !== 'number') return fail();
        setDetected(j.balance);
      } else {
        const t = todayISO();
        const seen = new Set(existing.map(p => `${p.name}|${p.amount}|${p.iso}`));
        const list: Purchase[] = (j.purchases as { name: string; amount: number; date: string | null; category: string }[])
          .map((p, i) => {
            const cat = CATEGORIES.find(c => c.name === p.category) ?? CATEGORIES[CATEGORIES.length - 1];
            const iso = p.date && p.date <= t ? p.date : t;
            return { id: Date.now() + i, name: p.name, amount: p.amount, iso, emoji: cat.emoji, regretted: false, category: cat.name };
          })
          .filter(p => !seen.has(`${p.name}|${p.amount}|${p.iso}`));
        setFound(list);
      }
      setStep('detected');
    } catch {
      fail();
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = '';
    if (testCode) void readReal(f); else simulate();
  };

  const addManual = () => {
    const cat = CATEGORIES.find(c => c.name === pCat) ?? CATEGORIES[0];
    onPurchases([{
      id: Date.now(), name: pName.trim() || cat.name, amount: parseInt(manAmt) || 0,
      iso: todayISO(), emoji: cat.emoji, regretted: false, category: cat.name,
    }]);
  };

  const Note = () => testCode ? null : (
    <p className="text-[11px] text-[#9B8070] text-center leading-snug">
      Testversion: appen läser inte bilden på riktigt än, så siffrorna är påhittade.
      Din bild lämnar aldrig telefonen. Ändra gärna till rätt värde.
    </p>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <h2 className="text-xl font-black text-[#3D2C1E]">{isBal ? 'Uppdatera summan på konto' : 'Uppdatera köp'}</h2>
      </div>

      {step === 'start' && <>
        <CharlieComment mood="happy" text={isBal
          ? 'Ta en skärmbild av hemskärmen i din mobilbank, så läser jag av det åt dig! 📱'
          : 'Ta en skärmbild av dina senaste köp i mobilbanken, så sorterar jag dem åt dig! 📱'} />
        <Card>
          <ol className="flex flex-col gap-2 text-sm text-[#5A4235] font-semibold">
            <li>1. Öppna din mobilbank</li>
            <li>2. Ta en skärmbild av {isBal ? 'hemskärmen' : 'köpen'}</li>
            <li>3. Kom tillbaka hit och välj bilden</li>
          </ol>
        </Card>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <button onClick={() => fileRef.current?.click()}
          className="w-full rounded-3xl border-2 border-dashed border-[#C97B5C] bg-[#FFF8F3] py-10 flex flex-col items-center gap-3 active:bg-[#F0C9AE]/20 transition-all">
          <span className="text-5xl">📷</span>
          <p className="font-bold text-[#C97B5C]">Välj skärmbild</p>
          <p className="text-xs text-[#9B8070]">Tryck för att välja bild från galleriet</p>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E0D8CC]" />
          <span className="text-sm text-[#9B8070] font-semibold">eller</span>
          <div className="flex-1 h-px bg-[#E0D8CC]" />
        </div>
        <Btn variant="secondary" full onClick={() => setStep('manual')}>✏️ Skriv in själv</Btn>
        <Note />
      </>}

      {step === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Charlie size={90} mood="thinking" />
            <div className="absolute -right-1 -top-1 w-8 h-8 rounded-full bg-[#0F6E56] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#3D2C1E]">Läser av...</p>
            <p className="text-sm text-[#9B8070] mt-1">Det här tar bara några sekunder</p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#C97B5C]"
                style={{ animation: `pulse-dot 1s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      )}

      {step === 'detected' && isBal && <>
        <div className="flex flex-col items-center gap-3 py-4">
          <Charlie size={90} mood="money" />
          <p className="text-sm font-bold text-[#9B8070]">Stämmer det här?</p>
          <p className="text-5xl font-black text-[#0F6E56]">{detected.toLocaleString('sv-SE')} kr</p>
        </div>
        <div className="flex gap-2.5">
          <Btn variant="secondary" full onClick={() => { setManAmt(String(detected)); setStep('manual'); }}>Nej, ändra</Btn>
          <Btn variant="primary" full onClick={() => onBalance(detected)}>Ja, stämmer ✓</Btn>
        </div>
        <Note />
      </>}

      {step === 'detected' && !isBal && found.length === 0 && <>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Charlie size={90} mood="happy" />
          <p className="text-xl font-black text-[#3D2C1E]">Inga nya köp</p>
          <p className="text-sm text-[#6B5344] max-w-[250px]">Alla köp på bilden finns redan i appen.</p>
        </div>
        <Btn variant="primary" full onClick={onBack}>Tillbaka</Btn>
      </>}

      {step === 'detected' && !isBal && found.length > 0 && <>
        <CharlieComment mood="shopping" text="Jag hittade de här köpen. Stämmer det?" />
        <div className="flex flex-col gap-2.5">
          {found.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <span className="text-2xl w-11 h-11 flex items-center justify-center bg-[#F5EFE2] rounded-xl shrink-0">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#3D2C1E] text-sm truncate">{p.name}</p>
                <p className="text-xs text-[#9B8070]">{p.category} · {fmtDate(p.iso)}</p>
              </div>
              <p className="font-black text-[#3D2C1E] text-sm">−{p.amount} kr</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5">
          <Btn variant="secondary" full onClick={() => setStep('manual')}>Nej, skriv själv</Btn>
          <Btn variant="primary" full onClick={() => onPurchases(found)}>Ja, spara ✓</Btn>
        </div>
        <Note />
      </>}

      {step === 'error' && <>
        <div className="flex flex-col items-center gap-4 py-6">
          <Charlie size={90} mood="worried" />
          <div className="text-center">
            <p className="text-2xl font-black text-[#3D2C1E]">Vi kunde inte läsa av bilden</p>
            <p className="text-sm text-[#6B5344] mt-2 max-w-[270px] mx-auto">{errMsg ?? `${isBal ? 'Se till att det syns tydligt vad som finns på kontot' : 'Se till att hela listan syns tydligt'} på skärmbilden och försök igen.`}</p>
          </div>
        </div>
        <Btn variant="primary" full onClick={() => setStep('start')}>Försök igen</Btn>
        <Btn variant="secondary" full onClick={() => setStep('manual')}>Skriv in själv</Btn>
      </>}

      {step === 'manual' && isBal && <>
        <CharlieComment mood="happy" text="Okej! Skriv in hur mycket du har på kontot." />
        <input type="number" inputMode="numeric" value={manAmt} onChange={e => setManAmt(e.target.value)} placeholder="0 kr"
          aria-label="Vad finns på kontot i kronor"
          className="w-full rounded-2xl px-5 py-5 text-4xl font-black text-[#3D2C1E] bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#0F6E56] text-center"
        />
        <Btn variant="primary" full disabled={manAmt === ''} onClick={() => onBalance(Math.max(0, parseInt(manAmt) || 0))}>
          Spara summan →
        </Btn>
        <Btn variant="secondary" full onClick={() => setStep('start')}>← Tillbaka</Btn>
      </>}

      {step === 'manual' && !isBal && <>
        <CharlieComment mood="shopping" text="Vad köpte du, och för hur mycket?" />
        <Card>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="pn" className="text-xs font-bold text-[#9B8070] uppercase tracking-wide block mb-2">Vad köpte du?</label>
              <input id="pn" value={pName} onChange={e => setPName(e.target.value)} placeholder="t.ex. Lösgodis"
                className="w-full rounded-2xl px-4 py-3 font-bold text-[#3D2C1E] bg-[#F5EFE2] outline-none focus:ring-2 focus:ring-[#0F6E56] text-base" />
            </div>
            <div>
              <label htmlFor="pa" className="text-xs font-bold text-[#9B8070] uppercase tracking-wide block mb-2">Hur mycket kostade det?</label>
              <input id="pa" type="number" inputMode="numeric" value={manAmt} onChange={e => setManAmt(e.target.value)} placeholder="0 kr"
                className="w-full rounded-2xl px-4 py-3 font-bold text-[#3D2C1E] bg-[#F5EFE2] outline-none focus:ring-2 focus:ring-[#0F6E56] text-base" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#9B8070] uppercase tracking-wide mb-2">Typ av köp</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.name} onClick={() => setPCat(c.name)}
                    className={`rounded-full px-3 py-2 text-sm font-bold transition-all active:scale-95 ${pCat === c.name ? 'bg-[#0F6E56] text-white' : 'bg-[#F5EFE2] text-[#5A4235]'}`}
                  >{c.emoji} {c.name}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Btn variant="primary" full disabled={!manAmt || !(parseInt(manAmt) > 0)} onClick={addManual}>Spara köpet →</Btn>
        <Btn variant="secondary" full onClick={() => setStep('start')}>← Tillbaka</Btn>
      </>}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

type Entry = { id: string; params?: Record<string, unknown> };

export default function App() {
  const [st, setSt] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState(0);
  const [stack, setStack] = useState<Entry[]>([{ id: 'root' }]);

  const cur = stack[stack.length - 1];
  const isOverlay = cur.id !== 'root';
  const badges = computeBadges(st);
  const streak = currentStreak(st.openDays);

  // Spara allt lokalt vid varje ändring
  useEffect(() => { saveState(st); }, [st]);

  // Logga dagens besök (streak) – vid start och när appen kommer tillbaka i förgrunden
  useEffect(() => {
    if (!st.onboarded) return;
    const checkIn = () => {
      const t = todayISO();
      setSt(s => (s.openDays.includes(t) ? s : { ...s, openDays: [...s.openDays, t].slice(-400) }));
    };
    checkIn();
    const onVis = () => { if (document.visibilityState === 'visible') checkIn(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [st.onboarded]);

  // Bakåtknapp/svep på Android och iOS: håll historiken i takt med overlay-stacken
  useEffect(() => {
    window.history.replaceState({ depth: 0 }, '');
    const onPop = (e: PopStateEvent) => {
      const depth = (e.state?.depth as number | undefined) ?? 0;
      setStack(s => (depth + 1 < s.length ? s.slice(0, depth + 1) : s));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate: Nav = (id, params) => {
    if (id === 'tab') { setActiveTab((params?.tab as number) ?? 0); return; }
    window.history.pushState({ depth: stack.length }, '');
    setStack(s => [...s, { id, params }]);
  };
  /** Gå tillbaka n steg (default 1). Historiken styr, popstate uppdaterar stacken. */
  const pop = (n = 1) => {
    const k = Math.min(n, stack.length - 1);
    if (k > 0) window.history.go(-k);
  };

  // Fira nya badges – men först när användaren är tillbaka på en huvudflik
  useEffect(() => {
    if (!st.onboarded || cur.id !== 'root') return;
    const fresh = computeBadges(st).find(b => b.unlocked && !st.celebrated.includes(b.id));
    if (fresh) {
      setSt(s => ({ ...s, celebrated: [...s.celebrated, fresh.id] }));
      window.history.pushState({ depth: stack.length }, '');
      setStack(s => [...s, { id: 'badge-celebrate', params: { id: fresh.id } }]);
    }
  }, [st, cur.id, stack.length]);

  const resetAll = () => {
    clearState();
    const n = stack.length - 1;
    setSt({ ...freshState(), testCode: st.testCode });
    setActiveTab(0);
    setStack([{ id: 'root' }]);
    if (n > 0) window.history.go(-n);
  };

  const tabContent = () => {
    switch (activeTab) {
      case 0: return <HomeTab balance={st.balance} userName={st.userName} userEmoji={st.userEmoji} purchases={st.purchases} streak={streak} navigate={navigate} />;
      case 1: return <PurchasesTab purchases={st.purchases} navigate={navigate} />;
      case 2: return <DreamsTab dreams={st.dreams} setDreams={fn => setSt(s => ({ ...s, dreams: fn(s.dreams) }))} navigate={navigate} />;
      case 3: return <BadgesTab badges={badges} navigate={navigate} />;
      case 4: return <ProfileTab userName={st.userName} userEmoji={st.userEmoji} purchases={st.purchases} streak={streak} navigate={navigate} />;
    }
  };

  const overlayContent = () => {
    const { id, params } = cur;
    if (id === 'update') return (
      <UpdateBalance
        mode={(params?.mode as 'balance' | 'purchases') ?? 'balance'}
        testCode={st.testCode}
        existing={st.purchases}
        onBack={() => pop()}
        onBalance={n => { setSt(s => ({ ...s, balance: n })); pop(); }}
        onPurchases={list => { setSt(s => ({ ...s, purchases: [...list, ...s.purchases] })); pop(); }}
      />
    );
    if (id === 'purchase-detail') {
      const p = st.purchases.find(x => x.id === (params?.id as number));
      if (!p) return null;
      return <PurchaseDetail purchase={p} onBack={() => pop()} navigate={navigate} />;
    }
    if (id === 'angra') {
      const p = st.purchases.find(x => x.id === (params?.id as number));
      if (!p) return null;
      return (
        <AngraGuide purchase={p} onBack={() => pop()} onDone={() => {
          setSt(s => ({ ...s, purchases: s.purchases.map(x => x.id === p.id ? { ...x, regretted: true } : x) }));
          pop(2);
        }} />
      );
    }
    if (id === 'har-rad') return (
      <HarJagRad balance={st.balance} onBack={() => pop()} navigate={navigate}
        onChecked={() => setSt(s => ({ ...s, harRadCount: s.harRadCount + 1 }))} />
    );
    if (id === 'new-dream') return (
      <NewDream onBack={() => pop()} onAdd={(name, target, emoji) => {
        setSt(s => ({ ...s, dreams: [...s.dreams, { id: Date.now(), name, target, saved: 0, emoji }] }));
        pop();
      }} />
    );
    if (id === 'badge-celebrate') {
      const b = badges.find(x => x.id === (params?.id as number));
      if (!b) return null;
      return <BadgeCelebrate badge={b} onBack={() => pop()} />;
    }
    if (id === 'settings') return (
      <SettingsScreen userName={st.userName} userEmoji={st.userEmoji} consent={st.consent} realReading={!!st.testCode} onBack={() => pop()}
        onSave={(name, emoji) => setSt(s => ({ ...s, userName: name.trim() || s.userName, userEmoji: emoji }))}
        onReset={resetAll} />
    );
    return null;
  };

  if (!st.onboarded) return (
    <Shell>
      <Onboarding realReading={!!st.testCode} onComplete={(n, e, c) => setSt(s => ({ ...s, onboarded: true, consent: c, userName: n.trim(), userEmoji: e, openDays: [todayISO()] }))} />
    </Shell>
  );

  return (
    <Shell>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Flik-innehåll */}
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-150 ${isOverlay ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {tabContent()}
        </div>
        {/* Overlay */}
        {isOverlay && (
          <div className="absolute inset-0 bg-[#F5EFE2] flex flex-col animate-slide-up">
            {overlayContent()}
          </div>
        )}
      </div>
      {!isOverlay
        ? <BottomNav active={activeTab} onChange={t => { setActiveTab(t); }} />
        : <div className="shrink-0 bg-[#F5EFE2] h-[max(2rem,env(safe-area-inset-bottom))]" />
      }
    </Shell>
  );
}

