// Delar upp Charlie-spritearket i en SVG per pose med tight viewBox.
// Kör: node scripts/make-charlie.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const SRC = 'src/imports/bo_rsenuttryck.svg';
const OUT = 'src/charlie';
// mood -> index på toppnivå-grupp i spritearket
const MOODS = {
  happy: 7,      // vinkar, glad
  thinking: 2,   // hand mot kinden
  sad: 4,        // gråter
  worried: 5,    // orolig
  celebrate: 0,  // armarna uppe, kronmynt
  calm: 10,      // slutna ögon, lugn
  cool: 3,       // solglasögon
  shopping: 9,   // shoppingkassar
  love: 6,       // hjärtögon
  money: 12,     // sedlar på huvudet
  regret: 11,    // krysslagda ben, ångrar
  coin: 1,       // ler med ett mynt
};

const s = fs.readFileSync(SRC, 'utf8');
const di = s.indexOf('</defs>') + 7;
const head = s.slice(0, di);
const body = s.slice(di, s.lastIndexOf('</svg>'));
const re = /<(\/?)(g|path|rect|circle|ellipse|polygon|line|polyline)\b[^>]*?(\/?)>/g;
let m, depth = 0, start = 0;
const tops = [];
while ((m = re.exec(body))) {
  const [t, close, , self] = m;
  if (close) { depth--; if (depth === 0) tops.push([start, m.index + t.length]); }
  else { if (depth === 0) start = m.index; if (self) { if (depth === 0) tops.push([start, m.index + t.length]); } else depth++; }
}

fs.mkdirSync(OUT, { recursive: true });
for (const [mood, idx] of Object.entries(MOODS)) {
  const full = head + body.slice(tops[idx][0], tops[idx][1]) + '</svg>';
  const { data, info } = await sharp(Buffer.from(full), { density: 72 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const pad = 8;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  const w = Math.min(info.width, x1 + pad) - x0, h = Math.min(info.height, y1 + pad) - y0;
  const svg = full.replace(/viewBox="[^"]*"/, `viewBox="${x0} ${y0} ${w} ${h}"`);
  fs.writeFileSync(`${OUT}/${mood}.svg`, svg);
  console.log(mood.padEnd(10), `${w}x${h}`, (svg.length / 1024).toFixed(1) + ' KB');
}
