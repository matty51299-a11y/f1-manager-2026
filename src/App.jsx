import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   TEAM BADGES (SVG)
   ═══════════════════════════════════════════ */
function TeamBadge({ teamId, size = 22 }) {
  const s = size;
  const b = {
    mclaren: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#FF8000"/><path d="M12 26 L16 14 L20 22 L24 14 L28 26" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    ferrari: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="3" fill="#DC2626"/><text x="20" y="28" textAnchor="middle" fill="#FFD700" fontSize="22" fontWeight="900" fontFamily="serif">F</text></svg>),
    redbull: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#1E3A8A"/><path d="M12 22 Q16 12 20 18 Q24 12 28 22" stroke="#E2B53A" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="20" cy="14" r="2" fill="#DC2626"/></svg>),
    mercedes: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#00D2BE"/><circle cx="20" cy="20" r="12" fill="none" stroke="#fff" strokeWidth="1.5"/><line x1="20" y1="8" x2="20" y2="20" stroke="#fff" strokeWidth="2"/><line x1="20" y1="20" x2="10" y2="30" stroke="#fff" strokeWidth="2"/><line x1="20" y1="20" x2="30" y2="30" stroke="#fff" strokeWidth="2"/></svg>),
    aston: (<svg viewBox="0 0 40 40" width={s} height={s}><polygon points="20,4 36,20 20,36 4,20" fill="#166534"/><text x="20" y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="sans-serif">AM</text></svg>),
    alpine: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#2563EB"/><path d="M14 28 L20 12 L26 28" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="23" x2="24" y2="23" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>),
    williams: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="3" fill="#1D4ED8"/><text x="20" y="28" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900" fontFamily="sans-serif">W</text></svg>),
    haas: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="3" fill="#B91C1C"/><text x="20" y="28" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900" fontFamily="sans-serif">H</text></svg>),
    audi: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="16" fill="#374151"/><circle cx="11" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/><circle cx="17" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/><circle cx="23" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/><circle cx="29" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/></svg>),
    racingbulls: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#1E40AF"/><text x="20" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="sans-serif">RB</text></svg>),
    cadillac: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="8" width="32" height="24" rx="3" fill="#78716C"/><polygon points="20,12 24,18 20,16 16,18" fill="#E2B53A"/><rect x="14" y="20" width="12" height="2" fill="#E2B53A" rx="1"/><rect x="16" y="24" width="8" height="2" fill="#E2B53A" rx="1"/></svg>),
  };
  return b[teamId] || <span style={{ width: s, height: s, borderRadius: "50%", background: "#555", display: "inline-block" }} />;
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const TEAMS = [
  { id: "mclaren", name: "McLaren", color: "#FF8000", engine: "Mercedes", car: 94 },
  { id: "ferrari", name: "Ferrari", color: "#DC2626", engine: "Ferrari", car: 93 },
  { id: "redbull", name: "Red Bull Racing", color: "#3B82F6", engine: "Red Bull Ford", car: 95 },
  { id: "mercedes", name: "Mercedes", color: "#00D2BE", engine: "Mercedes", car: 91 },
  { id: "aston", name: "Aston Martin", color: "#22C55E", engine: "Honda", car: 82 },
  { id: "alpine", name: "Alpine", color: "#60A5FA", engine: "Renault", car: 78 },
  { id: "williams", name: "Williams", color: "#60A5FA", engine: "Mercedes", car: 80 },
  { id: "haas", name: "Haas", color: "#F87171", engine: "Ferrari", car: 76 },
  { id: "audi", name: "Audi", color: "#9CA3AF", engine: "Audi", car: 74 },
  { id: "racingbulls", name: "Racing Bulls", color: "#818CF8", engine: "Red Bull Ford", car: 79 },
  { id: "cadillac", name: "Cadillac", color: "#D6D3D1", engine: "Ferrari", car: 70 },
];

const F1_DRIVERS = [
  { name: "Lando Norris", age: 26, ovr: 95, pace: 5, consistency: 5, wet: 4, teamId: "mclaren", salary: 35, contractEnd: 2028 },
  { name: "Oscar Piastri", age: 24, ovr: 92, pace: 5, consistency: 4, wet: 4, teamId: "mclaren", salary: 20, contractEnd: 2027 },
  { name: "Lewis Hamilton", age: 41, ovr: 90, pace: 4, consistency: 5, wet: 5, teamId: "ferrari", salary: 40, contractEnd: 2027 },
  { name: "Charles Leclerc", age: 28, ovr: 93, pace: 5, consistency: 4, wet: 4, teamId: "ferrari", salary: 28, contractEnd: 2029 },
  { name: "Max Verstappen", age: 28, ovr: 97, pace: 5, consistency: 5, wet: 5, teamId: "redbull", salary: 55, contractEnd: 2028 },
  { name: "Isack Hadjar", age: 21, ovr: 78, pace: 4, consistency: 3, wet: 3, teamId: "redbull", salary: 4, contractEnd: 2027 },
  { name: "George Russell", age: 28, ovr: 91, pace: 5, consistency: 4, wet: 4, teamId: "mercedes", salary: 20, contractEnd: 2027 },
  { name: "Kimi Antonelli", age: 19, ovr: 82, pace: 5, consistency: 3, wet: 3, teamId: "mercedes", salary: 5, contractEnd: 2028 },
  { name: "Fernando Alonso", age: 44, ovr: 83, pace: 3, consistency: 5, wet: 5, teamId: "aston", salary: 18, contractEnd: 2026 },
  { name: "Lance Stroll", age: 27, ovr: 74, pace: 3, consistency: 3, wet: 3, teamId: "aston", salary: 10, contractEnd: 2027 },
  { name: "Pierre Gasly", age: 30, ovr: 82, pace: 4, consistency: 4, wet: 3, teamId: "alpine", salary: 10, contractEnd: 2028 },
  { name: "Franco Colapinto", age: 21, ovr: 75, pace: 4, consistency: 3, wet: 3, teamId: "alpine", salary: 3, contractEnd: 2027 },
  { name: "Carlos Sainz", age: 31, ovr: 88, pace: 4, consistency: 5, wet: 4, teamId: "williams", salary: 18, contractEnd: 2027 },
  { name: "Alex Albon", age: 30, ovr: 81, pace: 4, consistency: 3, wet: 3, teamId: "williams", salary: 8, contractEnd: 2027 },
  { name: "Esteban Ocon", age: 29, ovr: 79, pace: 3, consistency: 4, wet: 3, teamId: "haas", salary: 6, contractEnd: 2027 },
  { name: "Oliver Bearman", age: 21, ovr: 77, pace: 4, consistency: 3, wet: 3, teamId: "haas", salary: 3, contractEnd: 2027 },
  { name: "Nico Hulkenberg", age: 38, ovr: 78, pace: 3, consistency: 4, wet: 3, teamId: "audi", salary: 6, contractEnd: 2028 },
  { name: "Gabriel Bortoleto", age: 22, ovr: 76, pace: 4, consistency: 3, wet: 3, teamId: "audi", salary: 3, contractEnd: 2028 },
  { name: "Liam Lawson", age: 24, ovr: 77, pace: 4, consistency: 3, wet: 3, teamId: "racingbulls", salary: 3, contractEnd: 2027 },
  { name: "Arvid Lindblad", age: 18, ovr: 73, pace: 4, consistency: 3, wet: 2, teamId: "racingbulls", salary: 2, contractEnd: 2027 },
  { name: "Sergio Perez", age: 36, ovr: 76, pace: 3, consistency: 4, wet: 3, teamId: "cadillac", salary: 8, contractEnd: 2027 },
  { name: "Valtteri Bottas", age: 36, ovr: 75, pace: 3, consistency: 4, wet: 3, teamId: "cadillac", salary: 5, contractEnd: 2027 },
];

const PROSPECTS = [
  { name: "Nikola Tsolov", age: 19, ovr: 72, pace: 4, consistency: 3, wet: 3, series: "F2", salary: 2, pot: 88 },
  { name: "Rafael Câmara", age: 20, ovr: 71, pace: 4, consistency: 3, wet: 3, series: "F2", salary: 2, pot: 86 },
  { name: "Gabriele Minì", age: 20, ovr: 70, pace: 4, consistency: 3, wet: 3, series: "F2", salary: 2, pot: 85 },
  { name: "Laurens van Hoepen", age: 20, ovr: 69, pace: 4, consistency: 3, wet: 2, series: "F2", salary: 1, pot: 84 },
  { name: "Joshua Dürksen", age: 22, ovr: 70, pace: 3, consistency: 4, wet: 3, series: "F2", salary: 2, pot: 82 },
  { name: "Dino Beganovic", age: 22, ovr: 69, pace: 3, consistency: 3, wet: 3, series: "F2", salary: 1, pot: 81 },
  { name: "Martinius Stenshorne", age: 19, ovr: 67, pace: 4, consistency: 3, wet: 2, series: "F2", salary: 1, pot: 83 },
  { name: "Alexander Dunne", age: 21, ovr: 68, pace: 3, consistency: 3, wet: 3, series: "F2", salary: 1, pot: 80 },
  { name: "Sebastián Montoya", age: 20, ovr: 67, pace: 3, consistency: 3, wet: 2, series: "F2", salary: 1, pot: 79 },
  { name: "Oliver Goethe", age: 21, ovr: 66, pace: 3, consistency: 3, wet: 2, series: "F2", salary: 1, pot: 77 },
  { name: "Colton Herta", age: 26, ovr: 74, pace: 4, consistency: 3, wet: 3, series: "F2", salary: 3, pot: 80 },
  { name: "Ritomo Miyata", age: 24, ovr: 68, pace: 3, consistency: 3, wet: 3, series: "F2", salary: 1, pot: 78 },
  { name: "Pato O'Ward", age: 27, ovr: 80, pace: 4, consistency: 4, wet: 3, series: "IndyCar", salary: 5, pot: 85 },
  { name: "Kyle Kirkwood", age: 27, ovr: 76, pace: 4, consistency: 3, wet: 3, series: "IndyCar", salary: 3, pot: 80 },
  { name: "David Malukas", age: 25, ovr: 73, pace: 4, consistency: 3, wet: 2, series: "IndyCar", salary: 2, pot: 80 },
  { name: "Nolan Siegel", age: 21, ovr: 70, pace: 4, consistency: 3, wet: 2, series: "IndyCar", salary: 2, pot: 82 },
  { name: "Christian Lundgaard", age: 25, ovr: 74, pace: 3, consistency: 4, wet: 3, series: "IndyCar", salary: 3, pot: 79 },
  { name: "Ugo Ugochukwu", age: 18, ovr: 63, pace: 4, consistency: 2, wet: 2, series: "F3", salary: 1, pot: 87 },
  { name: "Noel León", age: 20, ovr: 65, pace: 3, consistency: 3, wet: 2, series: "F2", salary: 1, pot: 78 },
  { name: "Mari Boya", age: 20, ovr: 64, pace: 3, consistency: 3, wet: 2, series: "F2", salary: 1, pot: 76 },
];

const RACES_2026 = [
  { name: "Australian GP", circuit: "Albert Park", country: "AUS", baseLap: 78.5, laps: 58 },
  { name: "Chinese GP", circuit: "Shanghai International", country: "CHN", baseLap: 96.0, laps: 56 },
  { name: "Japanese GP", circuit: "Suzuka", country: "JPN", baseLap: 90.5, laps: 53 },
  { name: "Miami GP", circuit: "Miami International", country: "USA", baseLap: 89.0, laps: 57 },
  { name: "Emilia Romagna GP", circuit: "Imola", country: "ITA", baseLap: 75.5, laps: 63 },
  { name: "Monaco GP", circuit: "Circuit de Monaco", country: "MON", baseLap: 72.0, laps: 78 },
  { name: "Spanish GP", circuit: "Barcelona-Catalunya", country: "ESP", baseLap: 77.5, laps: 66 },
  { name: "Canadian GP", circuit: "Circuit Gilles Villeneuve", country: "CAN", baseLap: 73.5, laps: 70 },
  { name: "Austrian GP", circuit: "Red Bull Ring", country: "AUT", baseLap: 65.5, laps: 71 },
  { name: "British GP", circuit: "Silverstone", country: "GBR", baseLap: 87.0, laps: 52 },
  { name: "Belgian GP", circuit: "Spa-Francorchamps", country: "BEL", baseLap: 105.0, laps: 44 },
  { name: "Hungarian GP", circuit: "Hungaroring", country: "HUN", baseLap: 77.0, laps: 70 },
  { name: "Dutch GP", circuit: "Zandvoort", country: "NED", baseLap: 71.0, laps: 72 },
  { name: "Italian GP", circuit: "Monza", country: "ITA", baseLap: 80.5, laps: 53 },
  { name: "Azerbaijan GP", circuit: "Baku City Circuit", country: "AZE", baseLap: 103.0, laps: 51 },
  { name: "Singapore GP", circuit: "Marina Bay", country: "SGP", baseLap: 99.0, laps: 62 },
  { name: "US GP", circuit: "COTA", country: "USA", baseLap: 95.5, laps: 56 },
  { name: "Mexico City GP", circuit: "Hermanos Rodríguez", country: "MEX", baseLap: 77.0, laps: 71 },
  { name: "São Paulo GP", circuit: "Interlagos", country: "BRA", baseLap: 71.0, laps: 71 },
  { name: "Las Vegas GP", circuit: "Las Vegas Strip", country: "USA", baseLap: 93.0, laps: 50 },
  { name: "Qatar GP", circuit: "Lusail", country: "QAT", baseLap: 84.0, laps: 57 },
  { name: "Abu Dhabi GP", circuit: "Yas Marina", country: "UAE", baseLap: 86.0, laps: 58 },
];

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const WEATHER_TYPES = [
  { id: "dry", label: "DRY", icon: "☀️", chance: 0.55 },
  { id: "cloudy", label: "OVERCAST", icon: "☁️", chance: 0.2 },
  { id: "wet", label: "WET", icon: "🌧️", chance: 0.15 },
  { id: "storm", label: "STORM", icon: "⛈️", chance: 0.1 },
];

/* ═══════════════════════════════════════════
   COLOURS
   ═══════════════════════════════════════════ */
const BG = "#C41E1E", BG2 = "#A81818", BG3 = "#8E1212";
const BORDER = "rgba(255,255,255,0.18)", BORDER2 = "rgba(255,255,255,0.25)";
const DIM = "rgba(255,255,255,0.5)", DIM2 = "rgba(255,255,255,0.35)", DIM3 = "rgba(255,255,255,0.18)";
const TEXT = "#ffffff", TEXT2 = "rgba(255,255,255,0.85)";
const GOLD = "#FFD700", BLUE = "#5B8DEF", BLUE2 = "#3B6FD9";

const CAT_COLORS = {
  Driver: { bg: "rgba(59,130,246,0.3)", fg: "#60A5FA" },
  Team: { bg: "rgba(226,181,58,0.3)", fg: "#E2B53A" },
  Sponsor: { bg: "rgba(34,197,94,0.3)", fg: "#4ADE80" },
  Development: { bg: "rgba(168,85,247,0.3)", fg: "#C084FC" },
  Board: { bg: "rgba(239,68,68,0.3)", fg: "#F87171" },
  Weather: { bg: "rgba(96,165,250,0.3)", fg: "#93C5FD" },
  Rumour: { bg: "rgba(251,191,36,0.3)", fg: "#FCD34D" },
};

/* ═══════════════════════════════════════════
   NEWS / EVENT SYSTEM
   ═══════════════════════════════════════════ */
let _newsId = 0;
function makeNews(title, body, category, round, effect = null) {
  return { id: ++_newsId, title, body, category, round, effect, ts: Date.now() + _newsId };
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function maybe(chance) { return Math.random() < chance; }
function surname(name) { return name.split(" ").pop(); }

function rivalTeamName(myTeamId) {
  const others = TEAMS.filter(t => t.id !== myTeamId);
  return pick(others).name;
}

function genSeasonStart(team, drivers, round) {
  const d1 = drivers[0], d2 = drivers[1];
  const events = [];
  events.push(makeNews(
    `${team.name} Launch 2026 Campaign`,
    `The team rolled out their new challenger at the factory today. ${d1 ? surname(d1.name) : "The lead driver"} described the car as "a step forward in every area." The engineering department is cautiously optimistic heading into the season opener.`,
    "Team", round
  ));
  if (d1 && d1.age <= 22) {
    events.push(makeNews(
      `All Eyes on ${surname(d1.name)}`,
      `Paddock insiders are tipping ${d1.name} as the breakout star of 2026. At just ${d1.age}, expectations are high, but ${team.name} management have urged patience.`,
      "Rumour", round
    ));
  }
  if (maybe(0.6)) {
    const bonus = pick([3, 4, 5]);
    events.push(makeNews(
      `Title Sponsor Renews with ${team.name}`,
      `A multi-year title sponsorship extension has been confirmed, injecting fresh capital into the team's 2026 budget. The deal is worth an estimated $${bonus}M to the operation.`,
      "Sponsor", round, { type: "budget", value: bonus }
    ));
  }
  return events;
}

function genPreRace(team, drivers, race, round, budget, modifiers) {
  const events = [];
  if (maybe(0.35)) {
    const templates = [
      { title: `${team.name} Bring Upgrades to ${race.name}`, body: `The team has fast-tracked a revised floor package for ${race.circuit}. Early data from the simulator looks promising, though track correlation remains the big question.`, cat: "Development", effect: maybe(0.5) ? { type: "teamBoost", value: 2, duration: 1 } : null },
      { title: `Wind Tunnel Setback for ${team.name}`, body: `A correlation issue between the wind tunnel and CFD data has forced a rethink of the front wing concept. Engineers are working around the clock but this weekend's setup may be compromised.`, cat: "Development", effect: { type: "teamBoost", value: -2, duration: 1 } },
      { title: `${race.circuit} Presents Unique Challenge`, body: `The ${race.name} layout puts a premium on ${pick(["traction out of slow corners", "top-speed on the main straight", "mechanical grip through the chicanes", "tyre management over long stints"])}. ${team.name} engineers have been fine-tuning the setup all week.`, cat: "Team" },
    ];
    const t = pick(templates);
    events.push(makeNews(t.title, t.body, t.cat, round, t.effect));
  }
  if (maybe(0.2) && drivers.length > 0) {
    const d = pick(drivers);
    events.push(makeNews(
      `${surname(d.name)} Feeling Confident`,
      `"The car felt alive in the simulator," said ${d.name} ahead of ${race.name}. "If we can translate that to the track, we're in for a strong weekend." Team radio data backs up the optimism.`,
      "Driver", round, maybe(0.4) ? { type: "driverBoost", driverId: d.id, stat: "consistency", value: 1, duration: 1 } : null
    ));
  }
  if (maybe(0.15)) {
    events.push(makeNews(
      `Weather Watch: ${race.name}`,
      `Meteorologists are tracking ${pick(["a low-pressure system", "tropical moisture", "an unseasonal cold front", "heavy cloud cover"])} heading toward ${race.circuit}. Race-day conditions could be significantly affected.`,
      "Weather", round
    ));
  }
  if (budget < 15 && maybe(0.5)) {
    events.push(makeNews(
      `${team.name} Board Express Concern`,
      `With the budget dipping below $${budget}M, the board have requested an urgent financial review. Further spending must be carefully justified. "Every dollar counts now," said the team principal.`,
      "Board", round
    ));
  }
  if (maybe(0.12)) {
    const rival = rivalTeamName(team.id);
    const rd = pick(drivers.filter(d => d.teamId === team.id) || drivers);
    if (rd) {
      events.push(makeNews(
        `${rival} Eyeing ${surname(rd.name)}?`,
        `Paddock sources suggest ${rival} have made informal enquiries about ${rd.name}'s availability. The driver's contract runs until ${rd.contractEnd}, but that hasn't stopped speculation.`,
        "Rumour", round
      ));
    }
  }
  return events;
}

function genPostRace(team, drivers, raceResult, round, driverPoints, constructorPoints) {
  const events = [];
  const myResults = raceResult.results.map((d, pos) => ({ ...d, pos })).filter(d => d.teamId === team.id);
  const bestFinish = myResults.length > 0 ? Math.min(...myResults.filter(m => !m.dnf).map(m => m.pos + 1)) : 99;
  const anyDNF = myResults.some(m => m.dnf);
  const winner = raceResult.results[0];

  if (bestFinish <= 3 && bestFinish > 0) {
    const d = myResults.find(m => m.pos + 1 === bestFinish);
    events.push(makeNews(
      `Podium for ${d ? surname(d.name) : team.name}!`,
      `A brilliant P${bestFinish} finish at the ${raceResult.name}. ${d ? d.name : "The driver"} delivered a clinical performance that has the whole garage buzzing. "${pick(["That's what this team is capable of", "We executed perfectly today", "The car was on rails out there"])}" — ${d ? surname(d.name) : "the driver"} on the cooldown lap.`,
      "Driver", round, maybe(0.5) ? { type: "driverBoost", driverId: d?.id, stat: "pace", value: 1, duration: 2 } : null
    ));
    if (maybe(0.5)) {
      const bonus = pick([2, 3, 4]);
      events.push(makeNews(
        `Sponsors Thrilled After ${raceResult.name}`,
        `The podium finish has generated significant media exposure. ${team.name}'s commercial department report a surge in sponsor enquiries. A performance bonus of $${bonus}M has been triggered.`,
        "Sponsor", round, { type: "budget", value: bonus }
      ));
    }
  } else if (bestFinish <= 6) {
    if (maybe(0.4)) {
      events.push(makeNews(
        `Solid Points Haul at ${raceResult.name}`,
        `A P${bestFinish} finish keeps ${team.name} in the mix. The team extracted maximum points from the car's pace. Data from the race suggests further gains are possible with setup refinement.`,
        "Team", round
      ));
    }
  } else if (bestFinish > 10 || (myResults.length > 0 && myResults.every(m => m.dnf))) {
    events.push(makeNews(
      `Frustration After Difficult ${raceResult.name}`,
      `${team.name} leave ${raceResult.name.replace(" GP", "")} empty-handed${anyDNF ? " after a mechanical failure" : ""}. ${pick(["\"We need to understand what went wrong,\"", "\"Unacceptable. We'll regroup,\"", "\"The pace simply wasn't there,\""])} said the team principal in a terse post-race briefing.`,
      "Team", round
    ));
    if (maybe(0.35)) {
      events.push(makeNews(
        `Board Demand Improvement`,
        `The ${team.name} board have scheduled an emergency review following the disappointing ${raceResult.name}. Technical staff are under pressure to identify the root cause and deliver upgrades.`,
        "Board", round
      ));
    }
  }

  if (anyDNF) {
    const dnfD = myResults.find(m => m.dnf);
    if (dnfD && maybe(0.6)) {
      events.push(makeNews(
        `${surname(dnfD.name)} Retirement Under Investigation`,
        `${dnfD.name}'s race ended prematurely at the ${raceResult.name}. ${pick(["A suspected ${team.engine} power unit issue is being examined", "Telemetry indicates a gearbox failure", "A hydraulic leak forced the retirement", "An electronics glitch caused the car to shut down"])}. Parts are being shipped back to the factory for analysis.`,
        "Development", round, maybe(0.3) ? { type: "teamBoost", value: -1, duration: 2 } : null
      ));
    }
  }

  if (winner && winner.teamId !== team.id && maybe(0.25)) {
    const wTeam = TEAMS.find(t => t.id === winner.teamId);
    events.push(makeNews(
      `${wTeam?.name} Looking Dominant`,
      `${winner.name} took a commanding victory at the ${raceResult.name}. ${wTeam?.name} appear to have found a performance edge that the rest of the grid will need to respond to quickly.`,
      "Rumour", round
    ));
  }

  // Random mid-season events
  if (round >= 5 && round <= 18 && maybe(0.2)) {
    const randEvents = [
      { title: `${team.name} Sign Aero Specialist`, body: `A senior aerodynamicist from ${rivalTeamName(team.id)} has joined ${team.name} on a multi-year deal. The move is expected to pay dividends from the second half of the season.`, cat: "Team", effect: maybe(0.4) ? { type: "teamBoost", value: 1, duration: 3 } : null },
      { title: `FIA Technical Directive Impacts Field`, body: `A new clarification on ${pick(["floor flexibility", "active aero operation", "DRS activation zones", "battery deployment"])} could shuffle the competitive order. ${team.name}'s engineers are assessing the implications.`, cat: "Development" },
      { title: `${team.name} Extends Partnership`, body: `A key technical partner has extended their agreement, securing $${pick([2, 3, 5])}M in additional funding.`, cat: "Sponsor", effect: { type: "budget", value: pick([2, 3, 5]) } },
    ];
    const e = pick(randEvents);
    events.push(makeNews(e.title, e.body, e.cat, round, e.effect));
  }

  return events;
}

function genSigningNews(team, prospect, round) {
  const rookie = prospect.age <= 21;
  if (rookie) {
    return [makeNews(
      `${team.name} Sign ${prospect.name}`,
      `The ${prospect.age}-year-old ${prospect.series} talent has signed a two-year deal with ${team.name}. "${pick(["This is a dream come true", "I've worked my whole life for this", "I'm ready to prove myself at the highest level"])}" — ${prospect.name} at the announcement.`,
      "Driver", round
    ), makeNews(
      `Paddock Reacts to ${surname(prospect.name)} Signing`,
      `The signing of ${prospect.name} has generated significant buzz. Several rival team principals praised the move, with one calling it "${pick(["a bold play", "smart business", "exactly what that team needed"])}."`,
      "Rumour", round
    )];
  }
  return [makeNews(
    `${prospect.name} Joins ${team.name}`,
    `${prospect.name} makes the step up from ${prospect.series}, bringing ${pick(["race-winning pedigree", "a reputation as a tyre whisperer", "raw speed and ambition"])} to the team.`,
    "Driver", round
  )];
}

function genReleaseNews(team, driver, round) {
  return [makeNews(
    `${team.name} Part Ways with ${driver.name}`,
    `${driver.name} has been released from their contract by mutual agreement. "${pick(["We thank them for their contribution", "It's time for a fresh chapter", "The decision was not taken lightly"])}" — ${team.name} team principal.`,
    "Driver", round
  )];
}

function genSeasonEnd(team, constructorStandings, driverStandings, round) {
  const events = [];
  const cPos = constructorStandings.findIndex(s => s.team?.id === team.id) + 1;
  events.push(makeNews(
    `${team.name} End Season P${cPos} in Constructors'`,
    `The chequered flag falls on 2026. ${team.name} finish the year ${cPos <= 3 ? "with a strong" : cPos <= 6 ? "with a respectable" : "in a disappointing"} P${cPos} in the Constructors' Championship. ${pick(["The off-season development push begins now", "All eyes turn to 2027", "The debrief will be extensive"])}`,
    "Team", round
  ));
  if (cPos <= 3) {
    const bonus = pick([5, 8, 10]);
    events.push(makeNews(
      `Prize Money Windfall`,
      `A top-three Constructors' finish unlocks a significant FOM prize money bonus of $${bonus}M. The funds will be reinvested into the 2027 development programme.`,
      "Sponsor", round, { type: "budget", value: bonus }
    ));
  }
  return events;
}

function applyNewsEffects(news, gameState) {
  let newBudget = gameState.budget;
  let newModifiers = [...(gameState.modifiers || [])];
  let newDrivers = [...gameState.drivers];

  for (const n of news) {
    if (!n.effect) continue;
    const e = n.effect;
    if (e.type === "budget") {
      newBudget = Math.max(0, newBudget + e.value);
    } else if (e.type === "teamBoost") {
      newModifiers.push({ type: "teamBoost", teamId: gameState.team.id, value: e.value, duration: e.duration || 1 });
    } else if (e.type === "driverBoost" && e.driverId != null) {
      newModifiers.push({ type: "driverBoost", driverId: e.driverId, stat: e.stat, value: e.value, duration: e.duration || 1 });
    }
  }
  return { budget: newBudget, modifiers: newModifiers, drivers: newDrivers };
}

function tickModifiers(modifiers) {
  return modifiers.map(m => ({ ...m, duration: m.duration - 1 })).filter(m => m.duration > 0);
}

function getTeamMod(modifiers, teamId) {
  return modifiers.filter(m => m.type === "teamBoost" && m.teamId === teamId).reduce((s, m) => s + m.value, 0);
}

function getDriverMod(modifiers, driverId, stat) {
  return modifiers.filter(m => m.type === "driverBoost" && m.driverId === driverId && m.stat === stat).reduce((s, m) => s + m.value, 0);
}

/* ═══════════════════════════════════════════
   SIMULATION
   ═══════════════════════════════════════════ */
function pickWeather() { const r = Math.random(); let c = 0; for (const w of WEATHER_TYPES) { c += w.chance; if (r < c) return w; } return WEATHER_TYPES[0]; }
function formatTime(s) { const m = Math.floor(s / 60); return `${m}:${(s % 60).toFixed(3).padStart(6, "0")}`; }

function generateQuali(allDrivers, race, weather, modifiers, teamCars) {
  const isWet = weather.id === "wet" || weather.id === "storm";
  const trackForm = {}; TEAMS.forEach(t => { trackForm[t.id] = (Math.random() - 0.5) * 0.6 + getTeamMod(modifiers, t.id) * 0.12; });
  return allDrivers.map(d => {
    const pMod = getDriverMod(modifiers, d.id, "pace");
    const cMod = getDriverMod(modifiers, d.id, "consistency");
    const carVal = teamCars?.[d.teamId] ?? 75;
    const carPerf = (carVal / 100) * 5.0;                        // CAR: dominant — ~3.5 to 4.75s
    const driverSkill = ((d.ovr + cMod) / 100) * 1.5             // DRIVER: secondary — ~1.1 to 1.5s
      + ((d.pace + pMod) / 5) * 0.6                               // Pace talent
      + (isWet ? (d.wet / 5) * 0.8 : 0);                         // Wet skill
    const luck = (Math.random() - 0.5) * 1.4;                     // ±0.7s variance
    const lapTime = race.baseLap + (isWet ? 8 + Math.random() * 4 : 0)
      - carPerf - driverSkill + luck + (trackForm[d.teamId] || 0);
    const crashed = Math.random() < 0.03;
    return { ...d, lapTime: crashed ? null : lapTime, crashed };
  }).sort((a, b) => { if (a.crashed && b.crashed) return 0; if (a.crashed) return 1; if (b.crashed) return -1; return a.lapTime - b.lapTime; });
}

function generateRace(qualiResults, race, weather, modifiers, teamCars) {
  const isWet = weather.id === "wet" || weather.id === "storm";
  const trackForm = {}; TEAMS.forEach(t => { trackForm[t.id] = (Math.random() - 0.5) * 4 + getTeamMod(modifiers, t.id) * 1.5; });
  const chaotic = Math.random() < 0.1;
  return qualiResults.map((d, gp) => {
    const cMod = getDriverMod(modifiers, d.id, "consistency");
    const pMod = getDriverMod(modifiers, d.id, "pace");
    const carVal = teamCars?.[d.teamId] ?? 75;
    const carBase = carVal * 1.5;                                  // top car ~142, worst ~105
    const driverBase = (d.ovr * 0.4)                              // raw talent
      + ((d.consistency + cMod) * 2.0)                             // consistency king in races
      + ((d.pace + pMod) * 0.8)                                    // outright speed
      + (isWet ? d.wet * 2.5 : 0);                                 // wet craft
    const gridBonus = (qualiResults.length - gp) * 0.8;
    const form = trackForm[d.teamId] || 0;
    const luckRange = chaotic ? 14 : 8;
    const luck = (Math.random() - 0.5) * 2 * luckRange;
    const dnfChance = 0.03 + (gp > 15 ? 0.02 : 0);
    const dnf = Math.random() < dnfChance;
    return { ...d, raceScore: dnf ? -999 : carBase + driverBase + gridBonus + form + luck, dnf, gridPos: gp + 1 };
  }).sort((a, b) => b.raceScore - a.raceScore);
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function dots(n, max = 5) { return Array.from({ length: max }, (_, i) => (<span key={i} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: i < n ? BLUE : "rgba(0,0,0,0.2)", marginRight: 2 }} />)); }
function potBar(pot) { const pct = ((pot - 60) / 40) * 100; const col = pot >= 85 ? "#22C55E" : pot >= 80 ? "#E2B53A" : pot >= 75 ? "#F97316" : "#aaa"; return (<div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 50, height: 4, background: "rgba(0,0,0,0.2)", borderRadius: 2 }}><div style={{ width: `${Math.max(pct, 5)}%`, height: "100%", background: col, borderRadius: 2 }} /></div><span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{pot}</span></div>); }
function Sec({ children }) { return <div style={{ fontSize: 10, letterSpacing: 3, color: "#fff", fontWeight: 700, marginBottom: 14, paddingBottom: 6, borderBottom: `1px solid ${BLUE}33` }}>{children}</div>; }
function TS({ label, value, sub, color }) { return (<div><div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 1 }}>{label}</div><div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 20, fontWeight: 900, color: color || "#fff", fontFamily: "'Arial Black', sans-serif" }}>{value}</span>{sub && <span style={{ fontSize: 9, color: DIM }}>{sub}</span>}</div></div>); }


/* ═══════════════════════════════════════════
   COMPETITION SYSTEM
   ═══════════════════════════════════════════ */

// AI TRANSFER LOGIC
function aiTransfers(drivers, prospects, teamId, newSeason, transitionNews) {
  const updatedDrivers = drivers.map(d => ({ ...d }));
  let availableProspects = [...prospects];
  const released = new Set(); // track who was released so their old team can't re-sign them

  // ── PHASE 1: ALL teams release drivers first ──
  TEAMS.forEach(t => {
    if (t.id === teamId) return; // skip player team
    const tDrivers = updatedDrivers.filter(d => d.teamId === t.id);
    if (tDrivers.length === 0) return;

    // Sort worst first
    const sorted = [...tDrivers].sort((a, b) => a.ovr - b.ovr);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];
    const teamCar = TEAMS.find(x => x.id === t.id)?.car || 75;

    sorted.forEach(d => {
      // Don't release if it would leave the team with 0 drivers
      const remaining = updatedDrivers.filter(x => x.teamId === t.id).length;
      if (remaining <= 1) return;

      let shouldRelease = false;
      let reason = "";

      // Old veterans: 36+ with escalating probability
      if (d.age >= 40) { shouldRelease = maybe(0.8); reason = "age and declining performance"; }
      else if (d.age >= 37) { shouldRelease = maybe(0.5); reason = "the team's desire for a younger lineup"; }
      else if (d.age >= 35 && d.ovr < 80) { shouldRelease = maybe(0.35); reason = "failing to match the car's potential"; }

      // Underperformers relative to their teammate
      if (!shouldRelease && strongest && d.id !== strongest.id) {
        const gap = strongest.ovr - d.ovr;
        if (gap >= 15) { shouldRelease = maybe(0.7); reason = "a significant performance gap to their teammate"; }
        else if (gap >= 10) { shouldRelease = maybe(0.4); reason = "struggling to match their teammate's pace"; }
        else if (gap >= 7) { shouldRelease = maybe(0.2); reason = "inconsistent results"; }
      }

      // Driver too weak for the car (top teams drop mid-tier drivers)
      if (!shouldRelease && teamCar >= 85 && d.ovr < 78) {
        shouldRelease = maybe(0.6);
        reason = "not meeting the standards of a front-running team";
      }
      if (!shouldRelease && teamCar >= 75 && d.ovr < 72) {
        shouldRelease = maybe(0.5);
        reason = "underperforming relative to expectations";
      }

      // Low OVR in general
      if (!shouldRelease && d.ovr < 70) {
        shouldRelease = maybe(0.7);
        reason = "a difficult season";
      }

      if (shouldRelease) {
        const idx = updatedDrivers.findIndex(x => x.id === d.id);
        if (idx >= 0) {
          const oldTeam = t.name;
          updatedDrivers[idx] = { ...updatedDrivers[idx], teamId: null, contractEnd: null };
          released.add(d.id);
          // Retirement check: old + low OVR = retire, don't generate "free agent" news
          if (d.age >= 38 && d.ovr < 77) {
            transitionNews.push(makeNews(
              `${d.name} Announces Retirement`,
              `After ${pick(["a long and storied career", "years of dedicated service", "much deliberation"])}, ${d.name} has decided to hang up the helmet. The ${d.age}-year-old leaves the sport with the respect of the entire paddock.`,
              "Driver", 0
            ));
          } else {
            transitionNews.push(makeNews(
              `${oldTeam} Release ${d.name}`,
              `${d.name} departs ${oldTeam} after ${reason}. The ${d.age}-year-old (OVR ${d.ovr}) is now available on the market.`,
              "Driver", 0
            ));
          }
        }
      }
    });
  });

  // ── PHASE 2: ALL teams fill empty seats ──
  TEAMS.forEach(t => {
    if (t.id === teamId) return;
    const currentCount = updatedDrivers.filter(d => d.teamId === t.id).length;
    let needed = 2 - currentCount;
    if (needed <= 0) return;

    const teamCar = TEAMS.find(x => x.id === t.id)?.car || 75;

    while (needed > 0) {
      // Free agents: exclude drivers this team just released, and retired drivers
      const freeAgents = updatedDrivers
        .filter(d => d.teamId === null && !released.has(d.id) && !(d.age >= 38 && d.ovr < 77))
        .sort((a, b) => b.ovr - a.ovr);

      // Top teams prefer better drivers, backmarker teams are less picky
      const targetOvr = teamCar >= 90 ? 80 : teamCar >= 80 ? 72 : 65;
      const bestFA = freeAgents.find(d => d.ovr >= targetOvr) || freeAgents[0];
      const bestProspect = availableProspects.sort((a, b) => b.ovr - a.ovr)[0];

      // Prefer FA if they're clearly better, otherwise promote a prospect
      if (bestFA && (!bestProspect || bestFA.ovr >= bestProspect.ovr + 3)) {
        const idx = updatedDrivers.findIndex(x => x.id === bestFA.id);
        if (idx >= 0) {
          updatedDrivers[idx] = { ...updatedDrivers[idx], teamId: t.id, contractEnd: newSeason + 1 + Math.floor(Math.random() * 2) };
          transitionNews.push(makeNews(
            `${bestFA.name} Signs for ${t.name}`,
            `${t.name} have signed ${bestFA.name} (OVR ${bestFA.ovr}) to fill their vacant seat for ${newSeason}.`,
            "Driver", 0
          ));
        }
      } else if (bestProspect) {
        const newDriver = { ...bestProspect, teamId: t.id, contractEnd: newSeason + 2 };
        updatedDrivers.push(newDriver);
        availableProspects = availableProspects.filter(x => x.id !== bestProspect.id);
        transitionNews.push(makeNews(
          `${t.name} Promote ${bestProspect.name}`,
          `${bestProspect.series} talent ${bestProspect.name} (OVR ${bestProspect.ovr}) earns an F1 seat with ${t.name} for ${newSeason}.`,
          "Driver", 0
        ));
      } else if (bestFA) {
        // Fallback: sign anyone available
        const idx = updatedDrivers.findIndex(x => x.id === bestFA.id);
        if (idx >= 0) {
          updatedDrivers[idx] = { ...updatedDrivers[idx], teamId: t.id, contractEnd: newSeason + 1 };
          transitionNews.push(makeNews(
            `${bestFA.name} Joins ${t.name}`,
            `With limited options, ${t.name} bring in ${bestFA.name} (OVR ${bestFA.ovr}) for ${newSeason}.`,
            "Driver", 0
          ));
        }
      } else {
        break;
      }
      needed--;
    }
  });

  // ── PHASE 3: Remaining free agents go to scouting pool ──
  // Non-retired released drivers become available prospects for the player
  const remainingFAs = updatedDrivers.filter(d => d.teamId === null && released.has(d.id) && !(d.age >= 38 && d.ovr < 77));
  remainingFAs.forEach(fa => {
    // Add to prospects pool so player can sign them
    if (!availableProspects.find(p => p.id === fa.id)) {
      availableProspects.push({
        ...fa,
        series: "Free Agent",
        salary: Math.max(1, Math.floor(fa.salary * 0.6)),
        pot: fa.ovr + Math.floor(Math.random() * 5),
        teamId: null,
        contractEnd: null,
      });
    }
  });

  return { drivers: updatedDrivers, prospects: availableProspects };
}

// MID-SEASON REGULATION CHANGE
function genMidSeasonReg(teamCars, round, teamName) {
  if (!maybe(0.12)) return { news: [], teamCars };
  const affected = pick(TEAMS);
  const otherAffected = pick(TEAMS.filter(t => t.id !== affected.id));
  const delta = pick([2, 3, 4]);
  const type = pick([
    { title: "FIA Floor Flexibility Directive", desc: "A new technical directive on floor stiffness" },
    { title: "Revised DRS Activation Rules", desc: "Changes to DRS zone placement" },
    { title: "Minimum Weight Increase", desc: "A 2kg minimum weight increase" },
    { title: "Engine Mode Restriction", desc: "New limits on qualifying engine modes" },
    { title: "Suspension Geometry Clampdown", desc: "Stricter interpretation of front suspension geometry" },
  ]);
  const newCars = { ...teamCars };
  newCars[affected.id] = Math.max(65, Math.min(98, (newCars[affected.id] || 75) - delta));
  newCars[otherAffected.id] = Math.min(98, (newCars[otherAffected.id] || 75) + Math.floor(delta * 0.6));
  const news = [makeNews(
    type.title,
    `${type.desc} has reshuffled the competitive order. ${affected.name} appear to have lost performance, while ${otherAffected.name} may benefit. Engineers across the paddock are scrambling to adapt.`,
    "Development", round
  )];
  return { news, teamCars: newCars };
}

// RIVALRY TRACKING
function updateRivalry(constructorPoints, driverPoints, team, drivers, prevRivalry) {
  const cStandings = Object.entries(constructorPoints).map(([id, pts]) => ({ teamId: id, pts })).sort((a, b) => b.pts - a.pts);
  const myIdx = cStandings.findIndex(s => s.teamId === team.id);
  const myPts = constructorPoints[team.id] || 0;

  // Find closest rival (adjacent in standings, or whoever is closest in points)
  let rivalId = null;
  let rivalPts = 0;
  if (myIdx > 0) {
    const above = cStandings[myIdx - 1];
    const below = cStandings[myIdx + 1];
    if (above && below) {
      rivalId = (above.pts - myPts) < (myPts - below.pts) ? above.teamId : below.teamId;
    } else {
      rivalId = (above || below)?.teamId;
    }
  } else if (cStandings.length > 1) {
    rivalId = cStandings[1]?.teamId;
  }
  rivalPts = constructorPoints[rivalId] || 0;
  const rivalTeam = TEAMS.find(t => t.id === rivalId);
  const gap = myPts - rivalPts;

  // Head-to-head race wins this season
  const h2h = (prevRivalry?.rivalId === rivalId) ? prevRivalry.h2h : { you: 0, them: 0 };

  return { rivalId, rivalName: rivalTeam?.name || "—", gap, h2h, streak: prevRivalry?.streak || 0 };
}

function updateRivalryPostRace(rivalry, raceResult, teamId) {
  if (!rivalry || !raceResult) return rivalry;
  const myBest = raceResult.results.map((d, p) => ({ ...d, p })).filter(d => d.teamId === teamId && !d.dnf).sort((a, b) => a.p - b.p)[0];
  const rivalBest = raceResult.results.map((d, p) => ({ ...d, p })).filter(d => d.teamId === rivalry.rivalId && !d.dnf).sort((a, b) => a.p - b.p)[0];
  const h2h = { ...rivalry.h2h };
  let streak = rivalry.streak || 0;
  if (myBest && rivalBest) {
    if (myBest.p < rivalBest.p) { h2h.you++; streak = streak >= 0 ? streak + 1 : 1; }
    else { h2h.them++; streak = streak <= 0 ? streak - 1 : -1; }
  }
  return { ...rivalry, h2h, streak };
}

// HISTORY TRACKING
function updateHistory(history, season, raceResult, driverPoints, constructorPoints, team, qualiResults) {
  const h = { ...history };
  if (!h.seasons) h.seasons = [];
  if (!h.totalWins) h.totalWins = 0;
  if (!h.totalPodiums) h.totalPodiums = 0;
  if (!h.totalPoles) h.totalPoles = 0;
  if (!h.totalPoints) h.totalPoints = 0;
  if (!h.totalRaces) h.totalRaces = 0;
  if (!h.titles) h.titles = { wdc: 0, wcc: 0 };
  if (!h.bestFinishes) h.bestFinishes = [];
  if (!h._sw) h._sw = 0; // season wins
  if (!h._sp) h._sp = 0; // season podiums

  // Per-race updates
  if (raceResult) {
    h.totalRaces++;
    const myResults = raceResult.results.map((d, pos) => ({ ...d, pos })).filter(d => d.teamId === team.id);
    myResults.forEach(mr => {
      if (!mr.dnf) {
        if (mr.pos === 0) { h.totalWins++; h._sw++; }
        if (mr.pos < 3) { h.totalPodiums++; h._sp++; }
      }
    });
    if (qualiResults) {
      const myQuali = qualiResults.filter(d => d.teamId === team.id);
      if (myQuali[0] && !myQuali[0].crashed && qualiResults[0]?.teamId === team.id) h.totalPoles++;
    }
  }
  return h;
}

function finaliseSeasonHistory(history, season, driverPoints, constructorPoints, team, drivers) {
  const h = { ...history };
  const cStandings = Object.entries(constructorPoints).map(([id, pts]) => ({ teamId: id, pts })).sort((a, b) => b.pts - a.pts);
  const dStandings = Object.entries(driverPoints).map(([id, pts]) => {
    const d = drivers.find(x => x.id === parseInt(id));
    return d ? { driver: d, pts } : null;
  }).filter(Boolean).sort((a, b) => b.pts - a.pts);

  const cPos = cStandings.findIndex(s => s.teamId === team.id) + 1;
  const cPts = constructorPoints[team.id] || 0;
  const myDriverResults = drivers.filter(d => d.teamId === team.id).map(d => {
    const pos = dStandings.findIndex(s => s.driver?.id === d.id) + 1;
    return { name: d.name, pos, pts: driverPoints[d.id] || 0 };
  });
  const bestWDC = myDriverResults.length > 0 ? Math.min(...myDriverResults.map(d => d.pos)) : 99;

  if (cPos === 1) h.titles.wcc++;
  if (bestWDC === 1) h.titles.wdc++;
  h.totalPoints += cPts;

  h.seasons.push({ year: season, wccPos: cPos, wccPts: cPts, drivers: myDriverResults, wins: h.totalWins, podiums: h.totalPodiums });
  return h;
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
function initGame(pid) {
  _newsId = 0;
  const pt = TEAMS.find(t => t.id === pid);
  const drivers = F1_DRIVERS.map((d, i) => ({ ...d, id: i }));
  const myD = drivers.filter(d => d.teamId === pid);
  const startNews = genSeasonStart(pt, myD, 0);
  const effects = applyNewsEffects(startNews, { budget: 70, modifiers: [], team: pt, drivers });
  const teamCars = {}; TEAMS.forEach(t => { teamCars[t.id] = t.car; });
  return {
    team: pt, drivers, prospects: PROSPECTS.map((p, i) => ({ ...p, id: 100 + i, teamId: null, contractEnd: null })),
    budget: effects.budget, season: 2026, raceIndex: 0,
    raceResults: [], driverPoints: {}, constructorPoints: {},
    tab: "race", weekendPhase: "preview",
    qualiResults: null, raceResult: null, raceWeather: null, qualiWeather: null,
    revealCount: 0, raceRevealCount: 0,
    news: startNews, modifiers: effects.modifiers,
    unreadNews: startNews.length, teamCars,
    history: { totalWins: 0, totalPodiums: 0, totalPoles: 0, totalPoints: 0, totalRaces: 0, titles: { wdc: 0, wcc: 0 }, seasons: [], bestFinishes: [] },
    rivalry: null,
  };
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function F1Manager() {
  const [game, setGame] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const timerRef = useRef(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* ── TEAM SELECT ── */
  if (!game) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Courier New', monospace", color: TEXT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: 8, color: BLUE, marginBottom: 12, fontWeight: 700 }}>FORMULA ONE</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, margin: 0, lineHeight: 1, color: "#fff", fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}>PIT WALL</h1>
          <div style={{ fontSize: 14, color: DIM, marginTop: 8, letterSpacing: 3 }}>TEAM MANAGER — 2026 SEASON</div>
        </div>
        <div style={{ fontSize: 12, color: DIM, marginBottom: 16, letterSpacing: 3 }}>SELECT YOUR TEAM</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "100%", maxWidth: 540 }}>
          {TEAMS.map(t => {
            const td = F1_DRIVERS.filter(d => d.teamId === t.id); const sel = selectedTeam === t.id;
            return (<button key={t.id} onClick={() => setSelectedTeam(t.id)} style={{ background: sel ? `${t.color}35` : BG3, border: `1px solid ${sel ? t.color : BORDER}`, color: sel ? "#fff" : TEXT2, padding: "12px 14px", cursor: "pointer", textAlign: "left", fontSize: 12, fontFamily: "inherit", transition: "all 0.15s", fontWeight: sel ? 700 : 400 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><TeamBadge teamId={t.id} size={20} />{t.name}</div>
              <div style={{ fontSize: 10, color: DIM }}>{td.map(d => d.name.split(" ").pop()).join(" · ")} · {t.engine}</div>
            </button>);
          })}
        </div>
        {selectedTeam && <button onClick={() => setGame(initGame(selectedTeam))} style={{ marginTop: 20, padding: "12px 44px", background: BLUE, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 2, fontFamily: "inherit" }}>START SEASON →</button>}
      </div>
    );
  }

  /* ── GAME LOGIC ── */
  const { team, drivers, prospects, budget, season, raceIndex, raceResults, driverPoints, constructorPoints, tab, weekendPhase, qualiResults, raceResult, raceWeather, qualiWeather, revealCount, raceRevealCount, news, modifiers, unreadNews, teamCars, history, rivalry } = game;
  const myDrivers = drivers.filter(d => d.teamId === team.id);
  const allActive = drivers.filter(d => d.teamId !== null);
  const currentRace = RACES_2026[raceIndex];

  const addNews = (newEvents, stateOverrides = {}) => {
    setGame(p => {
      const effects = applyNewsEffects(newEvents, { ...p, ...stateOverrides });
      return { ...p, ...stateOverrides, news: [...newEvents, ...p.news], budget: effects.budget, modifiers: effects.modifiers, unreadNews: (p.tab !== "news" ? (p.unreadNews || 0) + newEvents.length : 0) };
    });
  };

  const startQuali = () => {
    const qw = pickWeather();
    const preNews = genPreRace(team, myDrivers, currentRace, raceIndex + 1, budget, modifiers);
    const res = generateQuali(allActive, currentRace, qw, modifiers, teamCars);
    setGame(p => {
      const effects = applyNewsEffects(preNews, p);
      return { ...p, weekendPhase: "quali_reveal", qualiResults: res, qualiWeather: qw, revealCount: 0, news: [...preNews, ...p.news], budget: effects.budget, modifiers: effects.modifiers };
    });
    let c = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { c++; setGame(p => ({ ...p, revealCount: c })); if (c >= res.length) clearInterval(timerRef.current); }, 120);
  };

  const startRace = () => {
    const rw = pickWeather();
    const res = generateRace(qualiResults, currentRace, rw, modifiers, teamCars);
    const rr = { results: res, wet: rw.id === "wet" || rw.id === "storm", weather: rw, name: currentRace.name };
    setGame(p => ({ ...p, weekendPhase: "race_reveal", raceResult: rr, raceWeather: rw, raceRevealCount: 0 }));
    let c = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      c++; setGame(p => ({ ...p, raceRevealCount: c }));
      if (c >= res.length) {
        clearInterval(timerRef.current);
        setTimeout(() => {
          setGame(p => {
            const ndp = { ...p.driverPoints }, ncp = { ...p.constructorPoints };
            res.forEach((d, pos) => { if (!d.dnf && pos < 10) { ndp[d.id] = (ndp[d.id] || 0) + POINTS[pos]; ncp[d.teamId] = (ncp[d.teamId] || 0) + POINTS[pos]; } });
            const postNews = genPostRace(team, myDrivers, rr, raceIndex + 1, ndp, ncp);
            const isLast = raceIndex + 1 >= RACES_2026.length;
            const cStandings = Object.entries(ncp).map(([id, pts]) => ({ team: TEAMS.find(t => t.id === id), pts })).sort((a, b) => b.pts - a.pts);
            const dStandings = Object.entries(ndp).map(([id, pts]) => { const d = p.drivers.find(x => x.id === parseInt(id)); return d ? { driver: d, pts } : null; }).filter(Boolean).sort((a, b) => b.pts - a.pts);
            const endNews = isLast ? genSeasonEnd(team, cStandings, dStandings, raceIndex + 1) : [];
            // Mid-season regulation change
            const regChange = (raceIndex + 1 >= 6 && raceIndex + 1 <= 18) ? genMidSeasonReg(p.teamCars, raceIndex + 1, team.name) : { news: [], teamCars: p.teamCars };
            const allNew = [...endNews, ...postNews, ...regChange.news];
            const effects = applyNewsEffects(allNew, { ...p, budget: p.budget, modifiers: p.modifiers });
            const ticked = tickModifiers(effects.modifiers);
            // Update history
            const newHist = updateHistory(p.history, p.season, rr, ndp, ncp, team, p.qualiResults);
            const finalisedHist = isLast ? finaliseSeasonHistory(newHist, p.season, ndp, ncp, team, p.drivers) : newHist;
            // Update rivalry
            const baseRivalry = updateRivalry(ncp, ndp, team, p.drivers, p.rivalry);
            const newRivalry = updateRivalryPostRace(baseRivalry, rr, team.id);
            return { ...p, driverPoints: ndp, constructorPoints: ncp, weekendPhase: "race_done", raceResults: [...p.raceResults, rr], news: [...allNew, ...p.news], budget: effects.budget, modifiers: ticked, teamCars: regChange.teamCars, history: finalisedHist, rivalry: newRivalry };
          });
        }, 400);
      }
    }, 150);
  };

  const nextWeekend = () => { setGame(p => ({ ...p, raceIndex: p.raceIndex + 1, weekendPhase: "preview", qualiResults: null, raceResult: null, revealCount: 0, raceRevealCount: 0 })); };

  const startNextSeason = () => {
    setGame(p => {
      const newSeason = p.season + 1;
      const cStandings = Object.entries(p.constructorPoints).map(([id, pts]) => ({ team: TEAMS.find(t => t.id === id), pts })).sort((a, b) => b.pts - a.pts);
      const cPos = cStandings.findIndex(s => s.team?.id === team.id) + 1;

      // Prize money based on constructor finish
      const prizeMoney = cPos === 1 ? 15 : cPos === 2 ? 10 : cPos === 3 ? 8 : cPos <= 6 ? 5 : 3;
      const baseBudget = 50;

      // Process drivers: age them, handle OVR growth/decline, expire contracts
      const processedDrivers = p.drivers.map(d => {
        const newAge = d.age + 1;
        let ovrChange = 0;
        // Young drivers improve
        if (newAge <= 23) ovrChange = Math.floor(Math.random() * 3) + 1; // +1 to +3
        else if (newAge <= 27) ovrChange = Math.floor(Math.random() * 2); // 0 to +1
        // Veterans decline
        else if (newAge >= 36) ovrChange = -(Math.floor(Math.random() * 3) + 1); // -1 to -3
        else if (newAge >= 33) ovrChange = -Math.floor(Math.random() * 2); // 0 to -1

        const newOvr = Math.max(55, Math.min(99, d.ovr + ovrChange));
        const contractExpired = d.contractEnd && d.contractEnd <= p.season;
        const isMyDriver = d.teamId === team.id;

        return {
          ...d,
          age: newAge,
          ovr: newOvr,
          // If contract expired and they're on MY team, keep them but flag for renewal
          // If contract expired and on another team, they stay (AI manages their own)
          teamId: contractExpired && isMyDriver ? null : d.teamId,
          contractEnd: contractExpired && !isMyDriver ? newSeason + 1 + Math.floor(Math.random() * 2) : d.contractEnd,
        };
      });

      // Refresh some prospects: remove signed ones, age them, add potential new F2 grads
      const refreshedProspects = p.prospects.map(pr => {
        const newAge = pr.age + 1;
        const ovrGain = Math.floor(Math.random() * 3) + 1;
        return { ...pr, age: newAge, ovr: Math.min(pr.pot, pr.ovr + ovrGain) };
      });

      // Fresh prospect injection every season
      const freshProspects = [
        { name: pick(["Lucas Martín", "Tom Verschoor", "Kacper Nowak", "Yuto Tanaka", "Matteo Rossi", "Elias Berger", "Hugo Petit", "Nils Stenberg"]), age: 18, ovr: 60 + Math.floor(Math.random() * 8), pace: pick([3, 4]), consistency: pick([2, 3]), wet: pick([2, 3]), series: "F3", salary: 1, pot: 75 + Math.floor(Math.random() * 13), id: 200 + newSeason + Math.floor(Math.random() * 100), teamId: null, contractEnd: null },
        { name: pick(["André Silva", "Finn McCarthy", "Oscar Lindqvist", "Kai Taniguchi", "Leo Fernández", "Max Schultz", "Ravi Patel", "Cillian Byrne"]), age: 19, ovr: 62 + Math.floor(Math.random() * 8), pace: pick([3, 4]), consistency: pick([2, 3]), wet: pick([2, 3]), series: "F2", salary: 1, pot: 76 + Math.floor(Math.random() * 12), id: 300 + newSeason + Math.floor(Math.random() * 100), teamId: null, contractEnd: null },
      ];
      const allProspects = [...refreshedProspects, ...freshProspects];

      // Car performance evolution: teams shuffle between seasons
      // Bottom teams improve more (regulation catch-up), top teams regress slightly
      const newTeamCars = {};
      TEAMS.forEach(t => {
        const oldCar = p.teamCars?.[t.id] ?? t.car;
        // Mean reversion: pull toward 80
        const reversion = (80 - oldCar) * 0.15;
        // Random development: ±3
        const dev = (Math.random() - 0.5) * 6;
        // Better finishers get slight boost from prize money investment
        const tCPos = cStandings.findIndex(s => s.team?.id === t.id);
        const finishBonus = tCPos >= 0 ? (11 - tCPos) * 0.2 : 0;
        newTeamCars[t.id] = Math.max(65, Math.min(98, Math.round(oldCar + reversion + dev + finishBonus)));
      });

      // AI TRANSFERS — other teams shuffle their lineups
      const transitionNews = [];
      const aiResult = aiTransfers(processedDrivers, allProspects, team.id, newSeason, transitionNews);
      const postAiDrivers = aiResult.drivers;
      const postAiProspects = aiResult.prospects;

      // Retired drivers check (over 42 and low OVR)
      const finalDrivers = postAiDrivers.map(d => {
        if (d.age >= 42 && d.ovr < 78 && d.teamId !== team.id) {
          return { ...d, teamId: null }; // they retire from the grid
        }
        return d;
      });

      // Generate news
      const releasedDrivers = finalDrivers.filter(d => d.teamId === null && processedDrivers.find(pd => pd.id === d.id)?.teamId === team.id);
      transitionNews.push(makeNews(
        `${newSeason} Season Begins`,
        `A new year dawns for ${team.name}. The team receives a base budget of $${baseBudget}M plus $${prizeMoney}M in prize money from their P${cPos} Constructors' finish. ${pick(["The factory has been running flat out over winter", "Pre-season testing kicks off next week", "New regulations have shaken up the pecking order"])}`,
        "Team", 0
      ));

      if (releasedDrivers.length > 0) {
        for (const rd of releasedDrivers) {
          transitionNews.push(makeNews(
            `${rd.name} Contract Expired`,
            `${rd.name}'s deal with ${team.name} has ended. The seat is now open. Head to Scouting to find a replacement.`,
            "Driver", 0
          ));
        }
      }

      // Young driver development news
      const myYoung = finalDrivers.filter(d => d.teamId === team.id && d.age <= 24);
      for (const yd of myYoung) {
        const prev = p.drivers.find(x => x.id === yd.id);
        if (prev && yd.ovr > prev.ovr) {
          transitionNews.push(makeNews(
            `${surname(yd.name)} Shows Growth`,
            `${yd.name}'s overall rating has improved from ${prev.ovr} to ${yd.ovr} over the winter. The ${yd.age}-year-old continues to develop rapidly.`,
            "Driver", 0
          ));
        }
      }

      if (maybe(0.5)) {
        const bonus = pick([2, 3, 4]);
        transitionNews.push(makeNews(
          `New Sponsor Deal for ${team.name}`,
          `${team.name} have secured a new partnership worth $${bonus}M ahead of the ${newSeason} campaign.`,
          "Sponsor", 0, { type: "budget", value: bonus }
        ));
      }

      // Car development news
      const oldCar = p.teamCars?.[team.id] ?? TEAMS.find(t => t.id === team.id)?.car ?? 75;
      const newCar = newTeamCars[team.id];
      const carDiff = newCar - oldCar;
      if (carDiff >= 3) {
        transitionNews.push(makeNews(
          `Major Step Forward in ${newSeason} Car`,
          `Wind tunnel data and pre-season testing confirm ${team.name}'s new challenger is a significant improvement. Car performance has jumped from ${oldCar} to ${newCar}. The engineering department is delighted with the off-season work.`,
          "Development", 0
        ));
      } else if (carDiff >= 1) {
        transitionNews.push(makeNews(
          `Incremental Gains for ${newSeason}`,
          `${team.name}'s ${newSeason} car shows modest improvement, moving from ${oldCar} to ${newCar}. The team is confident further gains will come through in-season development.`,
          "Development", 0
        ));
      } else if (carDiff <= -3) {
        transitionNews.push(makeNews(
          `Alarm Bells Over ${newSeason} Car`,
          `Pre-season data suggests ${team.name} have lost ground over the winter. Car performance has dropped from ${oldCar} to ${newCar}. The technical team are scrambling to understand the regression.`,
          "Development", 0
        ));
      } else if (carDiff <= -1) {
        transitionNews.push(makeNews(
          `${team.name} Tread Water`,
          `The ${newSeason} car appears to be a small step back, slipping from ${oldCar} to ${newCar}. Rivals may have outpaced ${team.name}'s development over the winter.`,
          "Development", 0
        ));
      }

      const effects = applyNewsEffects(transitionNews, { budget: baseBudget + prizeMoney, modifiers: [], team, drivers: finalDrivers });

      return {
        ...p,
        season: newSeason,
        raceIndex: 0,
        raceResults: [],
        driverPoints: {},
        constructorPoints: {},
        drivers: finalDrivers,
        prospects: postAiProspects,
        budget: effects.budget,
        modifiers: [],
        weekendPhase: "preview",
        qualiResults: null,
        raceResult: null,
        revealCount: 0,
        raceRevealCount: 0,
        news: [...transitionNews, ...p.news],
        unreadNews: transitionNews.length,
        tab: "news",
        teamCars: newTeamCars,
        rivalry: null, // reset rivalry for new season
        // history carries via ...p
      };
    });
  };

  const signProspect = (pr) => {
    if (myDrivers.length >= 2 || budget < pr.salary) return;
    const sn = genSigningNews(team, pr, raceIndex + 1);
    setGame(p => {
      const newDrivers = [...p.drivers, { ...pr, teamId: team.id, contractEnd: season + 2 }];
      const effects = applyNewsEffects(sn, { ...p, budget: p.budget - pr.salary });
      return { ...p, drivers: newDrivers, prospects: p.prospects.filter(x => x.id !== pr.id), budget: effects.budget - pr.salary, modifiers: effects.modifiers, news: [...sn, ...p.news] };
    });
  };

  const releaseDriver = (dr) => {
    const rn = genReleaseNews(team, dr, raceIndex + 1);
    setGame(p => {
      const effects = applyNewsEffects(rn, p);
      return { ...p, drivers: p.drivers.map(d => d.id === dr.id ? { ...d, teamId: null } : d), budget: p.budget + Math.floor(dr.salary * 0.5), news: [...rn, ...p.news], modifiers: effects.modifiers };
    });
  };

  const driverStandings = Object.entries(driverPoints).map(([id, pts]) => { const d = drivers.find(x => x.id === parseInt(id)); return d ? { driver: d, pts } : null; }).filter(Boolean).sort((a, b) => b.pts - a.pts);
  const constructorStandings = Object.entries(constructorPoints).map(([id, pts]) => ({ team: TEAMS.find(t => t.id === id), pts })).sort((a, b) => b.pts - a.pts);
  const myCP = constructorPoints[team.id] || 0;
  const cRank = constructorStandings.findIndex(s => s.team?.id === team.id) + 1;
  const myD1 = myDrivers[0], myD2 = myDrivers[1];
  const d1Rank = myD1 ? driverStandings.findIndex(s => s.driver?.id === myD1.id) + 1 : 0;
  const d2Rank = myD2 ? driverStandings.findIndex(s => s.driver?.id === myD2.id) + 1 : 0;

  const sidebarTabs = [
    { id: "race", label: "RACE WEEKEND", icon: "🏁" },
    { id: "news", label: "NEWS", icon: "📰", badge: unreadNews },
    { id: "squad", label: "SQUAD", icon: "👥" },
    { id: "scouting", label: "SCOUTING", icon: "🔍" },
    { id: "grid", label: "FULL GRID", icon: "🏎" },
    { id: "standings", label: "STANDINGS", icon: "📊" },
    { id: "calendar", label: "CALENDAR", icon: "📅" },
    { id: "history", label: "RECORDS", icon: "🏆" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Courier New', monospace", display: "flex", fontSize: 13 }}>
      <div style={{ width: 190, minHeight: "100vh", background: BG2, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: BLUE, fontWeight: 700, marginBottom: 2 }}>PIT WALL</div>
          <div style={{ fontSize: 10, color: DIM2 }}>{season} · R{Math.min(raceIndex + 1, RACES_2026.length)}/{RACES_2026.length}</div>
        </div>
        <div style={{ padding: "10px 0", flex: 1 }}>
          {sidebarTabs.map(t => (
            <button key={t.id} onClick={() => { setGame(p => ({ ...p, tab: t.id, unreadNews: t.id === "news" ? 0 : p.unreadNews })); }} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px",
              border: "none", background: tab === t.id ? "rgba(255,255,255,0.05)" : "transparent",
              color: tab === t.id ? "#fff" : DIM,
              borderLeft: tab === t.id ? `2px solid ${team.color}` : "2px solid transparent",
              cursor: "pointer", fontSize: 10, fontFamily: "inherit", letterSpacing: 2,
              textAlign: "left", fontWeight: tab === t.id ? 700 : 400, transition: "all 0.15s", position: "relative"
            }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
              {t.badge > 0 && t.id !== tab && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#fff", color: "#C41E1E", fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 8, minWidth: 14, textAlign: "center" }}>{t.badge}</span>}
            </button>
          ))}
        </div>
        {/* Active modifiers */}
        {modifiers && modifiers.length > 0 && (
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${BORDER}`, fontSize: 9 }}>
            <div style={{ color: DIM, letterSpacing: 2, marginBottom: 4 }}>ACTIVE EFFECTS</div>
            {modifiers.slice(0, 4).map((m, i) => (
              <div key={i} style={{ color: m.value > 0 ? "#4ADE80" : "#F87171", marginBottom: 2 }}>
                {m.value > 0 ? "▲" : "▼"} {m.type === "teamBoost" ? `Team ${m.value > 0 ? "+" : ""}${m.value}` : `${m.stat} ${m.value > 0 ? "+" : ""}${m.value}`} · {m.duration}R
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: 14, borderTop: `1px solid ${BORDER}`, fontSize: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><TeamBadge teamId={team.id} size={18} /><span style={{ color: TEXT, fontWeight: 700 }}>{team.name}</span></div>
          <div style={{ color: DIM }}>Budget: <span style={{ color: "#E2B53A" }}>${budget}M</span></div>
          <div style={{ color: DIM, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>Car: <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, maxWidth: 50 }}><div style={{ width: `${(((teamCars?.[team.id] || 75) - 60) / 40) * 100}%`, height: "100%", background: (teamCars?.[team.id] || 75) >= 90 ? "#22C55E" : (teamCars?.[team.id] || 75) >= 80 ? "#E2B53A" : "#F97316", borderRadius: 2 }} /></div><span style={{ color: (teamCars?.[team.id] || 75) >= 90 ? "#22C55E" : (teamCars?.[team.id] || 75) >= 80 ? "#E2B53A" : "#F97316", fontWeight: 700 }}>{teamCars?.[team.id] || 75}</span></div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${BORDER}`, background: BG2, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <TS label="WCC" value={myCP} sub={cRank ? `P${cRank}` : "—"} color={team.color} />
            <TS label={myD1?.name?.split(" ").pop() || "—"} value={myD1 ? (driverPoints[myD1.id] || 0) : "—"} sub={d1Rank ? `P${d1Rank}` : ""} />
            <TS label={myD2?.name?.split(" ").pop() || "—"} value={myD2 ? (driverPoints[myD2.id] || 0) : "—"} sub={d2Rank ? `P${d2Rank}` : ""} />
          </div>
          {rivalry && rivalry.rivalName && <div style={{ fontSize: 9, color: DIM, letterSpacing: 1, textAlign: "right" }}>
            <span style={{ color: TEXT2 }}>RIVAL: {rivalry.rivalName}</span>{" "}
            <span style={{ color: rivalry.gap >= 0 ? "#4ADE80" : "#F87171" }}>{rivalry.gap >= 0 ? "+" : ""}{rivalry.gap} pts</span>{" "}
            <span style={{ color: DIM2 }}>H2H {rivalry.h2h.you}-{rivalry.h2h.them}</span>
          </div>}
          {currentRace && <div style={{ fontSize: 10, color: DIM, letterSpacing: 1 }}>R{raceIndex + 1} · {currentRace.name}</div>}
        </div>
        <div style={{ padding: 20, flex: 1, overflow: "auto" }}>
          {tab === "race" && <RaceTab {...{ currentRace, weekendPhase, qualiResults, qualiWeather, raceResult, raceRevealCount, revealCount, startQuali, startRace, nextWeekend, startNextSeason, team, raceIndex, driverStandings, constructorStandings, season, myDrivers }} />}
          {tab === "news" && <NewsTab news={news} />}
          {tab === "squad" && <SquadTab {...{ myDrivers, team, driverPoints, releaseDriver, season }} />}
          {tab === "scouting" && <ScoutingTab {...{ prospects, budget, signProspect, myDrivers, team }} />}
          {tab === "grid" && <GridTab {...{ drivers, driverPoints, team, season, teamCars }} />}
          {tab === "standings" && <StandingsTab {...{ driverStandings, constructorStandings, team }} />}
          {tab === "calendar" && <CalendarTab {...{ raceIndex, raceResults, team, season }} />}
          {tab === "history" && <HistoryTab history={history} team={team} rivalry={rivalry} />}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   NEWS TAB
   ═══════════════════════════════════════════ */
function NewsTab({ news }) {
  if (news.length === 0) return <div style={{ color: DIM, padding: 40, textAlign: "center" }}>No news yet. Start a race weekend.</div>;
  return (
    <div>
      <Sec>NEWS FEED</Sec>
      <div style={{ maxWidth: 700 }}>
        {news.map(n => {
          const cc = CAT_COLORS[n.category] || CAT_COLORS.Team;
          return (
            <div key={n.id} style={{ padding: "14px 16px", marginBottom: 8, background: BG3, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${cc.fg}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 8, padding: "2px 7px", background: cc.bg, color: cc.fg, fontWeight: 700, letterSpacing: 1, borderRadius: 2 }}>{n.category.toUpperCase()}</span>
                <span style={{ fontSize: 9, color: DIM2 }}>Round {n.round}</span>
                {n.effect && (
                  <span style={{ fontSize: 8, padding: "1px 6px", background: n.effect.value > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)", color: n.effect.value > 0 ? "#4ADE80" : "#F87171", fontWeight: 700, letterSpacing: 1, borderRadius: 2, marginLeft: "auto" }}>
                    {n.effect.type === "budget" ? `${n.effect.value > 0 ? "+" : ""}$${n.effect.value}M` : `${n.effect.value > 0 ? "+" : ""}${n.effect.value} ${n.effect.stat || "perf"}`}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.5 }}>{n.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   RACE WEEKEND TAB
   ═══════════════════════════════════════════ */
function RaceTab({ currentRace, weekendPhase, qualiResults, qualiWeather, raceResult, raceRevealCount, revealCount, startQuali, startRace, nextWeekend, startNextSeason, team, raceIndex, driverStandings, constructorStandings, season, myDrivers }) {
  if (raceIndex >= RACES_2026.length) {
    const cPos = constructorStandings.findIndex(s => s.team?.id === team.id) + 1;
    const myDStandings = myDrivers.map(d => {
      const pos = driverStandings.findIndex(s => s.driver?.id === d.id) + 1;
      const pts = driverStandings.find(s => s.driver?.id === d.id)?.pts || 0;
      return { ...d, pos, pts };
    });
    const expiringContracts = myDrivers.filter(d => d.contractEnd && d.contractEnd <= season);
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: BLUE, marginBottom: 8 }}>CHEQUERED FLAG</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif", marginBottom: 4 }}>{season} SEASON COMPLETE</div>
          <div style={{ fontSize: 11, color: DIM }}>{team.name} — Final Report</div>
        </div>
        {/* Constructor result */}
        <div style={{ background: BG3, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 6 }}>CONSTRUCTORS' CHAMPIONSHIP</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: cPos <= 3 ? "#E2B53A" : TEXT, fontFamily: "'Arial Black', sans-serif" }}>P{cPos || "—"}</span>
            <span style={{ fontSize: 12, color: DIM }}>{constructorStandings.find(s => s.team?.id === team.id)?.pts || 0} points</span>
          </div>
        </div>
        {/* Driver results */}
        <div style={{ background: BG3, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 8 }}>YOUR DRIVERS</div>
          {myDStandings.map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ color: "#fff", fontWeight: 700 }}>{d.name}</span>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: "#E2B53A", fontWeight: 700 }}>{d.pts} pts</span>
                <span style={{ color: d.pos <= 3 ? "#E2B53A" : DIM, fontWeight: 700 }}>P{d.pos || "—"}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Contract warnings */}
        {expiringContracts.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", padding: "12px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: "#F87171", letterSpacing: 2, marginBottom: 6 }}>CONTRACT EXPIRIES</div>
            {expiringContracts.map(d => (
              <div key={d.id} style={{ fontSize: 11, color: "#F87171" }}>
                {d.name}'s contract expires — they will leave unless re-signed
              </div>
            ))}
          </div>
        )}
        {/* Season transition info */}
        <div style={{ background: BG3, border: `1px solid ${BORDER}`, padding: "12px 16px", marginBottom: 20, fontSize: 11, color: TEXT2, lineHeight: 1.6 }}>
          <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 6 }}>WHAT HAPPENS NEXT</div>
          Advancing to {season + 1}: drivers age by one year, young drivers may improve, veterans may decline. Expired contracts will be released. You'll receive a base budget of $50M plus prize money based on your finish. New prospects will enter the scouting pool.
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={startNextSeason} style={{
            padding: "14px 48px", background: BLUE, color: "#fff",
            border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800,
            letterSpacing: 3, fontFamily: "inherit"
          }}>START {season + 1} SEASON →</button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "preview", label: "PREVIEW", done: weekendPhase !== "preview" },
    { id: "quali", label: "QUALIFYING", done: ["race_reveal", "race_done"].includes(weekendPhase) || (weekendPhase === "quali_reveal" && revealCount >= (qualiResults?.length || 0)) },
    { id: "race", label: "RACE", done: weekendPhase === "race_done" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, padding: "20px 24px", background: BG3, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 10, color: BLUE, letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>ROUND {raceIndex + 1}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif", marginBottom: 4 }}>{currentRace.name}</div>
            <div style={{ fontSize: 11, color: DIM }}>{currentRace.circuit} · {currentRace.laps} laps</div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "rgba(255,255,255,0.04)", fontFamily: "'Arial Black', sans-serif", lineHeight: 1 }}>{currentRace.country}</div>
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: 20 }}>
          {steps.map(s => {
            const active = (weekendPhase === "preview" && s.id === "preview") || (weekendPhase === "quali_reveal" && s.id === "quali") || ((weekendPhase === "race_reveal" || weekendPhase === "race_done") && s.id === "race");
            return (<div key={s.id} style={{ flex: 1 }}><div style={{ height: 3, background: s.done ? team.color : active ? `${team.color}88` : "rgba(0,0,0,0.15)", transition: "all 0.5s" }} /><div style={{ fontSize: 9, letterSpacing: 2, marginTop: 6, color: active ? "#fff" : s.done ? team.color : DIM3 }}>{s.label}</div></div>);
          })}
        </div>
      </div>

      {weekendPhase === "preview" && (<div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 11, color: DIM, letterSpacing: 2, marginBottom: 20 }}>LIGHTS OUT AWAITS</div><button onClick={startQuali} style={{ padding: "14px 48px", background: team.color, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, letterSpacing: 3, fontFamily: "inherit" }}>BEGIN QUALIFYING →</button></div>)}

      {weekendPhase === "quali_reveal" && qualiResults && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><Sec>QUALIFYING</Sec><span style={{ fontSize: 20, marginTop: -14 }}>{qualiWeather?.icon}</span><span style={{ fontSize: 9, color: qualiWeather?.id === "wet" || qualiWeather?.id === "storm" ? "#60A5FA" : TEXT2, letterSpacing: 2, marginTop: -14 }}>{qualiWeather?.label}</span></div>
          <table style={{ width: "100%", maxWidth: 700, borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["POS", "DRIVER", "TEAM", "TIME", "GAP"].map(h => (<th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2, fontWeight: 600 }}>{h}</th>))}</tr></thead>
            <tbody>{qualiResults.map((d, i) => {
              const vis = i < revealCount; const dt = TEAMS.find(t => t.id === d.teamId); const mine = d.teamId === team.id;
              const gap = i === 0 ? "" : d.crashed ? "" : `+${(d.lapTime - qualiResults[0]?.lapTime).toFixed(3)}`;
              return (<tr key={d.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent", opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-20px)", transition: "all 0.3s ease-out" }}>
                <td style={{ padding: "8px", fontWeight: 700, color: i === 0 ? "#fff" : i < 3 ? TEXT : DIM, width: 36 }}>{i + 1}</td>
                <td style={{ padding: "8px", fontWeight: mine ? 800 : 400, color: mine ? "#fff" : TEXT }}>{d.name}</td>
                <td style={{ padding: "8px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><TeamBadge teamId={d.teamId} size={14} /><span style={{ color: DIM, fontSize: 11 }}>{dt?.name}</span></span></td>
                <td style={{ padding: "8px", fontFamily: "'Courier New', monospace", color: d.crashed ? "#EF4444" : i === 0 ? BLUE : TEXT2 }}>{d.crashed ? "NO TIME" : formatTime(d.lapTime)}</td>
                <td style={{ padding: "8px", color: DIM, fontSize: 11 }}>{gap}</td>
              </tr>);
            })}</tbody>
          </table>
          {revealCount >= qualiResults.length && (<div style={{ textAlign: "center", marginTop: 28 }}>
            <div style={{ fontSize: 10, color: BLUE, letterSpacing: 2, marginBottom: 4 }}>POLE: {qualiResults[0]?.name} — {qualiResults[0]?.lapTime ? formatTime(qualiResults[0].lapTime) : "—"}</div>
            <button onClick={startRace} style={{ marginTop: 12, padding: "14px 48px", background: team.color, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, letterSpacing: 3, fontFamily: "inherit" }}>LIGHTS OUT →</button>
          </div>)}
        </div>
      )}

      {(weekendPhase === "race_reveal" || weekendPhase === "race_done") && raceResult && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Sec>{weekendPhase === "race_done" ? "CLASSIFICATION" : "RACE IN PROGRESS"}</Sec>
            <span style={{ fontSize: 20, marginTop: -14 }}>{raceResult.weather?.icon}</span>
            <span style={{ fontSize: 9, color: raceResult.wet ? "#60A5FA" : TEXT2, letterSpacing: 2, marginTop: -14 }}>{raceResult.weather?.label}</span>
            {weekendPhase === "race_reveal" && <span style={{ marginTop: -14, fontSize: 9, color: "#EF4444", letterSpacing: 2 }}><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style><span style={{ animation: "pulse 1s infinite" }}>● LIVE</span></span>}
          </div>
          <table style={{ width: "100%", maxWidth: 750, borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["POS", "DRIVER", "TEAM", "GRID", "+/-", "PTS"].map(h => (<th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2, fontWeight: 600 }}>{h}</th>))}</tr></thead>
            <tbody>{raceResult.results.map((d, i) => {
              const rc = weekendPhase === "race_done" ? raceResult.results.length : raceRevealCount;
              const vis = i < rc; const dt = TEAMS.find(t => t.id === d.teamId); const mine = d.teamId === team.id;
              const pc = d.dnf ? null : d.gridPos - (i + 1);
              return (<tr key={d.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent", opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-20px)", transition: "all 0.3s ease-out" }}>
                <td style={{ padding: "8px", fontWeight: 700, color: d.dnf ? "#EF4444" : i < 3 ? "#fff" : DIM, width: 36 }}>{d.dnf ? "DNF" : i + 1}</td>
                <td style={{ padding: "8px", fontWeight: mine ? 800 : 400, color: mine ? "#fff" : TEXT }}>{d.name}</td>
                <td style={{ padding: "8px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><TeamBadge teamId={d.teamId} size={14} /><span style={{ color: DIM, fontSize: 11 }}>{dt?.name}</span></span></td>
                <td style={{ padding: "8px", color: DIM, fontSize: 11 }}>P{d.gridPos}</td>
                <td style={{ padding: "8px", fontSize: 11, fontWeight: 700, color: d.dnf ? DIM3 : pc > 0 ? "#22C55E" : pc < 0 ? "#EF4444" : DIM }}>{d.dnf ? "—" : pc > 0 ? `▲${pc}` : pc < 0 ? `▼${Math.abs(pc)}` : "—"}</td>
                <td style={{ padding: "8px", color: !d.dnf && i < 10 ? "#E2B53A" : DIM3, fontWeight: 700 }}>{d.dnf ? "—" : (POINTS[i] || 0)}</td>
              </tr>);
            })}</tbody>
          </table>
          {weekendPhase === "race_done" && (<div style={{ textAlign: "center", marginTop: 28 }}>
            <div style={{ fontSize: 11, color: "#E2B53A", letterSpacing: 3, fontWeight: 700 }}>🏆 {raceResult.results[0]?.name}</div>
            {raceIndex + 1 < RACES_2026.length ? <button onClick={nextWeekend} style={{ marginTop: 12, padding: "14px 48px", background: "rgba(0,0,0,0.15)", color: "#fff", border: `1px solid ${BORDER2}`, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 2, fontFamily: "inherit" }}>NEXT RACE →</button>
              : <button onClick={nextWeekend} style={{ marginTop: 12, padding: "14px 48px", background: "#E2B53A", color: "#000", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, letterSpacing: 2, fontFamily: "inherit" }}>FINAL STANDINGS</button>}
          </div>)}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   REMAINING TABS
   ═══════════════════════════════════════════ */
function SquadTab({ myDrivers, team, driverPoints, releaseDriver, season }) {
  if (myDrivers.length === 0) return <div style={{ color: DIM, padding: 40, textAlign: "center" }}>No drivers. Visit Scouting.</div>;
  return (<div><Sec>YOUR DRIVERS</Sec>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 780 }}>
      {myDrivers.map((d, i) => (
        <div key={d.id} style={{ background: BG3, border: `1px solid ${BORDER}`, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div><div style={{ fontSize: 9, color: BLUE, letterSpacing: 2, marginBottom: 3 }}>DRIVER {i + 1}</div><div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif" }}>{d.name}</div><div style={{ fontSize: 10, color: DIM, marginTop: 2 }}>Age {d.age} · OVR <span style={{ color: "#E2B53A" }}>{d.ovr}</span></div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 24, fontWeight: 900, color: team.color, fontFamily: "'Arial Black', sans-serif" }}>{driverPoints[d.id] || 0}</div><div style={{ fontSize: 9, color: DIM }}>PTS</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[["PACE", d.pace], ["CONSISTENCY", d.consistency], ["WET", d.wet]].map(([l, v]) => (<div key={l}><div style={{ fontSize: 8, color: DIM, letterSpacing: 1, marginBottom: 3 }}>{l}</div>{dots(v)}</div>))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 10 }}>
            <div><span style={{ color: DIM }}>Contract: </span><span style={{ background: d.contractEnd <= season ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)", color: d.contractEnd <= season ? "#EF4444" : "#22C55E", padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>{d.contractEnd}</span></div>
            <div><span style={{ color: DIM }}>Salary: </span><span style={{ color: "#E2B53A" }}>${d.salary}M</span></div>
          </div>
          <button onClick={() => releaseDriver(d)} style={{ width: "100%", padding: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", cursor: "pointer", fontSize: 9, fontFamily: "inherit", letterSpacing: 2 }}>RELEASE (${Math.floor(d.salary * 0.5)}M)</button>
        </div>
      ))}
    </div>
    {myDrivers.length < 2 && <div style={{ marginTop: 16, padding: 14, background: "rgba(226,181,58,0.08)", border: "1px solid rgba(226,181,58,0.3)", color: "#E2B53A", fontSize: 11 }}>Need 2 drivers. Visit Scouting.</div>}
  </div>);
}

function ScoutingTab({ prospects, budget, signProspect, myDrivers, team }) {
  const canSign = myDrivers.length < 2;
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? prospects : prospects.filter(p => p.series === filter);
  const sorted = [...filtered].sort((a, b) => b.ovr - a.ovr);
  return (<div><Sec>PROSPECT SCOUTING</Sec>
    {!canSign && <div style={{ marginBottom: 16, padding: 12, background: BG3, border: `1px solid ${BORDER}`, color: TEXT2, fontSize: 11 }}>Squad full. Release a driver first.</div>}
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {["all", "F2", "F3", "IndyCar", "Free Agent"].map(f => (<button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", background: filter === f ? "rgba(0,0,0,0.15)" : "transparent", border: `1px solid ${filter === f ? BORDER2 : BORDER}`, color: filter === f ? "#fff" : DIM, cursor: "pointer", fontSize: 10, fontFamily: "inherit", letterSpacing: 1, fontWeight: filter === f ? 700 : 400 }}>{f === "all" ? "ALL" : f.toUpperCase()}</button>))}
    </div>
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", maxWidth: 850, borderCollapse: "collapse" }}>
      <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["DRIVER", "SERIES", "AGE", "OVR", "POTENTIAL", "PACE", "CON", "WET", "COST", ""].map(h => (<th key={h} style={{ textAlign: "left", padding: "7px 8px", fontSize: 8, color: DIM, letterSpacing: 2, fontWeight: 600 }}>{h}</th>))}</tr></thead>
      <tbody>{sorted.map(p => {
        const seriesCol = p.series === "F2" ? { bg: "rgba(59,130,246,0.3)", fg: "#60A5FA" } : p.series === "IndyCar" ? { bg: "rgba(239,68,68,0.3)", fg: "#F87171" } : p.series === "Free Agent" ? { bg: "rgba(255,255,255,0.15)", fg: "#fff" } : { bg: "rgba(34,197,94,0.3)", fg: "#4ADE80" };
        return (<tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
        <td style={{ padding: "9px 8px", color: "#fff", fontWeight: 700 }}>{p.name}</td>
        <td style={{ padding: "9px 8px" }}><span style={{ fontSize: 9, padding: "1px 6px", fontWeight: 700, letterSpacing: 1, background: seriesCol.bg, color: seriesCol.fg }}>{p.series}</span></td>
        <td style={{ padding: "9px 8px", color: TEXT2 }}>{p.age}</td>
        <td style={{ padding: "9px 8px", color: "#E2B53A", fontWeight: 700 }}>{p.ovr}</td>
        <td style={{ padding: "9px 8px" }}>{potBar(p.pot)}</td>
        <td style={{ padding: "9px 8px" }}>{dots(p.pace)}</td>
        <td style={{ padding: "9px 8px" }}>{dots(p.consistency)}</td>
        <td style={{ padding: "9px 8px" }}>{dots(p.wet)}</td>
        <td style={{ padding: "9px 8px", color: "#E2B53A" }}>${p.salary}M</td>
        <td style={{ padding: "9px 8px" }}>
          {canSign ? (<button onClick={() => signProspect(p)} disabled={budget < p.salary} style={{ padding: "3px 10px", background: budget >= p.salary ? team.color : DIM3, color: "#fff", border: "none", cursor: budget >= p.salary ? "pointer" : "not-allowed", fontSize: 9, fontFamily: "inherit", letterSpacing: 1, fontWeight: 700, opacity: budget >= p.salary ? 1 : 0.4 }}>SIGN</button>) : <span style={{ fontSize: 9, color: DIM3 }}>FULL</span>}
        </td>
      </tr>)})}</tbody>
    </table></div>
  </div>);
}

function GridTab({ drivers, driverPoints, team, season, teamCars }) {
  return (<div><Sec>{season} F1 GRID</Sec>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 850 }}>
      {TEAMS.map(t => {
        const td = drivers.filter(d => d.teamId === t.id); const mine = t.id === team.id;
        const carVal = teamCars?.[t.id] ?? t.car;
        const carCol = carVal >= 90 ? "#22C55E" : carVal >= 80 ? "#E2B53A" : carVal >= 75 ? "#F97316" : "#F87171";
        return (<div key={t.id} style={{ background: mine ? `${t.color}25` : BG3, border: `1px solid ${mine ? t.color + "33" : BORDER}`, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><TeamBadge teamId={t.id} size={20} /><span style={{ color: mine ? "#fff" : TEXT2, fontWeight: 700, fontSize: 11 }}>{t.name}</span><span style={{ fontSize: 9, color: DIM3, marginLeft: "auto" }}>{t.engine}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 8, color: DIM, letterSpacing: 1 }}>CAR</span>
            <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, maxWidth: 80 }}><div style={{ width: `${((carVal - 60) / 40) * 100}%`, height: "100%", background: carCol, borderRadius: 2 }} /></div>
            <span style={{ fontSize: 10, color: carCol, fontWeight: 700 }}>{carVal}</span>
          </div>
          {td.map(d => (<div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span style={{ color: mine ? "#fff" : TEXT2 }}>{d.name}</span><div style={{ display: "flex", gap: 12 }}><span style={{ fontSize: 10, color: DIM }}>OVR {d.ovr}</span><span style={{ fontSize: 10, color: "#E2B53A", fontWeight: 700 }}>{driverPoints[d.id] || 0} pts</span></div></div>))}
        </div>);
      })}
    </div>
  </div>);
}

function StandingsTab({ driverStandings, constructorStandings, team }) {
  if (driverStandings.length === 0) return <div style={{ color: DIM, padding: 40, textAlign: "center" }}>Complete a race first.</div>;
  return (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 880 }}>
    <div><Sec>DRIVERS'</Sec><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
      {driverStandings.map((s, i) => { const dt = TEAMS.find(t => t.id === s.driver?.teamId); const mine = s.driver?.teamId === team.id; return (<tr key={s.driver?.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent" }}><td style={{ padding: "6px 8px", color: i < 3 ? BLUE : DIM, fontWeight: 700, width: 28 }}>{i + 1}</td><td style={{ padding: "6px 8px" }}><span style={{ color: mine ? "#fff" : TEXT, fontWeight: mine ? 800 : 400 }}>{s.driver?.name}</span> <TeamBadge teamId={s.driver?.teamId} size={12} /></td><td style={{ padding: "6px 8px", textAlign: "right", color: "#E2B53A", fontWeight: 700 }}>{s.pts}</td></tr>); })}
    </tbody></table></div>
    <div><Sec>CONSTRUCTORS'</Sec><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
      {constructorStandings.map((s, i) => { const mine = s.team?.id === team.id; return (<tr key={s.team?.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent" }}><td style={{ padding: "6px 8px", color: i < 3 ? BLUE : DIM, fontWeight: 700, width: 28 }}>{i + 1}</td><td style={{ padding: "6px 8px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><TeamBadge teamId={s.team?.id} size={16} /><span style={{ color: mine ? "#fff" : TEXT, fontWeight: mine ? 800 : 400 }}>{s.team?.name}</span></span></td><td style={{ padding: "6px 8px", textAlign: "right", color: "#E2B53A", fontWeight: 700 }}>{s.pts}</td></tr>); })}
    </tbody></table></div>
  </div>);
}


function HistoryTab({ history, team, rivalry }) {
  const h = history || {};
  return (
    <div>
      <Sec>ALL-TIME RECORDS</Sec>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 700, marginBottom: 24 }}>
        {[
          { label: "WCC TITLES", value: h.titles?.wcc || 0, color: GOLD },
          { label: "WDC TITLES", value: h.titles?.wdc || 0, color: GOLD },
          { label: "TOTAL POINTS", value: h.totalPoints || 0, color: "#fff" },
          { label: "RACE WINS", value: h.totalWins || 0, color: "#4ADE80" },
          { label: "PODIUMS", value: h.totalPodiums || 0, color: BLUE },
          { label: "POLES", value: h.totalPoles || 0, color: "#C084FC" },
          { label: "RACES", value: h.totalRaces || 0, color: TEXT2 },
        ].map((s, i) => (
          <div key={i} style={{ background: BG3, border: "1px solid " + BORDER, padding: "14px 16px" }}>
            <div style={{ fontSize: 8, color: DIM, letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "'Arial Black', sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {rivalry && rivalry.rivalName && (
        <div style={{ marginBottom: 24 }}>
          <Sec>CURRENT RIVALRY</Sec>
          <div style={{ background: BG3, border: "1px solid " + BORDER, padding: "16px 20px", maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 4 }}>YOUR RIVAL</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif" }}>{rivalry.rivalName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 4 }}>POINTS GAP</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: rivalry.gap >= 0 ? "#4ADE80" : "#F87171", fontFamily: "'Arial Black', sans-serif" }}>{rivalry.gap >= 0 ? "+" : ""}{rivalry.gap}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 2 }}>HEAD TO HEAD</div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{rivalry.h2h.you} — {rivalry.h2h.them}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 2 }}>STREAK</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: rivalry.streak > 0 ? "#4ADE80" : rivalry.streak < 0 ? "#F87171" : DIM }}>
                  {rivalry.streak > 0 ? "W" + rivalry.streak : rivalry.streak < 0 ? "L" + Math.abs(rivalry.streak) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {h.seasons && h.seasons.length > 0 && (
        <div>
          <Sec>SEASON HISTORY</Sec>
          <table style={{ width: "100%", maxWidth: 700, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid " + BORDER2 }}>
                {["YEAR", "WCC", "PTS", "DRIVERS", "WINS", "PODIUMS"].map(col => (
                  <th key={col} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2, fontWeight: 600 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...h.seasons].reverse().map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid " + BORDER }}>
                  <td style={{ padding: "8px", color: "#fff", fontWeight: 700 }}>{s.year}</td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ color: s.wccPos <= 3 ? GOLD : TEXT2, fontWeight: 700 }}>P{s.wccPos}</span>
                  </td>
                  <td style={{ padding: "8px", color: GOLD, fontWeight: 700 }}>{s.wccPts}</td>
                  <td style={{ padding: "8px", fontSize: 11 }}>
                    {s.drivers.map((d, j) => (
                      <span key={j} style={{ color: d.pos <= 3 ? GOLD : TEXT2 }}>
                        {d.name.split(" ").pop()} P{d.pos}{j < s.drivers.length - 1 ? " · " : ""}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: "8px", color: "#4ADE80", fontWeight: 700 }}>{s.wins || 0}</td>
                  <td style={{ padding: "8px", color: BLUE, fontWeight: 700 }}>{s.podiums || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(!h.seasons || h.seasons.length === 0) && h.totalRaces === 0 && (
        <div style={{ color: DIM, padding: 40, textAlign: "center" }}>Complete your first race to start tracking records.</div>
      )}
    </div>
  );
}

function CalendarTab({ raceIndex, raceResults, team, season }) {
  return (<div><Sec>{season} CALENDAR</Sec>
    <div style={{ maxWidth: 550 }}>
      {RACES_2026.map((race, i) => {
        const done = i < raceIndex, current = i === raceIndex, result = raceResults[i];
        const myF = result?.results.map((d, pos) => ({ ...d, pos })).filter(d => d.teamId === team.id);
        return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderLeft: current ? `2px solid ${team.color}` : "2px solid transparent", background: current ? BG3 : "transparent", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ width: 22, fontSize: 9, color: done ? DIM : current ? BLUE : DIM3, fontWeight: 700 }}>R{i + 1}</span>
          <div style={{ flex: 1 }}><div style={{ color: done ? TEXT2 : current ? "#fff" : DIM3, fontWeight: current ? 700 : 400 }}>{race.name}</div><div style={{ fontSize: 9, color: DIM3 }}>{race.circuit}</div></div>
          {done && result && <span style={{ fontSize: 16, marginRight: 4 }}>{result.weather?.icon || "☀️"}</span>}
          {done && myF && <span style={{ fontSize: 10, color: TEXT2 }}>{myF.map(mf => `${mf.name.split(" ").pop()}: ${mf.dnf ? "DNF" : "P" + (mf.pos + 1)}`).join(" · ")}</span>}
          {current && <span style={{ fontSize: 9, color: team.color, letterSpacing: 2, fontWeight: 700 }}>NEXT</span>}
        </div>);
      })}
    </div>
  </div>);
}
