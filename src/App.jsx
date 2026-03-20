import { useState, useEffect, useRef } from "react";
import TeamBadge from "./components/TeamBadge";
import { TEAMS, TEAM_IDENTITIES, F1_DRIVERS, RACES_2026, POINTS } from "./data/gameData";
import { BG, BG2, BG3, BORDER, BORDER2, DIM, DIM2, DIM3, TEXT, TEXT2, GOLD, BLUE, BLUE2, CAT_COLORS } from "./styles/theme";
import {
  pick,
  maybe,
  genPreRace,
  genPostRace,
  genSigningNews,
  genReleaseNews,
  genSeasonEnd,
  applyNewsEffects,
  tickModifiers,
  pickWeather,
  generateQuali,
  generateRace,
  aiTransfers,
  genMidSeasonReg,
  updateRivalry,
  updateRivalryPostRace,
  updateHistory,
  finaliseSeasonHistory,
  initGame,
  formatTime,
  makeNews,
} from "./simulation/gameLogic";

function dots(n, max = 5) { return Array.from({ length: max }, (_, i) => (<span key={i} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: i < n ? BLUE : "rgba(0,0,0,0.2)", marginRight: 2 }} />)); }
function potBar(pot) { const pct = ((pot - 60) / 40) * 100; const col = pot >= 85 ? "#22C55E" : pot >= 80 ? "#E2B53A" : pot >= 75 ? "#F97316" : "#aaa"; return (<div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 50, height: 4, background: "rgba(0,0,0,0.2)", borderRadius: 2 }}><div style={{ width: `${Math.max(pct, 5)}%`, height: "100%", background: col, borderRadius: 2 }} /></div><span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{pot}</span></div>); }
function Sec({ children }) { return <div style={{ fontSize: 10, letterSpacing: 3, color: "#fff", fontWeight: 700, marginBottom: 14, paddingBottom: 6, borderBottom: `1px solid ${BLUE}33` }}>{children}</div>; }
function TS({ label, value, sub, color }) { return (<div><div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 1 }}>{label}</div><div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 20, fontWeight: 900, color: color || "#fff", fontFamily: "'Arial Black', sans-serif" }}>{value}</span>{sub && <span style={{ fontSize: 9, color: DIM }}>{sub}</span>}</div></div>); }
function DashCard({ title, children, accent }) {
  return <div style={{ background: BG3, border: `1px solid ${accent ? accent + "55" : BORDER}`, padding: "12px 14px", minHeight: 88 }}><div style={{ fontSize: 8, color: accent || DIM, letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.5 }}>{children}</div></div>;
}
function DriverLink({ driver, onOpen, color = TEXT, weight = 700 }) {
  if (!driver) return <span style={{ color }}>—</span>;
  return (
    <button onClick={() => onOpen?.(driver.id)} style={{ background: "transparent", border: "none", color, fontWeight: weight, cursor: "pointer", padding: 0, fontFamily: "inherit", textDecoration: "underline dotted", textUnderlineOffset: 2 }}>
      {driver.name}
    </button>
  );
}
function DriverHistoryModal({ driver, season, driverPoints, driverSeasonStats, driverCareer, onClose }) {
  if (!driver) return null;
  const currentTeam = TEAMS.find(t => t.id === driver.teamId);
  const currentSeason = driverSeasonStats?.[driver.id] || blankSeasonStats();
  const historical = [...(driverCareer?.[driver.id]?.seasons || [])].reverse();
  const rows = historical.length > 0
    ? historical
    : [{ season, points: driverPoints?.[driver.id] || currentSeason.points, wins: currentSeason.wins, podiums: currentSeason.podiums, poles: currentSeason.poles, position: null, teamName: currentTeam?.name || "Free Agent", ovr: driver.ovr }];
  const yearsRemaining = driver.contractEnd ? Math.max(0, driver.contractEnd - season) : 0;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ width: "min(940px, 96vw)", maxHeight: "90vh", overflow: "auto", background: BG2, border: `1px solid ${BORDER2}`, padding: 18 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 24, color: "#fff", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{driver.name}</div>
            <div style={{ fontSize: 11, color: DIM }}>Team: {currentTeam?.name || "Free Agent"} · Age {driver.age} · OVR {driver.ovr} · POT {driver.pot || "—"} · Contract years left {yearsRemaining}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: TEXT2, cursor: "pointer", padding: "4px 10px", fontFamily: "inherit" }}>Close</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["SEASON", "TEAM", "OVR", "PTS", "W", "POD", "POLE", "FIN POS"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 8px", fontSize: 8, letterSpacing: 2, color: DIM }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: "8px", color: "#fff", fontWeight: 700 }}>{row.season}</td>
                <td style={{ padding: "8px", color: TEXT2 }}>{row.teamName || "Free Agent"}</td>
                <td style={{ padding: "8px", color: "#E2B53A" }}>{row.ovr ?? "—"}</td>
                <td style={{ padding: "8px", color: "#E2B53A", fontWeight: 700 }}>{row.points ?? 0}</td>
                <td style={{ padding: "8px", color: "#4ADE80" }}>{row.wins ?? 0}</td>
                <td style={{ padding: "8px", color: BLUE }}>{row.podiums ?? 0}</td>
                <td style={{ padding: "8px", color: "#C084FC" }}>{row.poles ?? 0}</td>
                <td style={{ padding: "8px", color: TEXT2 }}>{row.position ? `P${row.position}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const blankSeasonStats = () => ({ points: 0, wins: 0, podiums: 0, poles: 0, races: 0, finishes: 0, sumFinish: 0, dnfs: 0 });
const avgFinish = (st) => (st.finishes > 0 ? (st.sumFinish / st.finishes).toFixed(2) : "—");
const CAR_OVERALL_FLOOR = 70;
const CAR_ATTR_FLOOR = 68;

function buildConstructorStandings(constructorPoints) {
  return TEAMS
    .map(t => ({ team: t, pts: constructorPoints?.[t.id] || 0 }))
    .sort((a, b) => b.pts - a.pts || ((b.team?.car || 0) - (a.team?.car || 0)) || (a.team?.name || "").localeCompare(b.team?.name || ""));
}

function generateUniqueName(usedNames, firstPool, lastPool) {
  for (let i = 0; i < 40; i++) {
    const full = `${pick(firstPool)} ${pick(lastPool)}`;
    const key = full.toLowerCase();
    if (!usedNames.has(key)) {
      usedNames.add(key);
      return full;
    }
  }
  const base = `${pick(firstPool)} ${pick(lastPool)}`;
  let n = 2;
  let candidate = `${base} ${n}`;
  while (usedNames.has(candidate.toLowerCase())) {
    n += 1;
    candidate = `${base} ${n}`;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}
function ensureProfileData(state) {
  const driverSeason = { ...(state.driverSeasonStats || {}) };
  const driverCareer = { ...(state.driverCareer || {}) };
  const teamSeason = { ...(state.teamSeasonStats || {}) };
  const teamHistory = { ...(state.teamHistory || {}) };

  state.drivers.forEach(d => {
    if (!driverSeason[d.id]) driverSeason[d.id] = blankSeasonStats();
    if (!driverCareer[d.id]) driverCareer[d.id] = { total: blankSeasonStats(), seasons: [] };
  });
  TEAMS.forEach(t => {
    if (!teamSeason[t.id]) teamSeason[t.id] = blankSeasonStats();
    if (!teamHistory[t.id]) teamHistory[t.id] = { seasons: [] };
  });
  return { driverSeason, driverCareer, teamSeason, teamHistory };
}

function ratedProspectToDriver(pr, teamId, newSeason) {
  const years = pr.ovr >= 80 ? 2 : 1;
  return { ...pr, teamId, contractEnd: newSeason + years };
}

function ensureValidTeamRosters(drivers, prospects, newSeason, transitionNews = []) {
  const fixedDrivers = drivers.map(d => ({ ...d }));
  let availableProspects = [...prospects];
  const emergencyFirst = ["Ari", "Noel", "Rafa", "Mika", "Theo", "Luca", "Sami", "Nico"];
  const emergencyLast = ["Ward", "Costa", "Bauer", "Khan", "Silva", "Meyer", "Sato", "Marin"];
  let emergencyCounter = 0;
  let emergencyGenerated = 0;
  const usedNames = new Set([...fixedDrivers, ...availableProspects].map(d => d.name?.toLowerCase()).filter(Boolean));

  const driverScore = (d) => (d.ovr * 2) + ((d.pot || d.ovr) * 0.8) + (d.pace * 2) + d.consistency + ((36 - d.age) * 0.12);
  const prospectScore = (d) => (d.ovr * 1.9) + ((d.pot || d.ovr) * 0.9) + (d.pace * 1.8) + d.consistency;

  const bestFreeAgent = () => fixedDrivers.filter(d => d.teamId === null).sort((a, b) => driverScore(b) - driverScore(a))[0];
  const bestProspect = () => availableProspects.sort((a, b) => prospectScore(b) - prospectScore(a))[0];
  const makeEmergencyDriver = () => {
    emergencyCounter += 1;
    return {
      id: 100000 + (newSeason * 100) + emergencyCounter,
      name: generateUniqueName(usedNames, emergencyFirst, emergencyLast),
      age: pick([20, 21, 22, 23, 24]),
      ovr: pick([68, 69, 70, 71, 72, 73]),
      pace: pick([3, 4]),
      consistency: pick([2, 3, 4]),
      wet: pick([2, 3, 3, 4]),
      salary: 2,
      pot: pick([76, 78, 80, 82]),
      teamId: null,
      contractEnd: null,
    };
  };

  const overflow = [];
  TEAMS.forEach(t => {
    const active = fixedDrivers.filter(d => d.teamId === t.id).sort((a, b) => driverScore(b) - driverScore(a));
    if (active.length > 2) {
      active.slice(2).forEach(d => overflow.push({ team: t, driver: d }));
    }
  });
  overflow.forEach(({ team, driver }) => {
    const idx = fixedDrivers.findIndex(d => d.id === driver.id);
    if (idx >= 0) {
      fixedDrivers[idx] = { ...fixedDrivers[idx], teamId: null, contractEnd: null };
      transitionNews.push(makeNews(
        `${team.name} Release ${driver.name}`,
        `Roster rule enforcement trimmed ${team.name} back to two active race seats.`,
        "Driver", 0
      ));
    }
  });

  TEAMS.forEach(t => {
    let active = fixedDrivers.filter(d => d.teamId === t.id);
    while (active.length < 2) {
      const fa = bestFreeAgent();
      if (fa) {
        const idx = fixedDrivers.findIndex(d => d.id === fa.id);
        if (idx >= 0) {
          fixedDrivers[idx] = { ...fixedDrivers[idx], teamId: t.id, contractEnd: newSeason + (fa.ovr >= 84 ? 2 : 1) };
          transitionNews.push(makeNews(
            `${t.name} Finalize ${fa.name}`,
            `${t.name} fill an open seat via free agency to satisfy the 2-driver roster requirement.`,
            "Driver", 0
          ));
        }
      } else {
        const pr = bestProspect();
        if (pr) {
          const signed = { ...ratedProspectToDriver(pr, t.id, newSeason), lowOvrSeasons: 0 };
          fixedDrivers.push(signed);
          availableProspects = availableProspects.filter(x => x.id !== pr.id);
          transitionNews.push(makeNews(
            `${t.name} Promote ${pr.name}`,
            `${t.name} promote ${pr.name} to keep a valid two-driver race lineup.`,
            "Driver", 0
          ));
        } else {
          const emergency = makeEmergencyDriver();
          emergencyGenerated += 1;
          fixedDrivers.push({ ...emergency, teamId: t.id, contractEnd: newSeason + 1 });
          transitionNews.push(makeNews(
            `${t.name} Sign Emergency Reserve`,
            `${t.name} sign ${emergency.name} as an emergency replacement to keep the grid full.`,
            "Driver", 0
          ));
        }
      }
      active = fixedDrivers.filter(d => d.teamId === t.id);
    }
  });

  const invalidTeams = TEAMS.filter(t => fixedDrivers.filter(d => d.teamId === t.id).length !== 2).length;
  if (invalidTeams > 0) throw new Error(`Invalid roster state detected for ${invalidTeams} team(s).`);

  return { drivers: fixedDrivers, prospects: availableProspects, emergencyGenerated, invalidTeams };
}

function retirementChanceForDriver(driver, perfPts, hasSeat) {
  if (driver.age < 34) {
    if (!hasSeat && driver.ovr < 75) {
      if (driver.age <= 29) return 0.01;
      if (driver.age <= 31) return 0.025;
      return 0.04;
    }
    return 0;
  }
  if (driver.age >= 47) return 0.995;

  const ovrDelta = driver._ovrDelta || 0;
  const eliteLongevity = driver.ovr >= 90 && perfPts >= 90;
  let chance = 0;

  if (driver.age <= 35) chance = 0.08;
  else if (driver.age === 36) chance = 0.16;
  else if (driver.age === 37) chance = 0.28;
  else if (driver.age === 38) chance = 0.44;
  else if (driver.age === 39) chance = 0.56;
  else if (driver.age === 40) chance = 0.68;
  else if (driver.age === 41) chance = 0.78;
  else if (driver.age === 42) chance = 0.85;
  else if (driver.age === 43) chance = 0.9;
  else if (driver.age === 44) chance = 0.94;
  else if (driver.age === 45) chance = 0.96;
  else chance = 0.985;

  if (driver.ovr <= 78) chance += 0.08;
  if (driver.ovr <= 72) chance += 0.1;
  if (ovrDelta <= -2) chance += 0.07;
  if (ovrDelta <= -4) chance += 0.08;
  if (perfPts <= 10) chance += 0.07;
  if (perfPts <= 2) chance += 0.07;
  if (!hasSeat) chance += 0.15;
  if (!hasSeat && driver.age >= 38) chance += 0.08;

  if (eliteLongevity) chance -= 0.14;
  if (driver.ovr >= 88) chance -= 0.07;
  if (driver.ovr >= 93 && perfPts >= 140) chance -= 0.08;
  if (driver.age >= 43 && eliteLongevity) chance = Math.max(chance, 0.2); // very rare late-career holdouts

  return Math.max(0, Math.min(0.997, chance));
}

function updateProfileStats(prev, raceResult, driverPoints, constructorPoints, season, isLastRace) {
  const seeded = ensureProfileData(prev);
  const driverSeason = { ...seeded.driverSeason };
  const driverCareer = { ...seeded.driverCareer };
  const teamSeason = { ...seeded.teamSeason };
  const teamHistory = { ...seeded.teamHistory };

  raceResult.results.forEach((res, pos) => {
    const finishPos = pos + 1;
    const pts = res.dnf ? 0 : (POINTS[pos] || 0);

    const ds = { ...(driverSeason[res.id] || blankSeasonStats()) };
    ds.races += 1;
    ds.points = driverPoints[res.id] || (ds.points + pts);
    if (res.dnf) ds.dnfs += 1;
    else {
      ds.finishes += 1;
      ds.sumFinish += finishPos;
      if (finishPos === 1) ds.wins += 1;
      if (finishPos <= 3) ds.podiums += 1;
    }
    driverSeason[res.id] = ds;

    const ts = { ...(teamSeason[res.teamId] || blankSeasonStats()) };
    ts.races += 1;
    ts.points = constructorPoints[res.teamId] || (ts.points + pts);
    if (res.dnf) ts.dnfs += 1;
    else {
      ts.finishes += 1;
      ts.sumFinish += finishPos;
      if (finishPos === 1) ts.wins += 1;
      if (finishPos <= 3) ts.podiums += 1;
    }
    teamSeason[res.teamId] = ts;
  });

  const pole = prev.qualiResults?.[0];
  if (pole && !pole.crashed) {
    const ps = { ...(driverSeason[pole.id] || blankSeasonStats()) };
    ps.poles += 1;
    driverSeason[pole.id] = ps;

    const pts = { ...(teamSeason[pole.teamId] || blankSeasonStats()) };
    pts.poles += 1;
    teamSeason[pole.teamId] = pts;
  }

  if (isLastRace) {
    const driverPositions = Object.entries(driverPoints)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .reduce((acc, [id], idx) => ({ ...acc, [id]: idx + 1 }), {});
    Object.entries(driverSeason).forEach(([id, stat]) => {
      const prevCareer = driverCareer[id] || { total: blankSeasonStats(), seasons: [] };
      const total = { ...prevCareer.total };
      const driverObj = prev.drivers.find(d => d.id === parseInt(id));
      const driverTeam = TEAMS.find(t => t.id === driverObj?.teamId);
      total.points += stat.points;
      total.wins += stat.wins;
      total.podiums += stat.podiums;
      total.poles += stat.poles;
      total.races += stat.races;
      total.finishes += stat.finishes;
      total.sumFinish += stat.sumFinish;
      total.dnfs += stat.dnfs;
      const seasons = [...(prevCareer.seasons || []), {
        season,
        ...stat,
        teamId: driverObj?.teamId ?? null,
        teamName: driverTeam?.name || "Free Agent",
        ovr: driverObj?.ovr ?? null,
        position: driverPositions[id] || null,
      }];
      driverCareer[id] = { total, seasons };
      driverSeason[id] = blankSeasonStats();
    });

    Object.entries(teamSeason).forEach(([id, stat]) => {
      const standingsPos = buildConstructorStandings(constructorPoints).findIndex(row => row.team?.id === id) + 1;
      const prevHist = teamHistory[id] || { seasons: [] };
      teamHistory[id] = {
        seasons: [...(prevHist.seasons || []), { season, ...stat, position: standingsPos || null }],
      };
      teamSeason[id] = blankSeasonStats();
    });
  }

  return { driverSeason, driverCareer, teamSeason, teamHistory };
}

export default function F1Manager() {
  const [game, setGame] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [driverCardId, setDriverCardId] = useState(null);
  const timerRef = useRef(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* ── TEAM SELECT ── */
  if (!game) {
    return (
      <div style={{ height: "100dvh", minHeight: "100vh", background: BG, fontFamily: "'Courier New', monospace", color: TEXT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
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
  const { team, drivers, prospects, budget, season, raceIndex, raceResults, driverPoints, constructorPoints, tab, weekendPhase, qualiResults, raceResult, qualiWeather, revealCount, raceRevealCount, news, modifiers, unreadNews, teamCars, teamCarProfiles, history, rivalry, driverSeasonStats, driverCareer, teamSeasonStats, teamHistory } = game;
  const myDrivers = drivers.filter(d => d.teamId === team.id);
  const cardDriver = drivers.find(d => d.id === driverCardId);
  const currentRace = RACES_2026[raceIndex];


  const startQuali = () => {
    const rosterSafe = ensureValidTeamRosters(drivers, prospects, season, []);
    const safeDrivers = rosterSafe.drivers;
    const safeProspects = rosterSafe.prospects;
    const safeMyDrivers = safeDrivers.filter(d => d.teamId === team.id);
    const safeActive = safeDrivers.filter(d => d.teamId !== null);
    const qw = pickWeather();
    const preNews = genPreRace(team, safeMyDrivers, currentRace, raceIndex + 1, budget, modifiers);
    const res = generateQuali(safeActive, currentRace, qw, modifiers, teamCars);
    setGame(p => {
      const effects = applyNewsEffects(preNews, p);
      return { ...p, drivers: safeDrivers, prospects: safeProspects, weekendPhase: "quali_reveal", qualiResults: res, qualiWeather: qw, revealCount: 0, news: [...preNews, ...p.news], budget: effects.budget, modifiers: effects.modifiers };
    });
    let c = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { c++; setGame(p => ({ ...p, revealCount: c })); if (c >= res.length) clearInterval(timerRef.current); }, 120);
  };

  const startRace = () => {
    const rosterSafe = ensureValidTeamRosters(drivers, prospects, season, []);
    const safeDrivers = rosterSafe.drivers;
    const safeProspects = rosterSafe.prospects;
    const safeMyDrivers = safeDrivers.filter(d => d.teamId === team.id);
    const rw = pickWeather();
    const res = generateRace(qualiResults, currentRace, rw, modifiers, teamCars);
    const rr = { results: res, wet: rw.id === "wet" || rw.id === "storm", weather: rw, name: currentRace.name };
    setGame(p => ({ ...p, drivers: safeDrivers, prospects: safeProspects, weekendPhase: "race_reveal", raceResult: rr, raceWeather: rw, raceRevealCount: 0 }));
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
            const postNews = genPostRace(team, safeMyDrivers, rr, raceIndex + 1, ndp, ncp);
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
            const profileUpdates = updateProfileStats(p, rr, ndp, ncp, p.season, isLast);
            const postRaceRosterCheck = ensureValidTeamRosters(p.drivers, p.prospects, p.season, []);
            return { ...p, drivers: postRaceRosterCheck.drivers, prospects: postRaceRosterCheck.prospects, driverPoints: ndp, constructorPoints: ncp, weekendPhase: "race_done", raceResults: [...p.raceResults, rr], news: [...allNew, ...p.news], budget: effects.budget, modifiers: ticked, teamCars: regChange.teamCars, teamCarProfiles: p.teamCarProfiles, history: finalisedHist, rivalry: newRivalry, driverSeasonStats: profileUpdates.driverSeason, driverCareer: profileUpdates.driverCareer, teamSeasonStats: profileUpdates.teamSeason, teamHistory: profileUpdates.teamHistory };
          });
        }, 400);
      }
    }, 150);
  };

  const nextWeekend = () => { setGame(p => ({ ...p, raceIndex: p.raceIndex + 1, weekendPhase: "preview", qualiResults: null, raceResult: null, revealCount: 0, raceRevealCount: 0 })); };

  const runOffseason = (p) => {
    const team = p.team;
    const newSeason = p.season + 1;
    const previousLineups = Object.fromEntries(TEAMS.map(t => [t.id, p.drivers.filter(d => d.teamId === t.id).map(d => d.id).sort((a, b) => a - b)]));
    const cStandings = buildConstructorStandings(p.constructorPoints);
    const cPos = cStandings.findIndex(s => s.team?.id === team.id) + 1;

    const prizeMoney = cPos === 1 ? 15 : cPos === 2 ? 10 : cPos === 3 ? 8 : cPos <= 6 ? 5 : 3;
    const baseBudget = 50;

    const agedDrivers = p.drivers.map(d => {
      const newAge = d.age + 1;
      const perfPts = p.driverPoints[d.id] || 0;
      const pot = d.pot || Math.min(98, d.ovr + 4);
      let ovrChange = 0;
      if (newAge <= 20) ovrChange += pick([-1, 0, 1, 2, 2, 3]);
      else if (newAge <= 24) ovrChange += pick([-2, -1, 0, 1, 2, 2]);
      else if (newAge <= 29) ovrChange += pick([-2, -1, 0, 0, 1, 1, 2]);
      else if (newAge <= 33) ovrChange += pick([-3, -2, -1, 0, 0, 1]);
      else ovrChange += pick([-5, -4, -3, -2, -1, 0]);
      if (pot - d.ovr >= 10 && newAge <= 25) ovrChange += maybe(0.5) ? pick([1, 2]) : 0;
      if (newAge <= 23 && pot >= 92) ovrChange += maybe(0.34) ? pick([2, 3]) : 0;
      else if (newAge <= 25 && pot >= 88) ovrChange += maybe(0.22) ? 1 : 0;
      if (pot - d.ovr <= 2 && newAge <= 25) ovrChange += maybe(0.3) ? -1 : 0;
      if (d.ovr >= 94) ovrChange += pick([-4, -3, -2, -2, -1, 0]);
      if (d.ovr >= 94 && newAge >= 27 && maybe(0.45)) ovrChange -= 1;
      else if (d.ovr >= 92) ovrChange += pick([-3, -2, -2, -1, -1, 0]);
      else if (d.ovr >= 90) ovrChange += pick([-2, -2, -1, -1, 0, 0, 1]);
      else if (d.ovr >= 88) ovrChange += pick([-2, -1, -1, 0, 0, 1]);
      else if (d.ovr >= 86 && newAge >= 29) ovrChange += pick([-1, -1, 0, 0, 1]);
      if (d.ovr >= 88 && maybe(0.35)) ovrChange -= 1;
      if (perfPts >= 220) ovrChange += 3;
      else if (perfPts >= 130) ovrChange += 2;
      else if (perfPts >= 60) ovrChange += 1;
      else if (perfPts <= 3 && newAge >= 30) ovrChange -= 2;
      else if (perfPts <= 10 && newAge >= 30) ovrChange -= 1;
      if (d.ovr >= 86 && perfPts < 70 && maybe(0.25)) ovrChange -= 1;
      if (newAge >= 23 && newAge <= 31 && pot >= 84 && d.ovr <= 87 && maybe(0.16)) ovrChange += 1;
      if (d.ovr >= 80 && d.ovr <= 82 && perfPts >= 45 && maybe(0.32)) ovrChange += 1;
      if (d.ovr >= 83 && d.ovr <= 85 && perfPts >= 35 && maybe(0.22)) ovrChange += 1;
      if (newAge <= 24 && pot >= 90 && d.ovr <= 87 && maybe(0.16)) ovrChange += pick([1, 2]);
      if (newAge >= 31 && maybe(0.2)) ovrChange -= pick([1, 2]);
      if (newAge >= 34 && maybe(0.3)) ovrChange -= pick([1, 2]);
      if (newAge >= 37 && maybe(0.35)) ovrChange -= pick([1, 2, 3]);
      if (d.ovr >= 90) ovrChange = Math.min(ovrChange, 1);
      if (d.ovr >= 92) ovrChange = Math.min(ovrChange, 0);
      ovrChange = Math.max(-6, Math.min(5, ovrChange));
      const legacyLongevity = d.ovr >= 93 && perfPts >= 180 && maybe(0.08);
      const maxAllowed = (newAge <= 24 ? 95 : newAge <= 28 ? 94 : newAge <= 31 ? 93 : newAge <= 34 ? 91 : 89) + (legacyLongevity ? 1 : 0);
      let newOvr = Math.max(55, Math.min(maxAllowed, d.ovr + ovrChange));
      if (newOvr > 90 && newAge > 24 && maybe(0.4)) newOvr -= 1;
      if (newOvr >= 89 && maybe(0.22)) newOvr -= 1;
      const newPot = Math.max(newOvr + 1, Math.min(99, pot + (newAge <= 22 && maybe(0.3) ? 1 : 0) - (newAge >= 31 ? 1 : 0)));
      const lowOvrSeasons = d.teamId !== null ? (newOvr < 80 ? (d.lowOvrSeasons || 0) + 1 : 0) : 0;
      return { ...d, age: newAge, ovr: newOvr, pot: newPot, _ovrDelta: ovrChange, lowOvrSeasons };
    });

    const retiredDrivers = [];
    const activePoolAfterRetirements = agedDrivers.filter(d => {
      const perfPts = p.driverPoints[d.id] || 0;
      const hasSeat = d.teamId !== null;
      const retirementChance = retirementChanceForDriver(d, perfPts, hasSeat);
      const retired = Math.random() < retirementChance;
      if (retired) retiredDrivers.push(d);
      return !retired;
    });

    const expiringByTeam = {};
    const processedDrivers = activePoolAfterRetirements.map(d => {
      const contractExpired = d.contractEnd && d.contractEnd <= p.season;
      if (contractExpired && d.teamId) {
        if (!expiringByTeam[d.teamId]) expiringByTeam[d.teamId] = [];
        expiringByTeam[d.teamId].push(d.id);
      }
      return contractExpired ? { ...d, teamId: null, contractEnd: null } : d;
    });

    const refreshedProspects = p.prospects
      .map(pr => {
        const newAge = pr.age + 1;
        const trend = newAge <= 23 ? pick([0, 1, 1, 2]) : newAge <= 28 ? pick([0, 1]) : pick([-1, 0, 0]);
        const newOvr = Math.max(55, Math.min(pr.pot, pr.ovr + trend));
        return { ...pr, age: newAge, ovr: newOvr };
      })
      .filter(pr => !(pr.age >= 34 && pr.ovr < 72));

    const firstNames = ["Lucas", "Tom", "Kacper", "Yuto", "Matteo", "Elias", "Hugo", "Nils", "Sami", "Noah", "André", "Finn", "Oscar", "Kai", "Leo", "Max", "Ravi", "Cillian", "Theo", "Ivan", "Milo", "Jakub", "Enzo", "Dani", "Riku", "Nico", "Ari", "Lorenzo"];
    const lastNames = ["Martín", "Verschoor", "Nowak", "Tanaka", "Rossi", "Berger", "Petit", "Stenberg", "Al Khatib", "Carlsen", "Silva", "McCarthy", "Lindqvist", "Taniguchi", "Fernández", "Schultz", "Patel", "Byrne", "Vasseur", "Petrov", "Costa", "Bauer", "Marin", "Khan", "Sato", "Meyer"];
    const usedGeneratedNames = new Set([...p.drivers, ...p.prospects].map(d => d.name?.toLowerCase()).filter(Boolean));
    const freshProspects = Array.from({ length: 8 }, (_, i) => {
      const isF3 = i < 3;
      const isReserve = i >= 5;
      const isEliteProspect = i === 0 ? maybe(0.4) : maybe(0.2);
      const baseAge = isF3 ? 18 : isReserve ? pick([24, 25, 26, 31]) : 19;
      const series = isF3 ? "F3" : isReserve ? pick(["Reserve", "Veteran", "Free Agent"]) : "F2";
      const baseOvr = isEliteProspect
        ? pick([76, 76, 77, 77, 78, 78, 79, 79, 80])
        : isF3 ? 60 + Math.floor(Math.random() * 7) : isReserve ? 70 + Math.floor(Math.random() * 8) : 63 + Math.floor(Math.random() * 9);
      const potBase = isEliteProspect ? pick([92, 93, 94, 95, 96]) : (isReserve ? 6 : 12) + Math.floor(Math.random() * 8);
      const pot = isEliteProspect ? Math.min(98, potBase + Math.floor(Math.random() * 2)) : Math.min(96, baseOvr + potBase);
      const readyNudge = isEliteProspect && maybe(0.25) ? 1 : 0;
      return { name: generateUniqueName(usedGeneratedNames, firstNames, lastNames), age: baseAge, ovr: baseOvr + readyNudge, pace: pick([3, 4, 4, 5]), consistency: pick([2, 3, 4, 4]), wet: pick([2, 3, 4]), series, salary: Math.max(1, Math.round(baseOvr / 28)), pot, id: 200 + newSeason * 10 + i + Math.floor(Math.random() * 500), teamId: null, contractEnd: null };
    });
    const allProspects = [...refreshedProspects, ...freshProspects];

    const newTeamCars = {};
    const newCarProfiles = {};
    const prevProfiles = p.teamCarProfiles || {};
    TEAMS.forEach(t => {
      const idn = TEAM_IDENTITIES[t.id] || { dev: 0.55, talent: 0.5, volatility: 0.5, focus: "aero" };
      const oldProfile = prevProfiles[t.id] || { aero: t.car, power: t.car, grip: t.car - 1, tyreWear: t.car - 2, reliability: t.car - 1, overall: t.car };
      const tCPos = cStandings.findIndex(s => s.team?.id === t.id) + 1;
      const finishBonus = tCPos > 0 ? (12 - tCPos) * 0.12 : 0;
      const catchup = (81 - oldProfile.overall) * 0.1 + (oldProfile.overall < 76 ? 1.0 : oldProfile.overall < 80 ? 0.55 : 0);
      const elitePenalty = oldProfile.overall >= 94 ? 2.8 : oldProfile.overall >= 92 ? 2.25 : oldProfile.overall >= 88 ? 1.35 : oldProfile.overall >= 84 ? 0.55 : 0;
      const eliteStallRisk = oldProfile.overall >= 92 ? 0.22 : oldProfile.overall >= 89 ? 0.12 : 0.04;
      const conceptRoll = Math.random();
      const conceptDelta = conceptRoll < (0.18 + eliteStallRisk)
        ? -pick([6, 5, 4, 4, 3])
        : conceptRoll < (0.36 + eliteStallRisk)
          ? -pick([3, 2, 2, 1])
          : conceptRoll < (0.78 + eliteStallRisk * 0.3)
            ? pick([-2, -1, -1, 0, 1, 1, 2])
            : pick([2, 2, 3, 3, 4]);
      const attrs = ["aero", "power", "grip", "tyreWear", "reliability"];
      const evolved = {};
      attrs.forEach(attr => {
        const focusBonus = attr === idn.focus ? 0.8 : 0;
        const rnd = (Math.random() - 0.5) * (2.6 + idn.volatility * 2.6);
        const executionRisk = maybe(0.22 + (1 - idn.dev) * 0.2) ? -pick([1, 2, 3]) : 0;
        const delta = conceptDelta + (idn.dev * 0.75) + finishBonus + (catchup * 1.2) + focusBonus + rnd + executionRisk - elitePenalty;
        evolved[attr] = Math.max(CAR_ATTR_FLOOR, Math.min(99, Math.round((oldProfile[attr] ?? oldProfile.overall) + delta)));
      });
      evolved.overall = Math.max(CAR_OVERALL_FLOOR, Math.round((evolved.aero + evolved.power + evolved.grip + evolved.tyreWear + evolved.reliability) / 5));
      newCarProfiles[t.id] = evolved;
      newTeamCars[t.id] = evolved.overall;
    });

    const transitionNews = [];
    // Critical flow: attempt contract renewals before any roster backfill/validation fill logic.
    const aiResult = aiTransfers(processedDrivers, allProspects, team.id, newSeason, transitionNews, p.driverPoints, p.constructorPoints, newTeamCars, expiringByTeam);
    const postAiDrivers = aiResult.drivers;
    const postAiProspects = aiResult.prospects;
    const transferStats = aiResult.transferStats || {
      expiringContracts: 0,
      eligibleRenewals: 0,
      renewalAttempts: 0,
      acceptedRenewals: 0,
      skippedRenewals: 0,
      skippedRenewalReasons: {},
      replacementChoices: 0,
    };
    const rosterFixed = ensureValidTeamRosters(postAiDrivers, postAiProspects, newSeason, transitionNews);

    const finalDrivers = rosterFixed.drivers
      .map(d => (((d.age >= 44) || (d.age >= 39 && d.ovr < 74)) && d.teamId !== team.id) ? { ...d, teamId: null } : d);
    const rosterRevalidated = ensureValidTeamRosters(finalDrivers, rosterFixed.prospects, newSeason, transitionNews);
    const finalRosterDrivers = rosterRevalidated.drivers;
    const sanitizedRosterDrivers = finalRosterDrivers.map(d => {
      const copy = { ...d };
      delete copy._ovrDelta;
      return copy;
    });
    const finalProspects = rosterRevalidated.prospects;
    const releasedDrivers = sanitizedRosterDrivers.filter(d => d.teamId === null && processedDrivers.find(pd => pd.id === d.id)?.teamId === team.id);

    transitionNews.push(makeNews(`${newSeason} Season Begins`, `A new year dawns for ${team.name}. Base budget $${baseBudget}M + prize money $${prizeMoney}M from P${cPos}.`, "Team", 0));
    if (retiredDrivers.length > 0) {
      const under30 = retiredDrivers.filter(d => d.age < 30).length;
      const band3033 = retiredDrivers.filter(d => d.age >= 30 && d.age <= 33).length;
      const band3436 = retiredDrivers.filter(d => d.age >= 34 && d.age <= 36).length;
      const band37plus = retiredDrivers.filter(d => d.age >= 37).length;
      const headlineRetirees = retiredDrivers
        .sort((a, b) => (b._ovrDelta || 0) - (a._ovrDelta || 0))
        .slice(0, 3)
        .map(d => `${d.name} (${d.age})`)
        .join(", ");
      transitionNews.push(makeNews("Retirements Confirmed", `${retiredDrivers.length} driver(s) retired this offseason: ${headlineRetirees}. Age bands U30/30-33/34-36/37+: ${under30}/${band3033}/${band3436}/${band37plus}.`, "Driver", 0));
    }
    releasedDrivers.forEach(rd => transitionNews.push(makeNews(`${rd.name} Contract Expired`, `${rd.name}'s deal with ${team.name} has ended. The seat is now open.`, "Driver", 0)));

    const devSwing = TEAMS.map(t => ({ team: t, diff: (newTeamCars[t.id] || 0) - (p.teamCars?.[t.id] || t.car) })).sort((a, b) => b.diff - a.diff);
    const driverSwing = sanitizedRosterDrivers
      .map(d => ({ driver: d, diff: d.ovr - (p.drivers.find(old => old.id === d.id)?.ovr || d.ovr) }))
      .sort((a, b) => b.diff - a.diff);
    const rosterValid = TEAMS.every(t => sanitizedRosterDrivers.filter(d => d.teamId === t.id).length === 2);
    const lineupContinuity = TEAMS.map(t => {
      const prev = previousLineups[t.id] || [];
      const nextIds = sanitizedRosterDrivers.filter(d => d.teamId === t.id).map(d => d.id);
      const overlap = nextIds.filter(id => prev.includes(id)).length;
      return { teamId: t.id, overlap };
    });
    const unchangedLineups = lineupContinuity.filter(x => x.overlap === 2).length;
    const changedLineups = TEAMS.length - unchangedLineups;
    const avgContinuity = (lineupContinuity.reduce((sum, x) => sum + x.overlap, 0) / TEAMS.length).toFixed(2);
    const newSeatSignings = TEAMS.flatMap(t => {
      const prev = previousLineups[t.id] || [];
      return sanitizedRosterDrivers.filter(d => d.teamId === t.id && !prev.includes(d.id));
    });
    const lowestNewSeatOvr = newSeatSignings.length ? Math.min(...newSeatSignings.map(d => d.ovr)) : null;
    const activeGrid = sanitizedRosterDrivers.filter(d => d.teamId !== null);
    const avgGridOvr = activeGrid.length ? (activeGrid.reduce((sum, d) => sum + d.ovr, 0) / activeGrid.length) : 0;
    const inflationWarning = avgGridOvr > 85.8 ? `Inflation warning: avg grid OVR ${avgGridOvr.toFixed(1)} above healthy range.` : "Inflation warning: none.";
    const reSigningsCount = transitionNews.filter(n => n.title.includes("Re-Sign")).length;
    if (transferStats.eligibleRenewals > 0 && transferStats.renewalAttempts === 0) {
      transitionNews.push(makeNews("Renewal Attempt Error", `Expiring contracts detected (${transferStats.expiringContracts}) but renewal attempts were zero.`, "Board", 0));
    }
    const skippedReasonSummary = Object.entries(transferStats.skippedRenewalReasons || {})
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `${reason}: ${count}`)
      .join(" | ") || "none";
    if (devSwing[0]?.diff > 0) transitionNews.push(makeNews(`Development Movers: ${devSwing[0].team.name}`, `${devSwing[0].team.name} made the biggest winter jump (+${devSwing[0].diff}).`, "Development", 0));
    if (devSwing[devSwing.length - 1]?.diff < 0) transitionNews.push(makeNews(`Development Setback: ${devSwing[devSwing.length - 1].team.name}`, `${devSwing[devSwing.length - 1].team.name} suffered the sharpest decline (${devSwing[devSwing.length - 1].diff}).`, "Development", 0));
    if (driverSwing[0]?.diff > 0) transitionNews.push(makeNews(`Breakout Watch: ${driverSwing[0].driver.name}`, `${driverSwing[0].driver.name} posted the biggest offseason rise (+${driverSwing[0].diff} OVR).`, "Driver", 0));
    if (driverSwing[driverSwing.length - 1]?.diff < 0) transitionNews.push(makeNews(`Form Dip: ${driverSwing[driverSwing.length - 1].driver.name}`, `${driverSwing[driverSwing.length - 1].driver.name} had the sharpest offseason drop (${driverSwing[driverSwing.length - 1].diff} OVR).`, "Driver", 0));
    transitionNews.push(makeNews(`Roster Audit ${rosterValid ? "Passed" : "Failed"}`, `All teams ${rosterValid ? "have exactly" : "do not have"} two active race drivers before round one.`, "Team", 0));
    transitionNews.push(makeNews("Roster Validation Debug", `Invalid teams: ${rosterRevalidated.invalidTeams}. Emergency drivers generated: ${(rosterFixed.emergencyGenerated || 0) + (rosterRevalidated.emergencyGenerated || 0)}.`, "Team", 0));
    transitionNews.push(makeNews("Lineup Continuity Debug", `Expiring: ${transferStats.expiringContracts}. Eligible: ${transferStats.eligibleRenewals}. Renewal attempts: ${transferStats.renewalAttempts}. Accepted renewals: ${transferStats.acceptedRenewals}. Skipped renewals: ${transferStats.skippedRenewals || 0}. Skipped reasons: ${skippedReasonSummary}. Replacement choices: ${transferStats.replacementChoices}. Re-signings: ${reSigningsCount}. Unchanged teams: ${unchangedLineups}/${TEAMS.length}. Changed teams: ${changedLineups}. Avg retained drivers/team: ${avgContinuity}. Lowest new-seat OVR: ${lowestNewSeatOvr ?? "—"}. ${inflationWarning}`, "Team", 0));
    const oldestActive = [...sanitizedRosterDrivers].sort((a, b) => b.age - a.age).slice(0, 3).map(d => `${d.name} (${d.age})`).join(", ");
    transitionNews.push(makeNews("Oldest Active Drivers", oldestActive || "No active drivers found after offseason processing.", "Driver", 0));
    transitionNews.push(makeNews(`New Talent Class Arrives`, `${freshProspects.length} new prospects enter the market this season.`, "Driver", 0));

    const effects = applyNewsEffects(transitionNews, { budget: baseBudget + prizeMoney, modifiers: [], team, drivers: sanitizedRosterDrivers });

    return {
      ...p,
      season: newSeason,
      raceIndex: 0,
      raceResults: [],
      driverPoints: {},
      constructorPoints: {},
      drivers: sanitizedRosterDrivers,
      prospects: finalProspects,
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
      teamCarProfiles: newCarProfiles,
      rivalry: null,
    };
  };

  const startNextSeason = () => { setGame(p => runOffseason(p)); };

  const simSeasonDev = () => {
    setGame(p => {
      let sim = { ...p };
      for (let i = sim.raceIndex; i < RACES_2026.length; i++) {
        const simRosterCheck = ensureValidTeamRosters(sim.drivers, sim.prospects, sim.season, []);
        sim = { ...sim, drivers: simRosterCheck.drivers, prospects: simRosterCheck.prospects };
        const race = RACES_2026[i];
        const qw = pickWeather();
        const qres = generateQuali(sim.drivers.filter(d => d.teamId !== null), race, qw, sim.modifiers, sim.teamCars);
        const rw = pickWeather();
        const res = generateRace(qres, race, rw, sim.modifiers, sim.teamCars);
        const rr = { results: res, wet: rw.id === "wet" || rw.id === "storm", weather: rw, name: race.name };
        const ndp = { ...sim.driverPoints }, ncp = { ...sim.constructorPoints };
        res.forEach((d, pos) => { if (!d.dnf && pos < 10) { ndp[d.id] = (ndp[d.id] || 0) + POINTS[pos]; ncp[d.teamId] = (ncp[d.teamId] || 0) + POINTS[pos]; } });
        const postNews = genPostRace(sim.team, sim.drivers.filter(d => d.teamId === sim.team.id), rr, i + 1, ndp, ncp);
        const regChange = (i + 1 >= 6 && i + 1 <= 18) ? genMidSeasonReg(sim.teamCars, i + 1, sim.team.name) : { news: [], teamCars: sim.teamCars };
        const allNew = [...postNews, ...regChange.news];
        const effects = applyNewsEffects(allNew, { ...sim, budget: sim.budget, modifiers: sim.modifiers });
        const ticked = tickModifiers(effects.modifiers);
        const hist = updateHistory(sim.history, sim.season, rr, ndp, ncp, sim.team, qres);
        const profileUpdates = updateProfileStats({ ...sim, qualiResults: qres }, rr, ndp, ncp, sim.season, i + 1 === RACES_2026.length);
        sim = {
          ...sim,
          raceIndex: i + 1,
          weekendPhase: "race_done",
          qualiResults: qres,
          raceResult: rr,
          raceResults: [...sim.raceResults, rr],
          driverPoints: ndp,
          constructorPoints: ncp,
          news: [...allNew, ...sim.news],
          budget: effects.budget,
          modifiers: ticked,
          teamCars: regChange.teamCars,
          history: hist,
          driverSeasonStats: profileUpdates.driverSeason,
          driverCareer: profileUpdates.driverCareer,
          teamSeasonStats: profileUpdates.teamSeason,
          teamHistory: profileUpdates.teamHistory,
        };
      }
      const postSeasonRosterCheck = ensureValidTeamRosters(sim.drivers, sim.prospects, sim.season, []);
      sim = { ...sim, drivers: postSeasonRosterCheck.drivers, prospects: postSeasonRosterCheck.prospects };
      const cStandings = buildConstructorStandings(sim.constructorPoints);
      const dStandings = Object.entries(sim.driverPoints).map(([id, pts]) => { const d = sim.drivers.find(x => x.id === parseInt(id)); return d ? { driver: d, pts } : null; }).filter(Boolean).sort((a, b) => b.pts - a.pts);
      const endNews = genSeasonEnd(sim.team, cStandings, dStandings, RACES_2026.length);
      const finalisedHist = finaliseSeasonHistory(sim.history, sim.season, sim.driverPoints, sim.constructorPoints, sim.team, sim.drivers);
      const topD = dStandings[0];
      const topC = cStandings[0];
      sim = { ...sim, news: [...endNews, ...sim.news], history: finalisedHist };
      const next = runOffseason(sim);
      const finalRosterCheck = ensureValidTeamRosters(next.drivers, next.prospects, next.season, []);
      const safeNext = { ...next, drivers: finalRosterCheck.drivers, prospects: finalRosterCheck.prospects };
      const prevLineups = Object.fromEntries(TEAMS.map(t => [t.id, sim.drivers.filter(d => d.teamId === t.id).map(d => d.id)]));
      const continuityRows = TEAMS.map(t => {
        const prev = prevLineups[t.id] || [];
        const now = safeNext.drivers.filter(d => d.teamId === t.id).map(d => d.id);
        const overlap = now.filter(id => prev.includes(id)).length;
        return { teamId: t.id, overlap };
      });
      const unchangedTeams = continuityRows.filter(r => r.overlap === 2).length;
      const avgContinuity = (continuityRows.reduce((s, r) => s + r.overlap, 0) / TEAMS.length).toFixed(2);
      const offseasonReSignings = safeNext.news.filter(n => n.round === 0 && n.title.includes("Re-Sign")).length;
      const newlySignedRaceDrivers = TEAMS.flatMap(t => {
        const prev = prevLineups[t.id] || [];
        return safeNext.drivers.filter(d => d.teamId === t.id && !prev.includes(d.id));
      });
      const lowestNewSeatOvr = newlySignedRaceDrivers.length ? Math.min(...newlySignedRaceDrivers.map(d => d.ovr)) : null;
      const nameCounts = {};
      safeNext.drivers.filter(d => d.teamId !== null).forEach(d => { nameCounts[d.name] = (nameCounts[d.name] || 0) + 1; });
      const duplicateNames = Object.entries(nameCounts).filter(([, c]) => c > 1).map(([name]) => name);
      const over80 = safeNext.drivers.filter(d => d.ovr >= 80).sort((a, b) => b.ovr - a.ovr);
      const top10Ratings = [...safeNext.drivers].sort((a, b) => b.ovr - a.ovr).slice(0, 10);
      const over90 = safeNext.drivers.filter(d => d.ovr >= 90).length;
      const over92 = safeNext.drivers.filter(d => d.ovr >= 92).length;
      const over95 = safeNext.drivers.filter(d => d.ovr >= 95).length;
      const activeDrivers = safeNext.drivers.filter(d => d.teamId !== null);
      const activeOver80 = activeDrivers.filter(d => d.ovr >= 80).length;
      const activeOver85 = activeDrivers.filter(d => d.ovr >= 85).length;
      const activeBelow80 = activeDrivers.filter(d => d.ovr < 80).length;
      const bucket8082 = activeDrivers.filter(d => d.ovr >= 80 && d.ovr <= 82).length;
      const bucket8385 = activeDrivers.filter(d => d.ovr >= 83 && d.ovr <= 85).length;
      const bucket86plus = activeDrivers.filter(d => d.ovr >= 86).length;
      const avgGridOvr = activeDrivers.length ? (activeDrivers.reduce((sum, d) => sum + d.ovr, 0) / activeDrivers.length).toFixed(1) : "—";
      const numericAvgGridOvr = activeDrivers.length ? (activeDrivers.reduce((sum, d) => sum + d.ovr, 0) / activeDrivers.length) : 0;
      const inflationWarning = numericAvgGridOvr > 85.8 ? `Inflation warning: avg grid OVR ${numericAvgGridOvr.toFixed(1)} is above healthy range.` : "Inflation warning: none.";
      const lowestStarter = [...activeDrivers].sort((a, b) => a.ovr - b.ovr)[0];
      const topYoungProspects = [...safeNext.prospects]
        .filter(d => d.age <= 21)
        .sort((a, b) => (b.pot || b.ovr) - (a.pot || a.ovr))
        .slice(0, 5)
        .map(d => `${d.name.split(" ").pop()} ${d.ovr}/${d.pot}`);
      const sortedCars = Object.entries(safeNext.teamCars || {}).map(([id, rating]) => ({ team: TEAMS.find(t => t.id === id), rating })).sort((a, b) => b.rating - a.rating);
      const fullStandings = buildConstructorStandings(sim.constructorPoints);
      const zeroPointTeams = fullStandings.filter(s => s.pts === 0).map(s => s.team?.name).filter(Boolean);
      const lowPointsTeams = fullStandings.filter(s => s.pts >= 1 && s.pts <= 10).length;
      const midPointsTeams = fullStandings.filter(s => s.pts >= 11 && s.pts <= 50).length;
      const highPointsTeams = fullStandings.filter(s => s.pts > 50).length;
      const p1p2Gap = (fullStandings[0]?.pts || 0) - (fullStandings[1]?.pts || 0);
      const p2p4Gap = (fullStandings[1]?.pts || 0) - (fullStandings[3]?.pts || 0);
      const constructorOrder = fullStandings.map((s, idx) => `P${idx + 1} ${s.team?.name} (${s.pts})`).join(" · ");
      const lowerHalfTeams = fullStandings.slice(Math.floor(fullStandings.length / 2)).map(s => s.team?.id);
      const lowerHalfPointsFinishes = (sim.raceResults || []).reduce((sum, rr) => {
        const pointFinishers = rr.results.slice(0, 10).filter(r => !r.dnf && lowerHalfTeams.includes(r.teamId)).length;
        return sum + pointFinishers;
      }, 0);
      const avgLowerHalfPointFinishes = sim.raceResults?.length ? (lowerHalfPointsFinishes / sim.raceResults.length).toFixed(2) : "0.00";
      const topCarTeams = sortedCars.slice(0, 3);
      const topTeamDriverAvg = topCarTeams.map(tc => {
        const td = safeNext.drivers.filter(d => d.teamId === tc.team?.id);
        const avg = td.length ? (td.reduce((sum, d) => sum + d.ovr, 0) / td.length).toFixed(1) : "—";
        return `${tc.team?.name}:${avg}`;
      }).join(", ");
      const driverTeamAverages = TEAMS.map(t => {
        const td = safeNext.drivers.filter(d => d.teamId === t.id);
        return { team: t, avg: td.length ? td.reduce((sum, d) => sum + d.ovr, 0) / td.length : 0 };
      }).sort((a, b) => b.avg - a.avg);
      const mismatchTeams = sortedCars
        .map((carRow, idx) => {
          const driverRank = driverTeamAverages.findIndex(row => row.team.id === carRow.team?.id) + 1;
          return { team: carRow.team, carRank: idx + 1, driverRank };
        })
        .filter(row => row.driverRank - row.carRank >= 3)
        .map(row => `${row.team?.name} (car P${row.carRank}, drivers P${row.driverRank})`);
      const summary = makeNews(
        "Dev Sim Summary",
        `WDC: ${topD?.driver?.name || "—"}. WCC: ${topC?.team?.name || "—"}. Gaps P1-P2/P2-P4: ${p1p2Gap}/${p2p4Gap}. Team buckets 0/1-10/11-50/50+: ${zeroPointTeams.length}/${lowPointsTeams}/${midPointsTeams}/${highPointsTeams}. Lower-half points finishers/race: ${avgLowerHalfPointFinishes}. Roster invalid teams/emergencies: ${finalRosterCheck.invalidTeams}/${finalRosterCheck.emergencyGenerated}. Re-signings: ${offseasonReSignings}. Unchanged lineups: ${unchangedTeams}/${TEAMS.length}. Avg continuity: ${avgContinuity}. Lowest new-seat OVR: ${lowestNewSeatOvr ?? "—"}. Duplicates: ${duplicateNames.length ? duplicateNames.join(", ") : "none"}. Active <80: ${activeBelow80}. Active OVR80+/85+: ${activeOver80}/${activeOver85}. Active buckets 80-82/83-85/86+: ${bucket8082}/${bucket8385}/${bucket86plus}. Avg grid OVR: ${avgGridOvr}. ${inflationWarning} Lowest starter: ${lowestStarter ? `${lowestStarter.name} ${lowestStarter.ovr}` : "—"}. Top U22 prospects: ${topYoungProspects.length ? topYoungProspects.join(", ") : "none"}. Top10 OVR: ${top10Ratings.map(d => `${d.name.split(" ").pop()} ${d.ovr}`).join(", ")}. OVR90+/92+/95+: ${over90}/${over92}/${over95}. OVR80+: ${over80.length}. Top-car team avg OVR: ${topTeamDriverAvg}. Car-driver mismatch: ${mismatchTeams.length ? mismatchTeams.join(", ") : "none"}. Car range: ${sortedCars[sortedCars.length - 1]?.rating ?? "—"}-${sortedCars[0]?.rating ?? "—"}. Zero-point teams: ${zeroPointTeams.length ? zeroPointTeams.join(", ") : "none"}. Constructors: ${constructorOrder}.`,
        "Team",
        0
      );
      return { ...safeNext, news: [summary, ...safeNext.news], tab: "news" };
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
  const constructorStandings = buildConstructorStandings(constructorPoints);
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
    { id: "profiles", label: "PROFILES", icon: "📁" },
    { id: "contracts", label: "CONTRACTS", icon: "📜" },
    { id: "standings", label: "STANDINGS", icon: "📊" },
    { id: "calendar", label: "CALENDAR", icon: "📅" },
    { id: "history", label: "RECORDS", icon: "🏆" },
  ];

  return (
    <div style={{ height: "100dvh", minHeight: "100vh", width: "100vw", overflow: "hidden", background: BG, color: TEXT, fontFamily: "'Courier New', monospace", display: "flex", fontSize: 13 }}>
      <div style={{ width: 190, height: "100%", background: BG2, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
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
        <div style={{ padding: 20, flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          {tab === "race" && <RaceTab {...{ currentRace, weekendPhase, qualiResults, qualiWeather, raceResult, raceRevealCount, revealCount, startQuali, startRace, nextWeekend, startNextSeason, team, raceIndex, driverStandings, constructorStandings, season, myDrivers, rivalry, simSeasonDev, openDriverCard: setDriverCardId }} />}
          {tab === "news" && <NewsTab news={news} />}
          {tab === "squad" && <SquadTab {...{ myDrivers, team, driverPoints, releaseDriver, season, openDriverCard: setDriverCardId }} />}
          {tab === "scouting" && <ScoutingTab {...{ prospects, budget, signProspect, myDrivers, team, openDriverCard: setDriverCardId }} />}
          {tab === "grid" && <GridTab {...{ drivers, driverPoints, team, season, teamCars, teamCarProfiles, openDriverCard: setDriverCardId }} />}
          {tab === "profiles" && <ProfilesTab {...{ drivers, teams: TEAMS, team, driverPoints, constructorPoints, season, driverSeasonStats, driverCareer, teamSeasonStats, teamHistory, teamCars }} />}
          {tab === "contracts" && <ContractsTab {...{ drivers, season, team, driverPoints, openDriverCard: setDriverCardId }} />}
          {tab === "standings" && <StandingsTab {...{ driverStandings, constructorStandings, team, openDriverCard: setDriverCardId }} />}
          {tab === "calendar" && <CalendarTab {...{ raceIndex, raceResults, team, season }} />}
          {tab === "history" && <HistoryTab history={history} team={team} rivalry={rivalry} />}
        </div>
      </div>
      <DriverHistoryModal driver={cardDriver} season={season} driverPoints={driverPoints} driverSeasonStats={driverSeasonStats} driverCareer={driverCareer} onClose={() => setDriverCardId(null)} />
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
function RaceTab({ currentRace, weekendPhase, qualiResults, qualiWeather, raceResult, raceRevealCount, revealCount, startQuali, startRace, nextWeekend, startNextSeason, team, raceIndex, driverStandings, constructorStandings, season, myDrivers, rivalry, simSeasonDev, openDriverCard }) {
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
              <DriverLink driver={d} onOpen={openDriverCard} color="#fff" />
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
                <DriverLink driver={d} onOpen={openDriverCard} color="#F87171" />'s contract expires — they will leave unless re-signed
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
  const myCPoints = constructorStandings.find(s => s.team?.id === team.id)?.pts || 0;
  const leaderPoints = constructorStandings[0]?.pts || 0;
  const gapToLead = leaderPoints - myCPoints;
  const projected = myDrivers.map(d => ({ ...d, projection: Math.round((d.ovr * 0.65) + (d.pace + d.consistency + d.wet) * 2.4) })).sort((a, b) => b.projection - a.projection);

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

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 18, alignItems: "stretch" }}>
        <div style={{ background: BG3, border: `1px solid ${BORDER}`, padding: "18px 20px" }}>
          {weekendPhase === "preview" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 11, color: DIM, letterSpacing: 2, marginBottom: 14 }}>LIGHTS OUT AWAITS</div>
              <button onClick={startQuali} style={{ padding: "14px 48px", background: team.color, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, letterSpacing: 3, fontFamily: "inherit" }}>BEGIN QUALIFYING →</button>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.6 }}>
              <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 8 }}>WEEKEND STORYLINE</div>
              {weekendPhase === "quali_reveal" ? `Qualifying is underway at ${currentRace.circuit}. Track position is critical here and could define your race trajectory.` : `Race day at ${currentRace.name}: championship pressure is building with ${RACES_2026.length - raceIndex - 1} rounds after this.`}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <DashCard title="CIRCUIT INFO" accent={BLUE}>{currentRace.circuit} · {currentRace.laps} laps</DashCard>
          <DashCard title="CHAMPIONSHIP" accent="#E2B53A">{gapToLead > 0 ? `${gapToLead} pts behind P1` : `Leading by ${Math.abs(gapToLead)} pts`} · {constructorStandings.findIndex(s => s.team?.id === team.id) + 1 > 0 ? `P${constructorStandings.findIndex(s => s.team?.id === team.id) + 1}` : "No rank yet"}</DashCard>
          <DashCard title="RIVALRY" accent="#F87171">{rivalry?.rivalName ? `${rivalry.rivalName} (${rivalry.gap >= 0 ? "+" : ""}${rivalry.gap})` : "Rivalry will appear once standings settle."}</DashCard>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 8, marginBottom: 10, maxWidth: 900 }}>
        <DashCard title="PROJECTED LEAD" accent={team.color}>{projected[0] ? `${projected[0].name.split(" ").pop()} (${projected[0].projection})` : "—"}</DashCard>
        <DashCard title="TEAM EXPECTATION" accent="#4ADE80">{myDrivers.length >= 2 ? "Target: double points finish" : "Sign a second driver to maximize points."}</DashCard>
        <DashCard title="CONDITIONS" accent="#60A5FA">{weekendPhase === "quali_reveal" ? (qualiWeather?.label || "Forecast pending") : (raceResult?.weather?.label || "Dry-biased conditions")}</DashCard>
      </div>
      <div style={{ marginBottom: 18 }}>
        <button onClick={simSeasonDev} style={{ padding: "8px 14px", background: "rgba(192,132,252,0.18)", border: "1px solid rgba(192,132,252,0.45)", color: "#C084FC", fontFamily: "inherit", fontSize: 10, letterSpacing: 1, fontWeight: 700, cursor: "pointer" }}>SIM SEASON (DEV)</button>
      </div>

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
                <td style={{ padding: "8px", fontWeight: mine ? 800 : 400, color: mine ? "#fff" : TEXT }}><DriverLink driver={d} onOpen={openDriverCard} color={mine ? "#fff" : TEXT} weight={mine ? 800 : 500} /></td>
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
            {weekendPhase === "race_reveal" && <span style={{ marginTop: -14, fontSize: 9, color: "#60A5FA", letterSpacing: 2 }}><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style><span style={{ animation: "pulse 1s infinite" }}>● LIVE</span></span>}
          </div>
          {(() => {
            const finishers = raceResult.results.filter(r => !r.dnf);
            const fastestLap = finishers.length > 0 ? finishers.reduce((best, cur) => {
              if (!best) return cur;
              const b = (best.pace || 0) + (best.consistency || 0) + (best.ovr || 0) / 25;
              const c = (cur.pace || 0) + (cur.consistency || 0) + (cur.ovr || 0) / 25;
              return c > b ? cur : best;
            }, null) : null;
            return (<>
              {fastestLap && <div style={{ marginBottom: 8, fontSize: 10, letterSpacing: 2, color: "#C084FC", fontWeight: 700 }}>⚡ FASTEST LAP: <DriverLink driver={fastestLap} onOpen={openDriverCard} color="#C084FC" /></div>}
              <table style={{ width: "100%", maxWidth: 750, borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["POS", "DRIVER", "TEAM", "GRID", "+/-", "PTS", "FL"].map(h => (<th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2, fontWeight: 600 }}>{h}</th>))}</tr></thead>
                <tbody>{raceResult.results.map((d, i) => {
                  const rc = weekendPhase === "race_done" ? raceResult.results.length : raceRevealCount;
                  const vis = i < rc; const dt = TEAMS.find(t => t.id === d.teamId); const mine = d.teamId === team.id;
                  const pc = d.dnf ? null : d.gridPos - (i + 1);
                  const podiumBg = i === 0 ? "rgba(255,215,0,0.18)" : i === 1 ? "rgba(255,214,102,0.14)" : i === 2 ? "rgba(234,179,8,0.14)" : "transparent";
                  const podiumBorder = i === 0 ? "#FFD700" : i === 1 ? "#FACC15" : i === 2 ? "#EAB308" : null;
                  const isFastest = fastestLap && d.id === fastestLap.id && !d.dnf;
                  return (<tr key={d.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : podiumBg, boxShadow: podiumBorder ? `inset 3px 0 0 ${podiumBorder}` : "none", opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-20px)", transition: "all 0.3s ease-out" }}>
                    <td style={{ padding: "8px", fontWeight: 800, color: d.dnf ? "#EF4444" : i < 3 ? "#fff" : DIM, width: 44 }}>{d.dnf ? "DNF" : i + 1}</td>
                    <td style={{ padding: "8px", fontWeight: mine ? 800 : 500, color: d.dnf ? "#FCA5A5" : mine ? "#fff" : TEXT, textDecoration: d.dnf ? "line-through" : "none" }}>
                      {i < 3 && !d.dnf ? <span style={{ marginRight: 5 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span> : null}
                      <DriverLink driver={d} onOpen={openDriverCard} color={d.dnf ? "#FCA5A5" : mine ? "#fff" : TEXT} weight={mine ? 800 : 500} />
                    </td>
                    <td style={{ padding: "8px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5, opacity: d.dnf ? 0.75 : 1 }}><TeamBadge teamId={d.teamId} size={14} /><span style={{ color: DIM, fontSize: 11 }}>{dt?.name}</span></span></td>
                    <td style={{ padding: "8px", color: DIM, fontSize: 11 }}>P{d.gridPos}</td>
                    <td style={{ padding: "8px", fontSize: 10, fontWeight: 800 }}>
                      {d.dnf ? <span style={{ color: DIM3 }}>—</span> : pc > 0 ? <span style={{ color: "#4ADE80", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", padding: "1px 6px" }}>▲ {pc}</span> : pc < 0 ? <span style={{ color: "#F87171", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", padding: "1px 6px" }}>▼ {Math.abs(pc)}</span> : <span style={{ color: DIM }}>—</span>}
                    </td>
                    <td style={{ padding: "8px", color: !d.dnf && i < 10 ? "#E2B53A" : DIM3, fontWeight: 700 }}>{d.dnf ? "—" : (POINTS[i] || 0)}</td>
                    <td style={{ padding: "8px", color: isFastest ? "#C084FC" : DIM3, fontWeight: 800 }}>{isFastest ? "⚡" : "—"}</td>
                  </tr>);
                })}</tbody>
              </table>
            </>);
          })()}
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
function SquadTab({ myDrivers, team, driverPoints, releaseDriver, season, openDriverCard }) {
  if (myDrivers.length === 0) return <div style={{ color: DIM, padding: 40, textAlign: "center" }}>No drivers. Visit Scouting.</div>;
  return (<div><Sec>YOUR DRIVERS</Sec>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 780 }}>
      {myDrivers.map((d, i) => (
        <div key={d.id} style={{ background: BG3, border: `1px solid ${BORDER}`, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div><div style={{ fontSize: 9, color: BLUE, letterSpacing: 2, marginBottom: 3 }}>DRIVER {i + 1}</div><div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif" }}><DriverLink driver={d} onOpen={openDriverCard} color="#fff" /></div><div style={{ fontSize: 10, color: DIM, marginTop: 2 }}>Age {d.age} · OVR <span style={{ color: "#E2B53A" }}>{d.ovr}</span></div></div>
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
    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: 8, maxWidth: 900 }}>
      <DashCard title="TEAM RATING" accent={team.color}>{Math.round((myDrivers.reduce((s, d) => s + d.ovr, 0) / Math.max(1, myDrivers.length)))} OVR AVG</DashCard>
      <DashCard title="BUDGET STATUS" accent="#E2B53A">Use header budget + contract costs to manage next season flexibility.</DashCard>
      <DashCard title="CAR STRENGTH" accent="#4ADE80">Monitor sidebar car rating to match driver quality.</DashCard>
      <DashCard title="CONTRACT RISK" accent="#F87171">{myDrivers.filter(d => (d.contractEnd - season) <= 1).length} driver(s) expiring within 1 year.</DashCard>
      <DashCard title="SEASON POINTS" accent="#60A5FA">{myDrivers.reduce((s, d) => s + (driverPoints[d.id] || 0), 0)} total points from your lineup.</DashCard>
    </div>
  </div>);
}

function ScoutingTab({ prospects, budget, signProspect, myDrivers, team, openDriverCard }) {
  const canSign = myDrivers.length < 2;
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? prospects : prospects.filter(p => p.series === filter);
  const sorted = [...filtered].sort((a, b) => b.ovr - a.ovr);
  return (<div><Sec>PROSPECT SCOUTING</Sec>
    {!canSign && <div style={{ marginBottom: 16, padding: 12, background: BG3, border: `1px solid ${BORDER}`, color: TEXT2, fontSize: 11 }}>Squad full. Release a driver first.</div>}
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {["all", "F2", "F3", "IndyCar", "Free Agent"].map(f => (<button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", background: filter === f ? "rgba(0,0,0,0.15)" : "transparent", border: `1px solid ${filter === f ? BORDER2 : BORDER}`, color: filter === f ? "#fff" : DIM, cursor: "pointer", fontSize: 10, fontFamily: "inherit", letterSpacing: 1, fontWeight: filter === f ? 700 : 400 }}>{f === "all" ? "ALL" : f.toUpperCase()}</button>))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
      <DashCard title="BEST AVAILABLE" accent="#E2B53A">{sorted[0] ? <><DriverLink driver={sorted[0]} onOpen={openDriverCard} color={TEXT2} /> · OVR {sorted[0].ovr}</> : "No candidates"}</DashCard>
      <DashCard title="HIGHEST POTENTIAL" accent="#C084FC">{sorted.length > 0 ? `${[...sorted].sort((a,b)=>b.pot-a.pot)[0].name} · POT ${[...sorted].sort((a,b)=>b.pot-a.pot)[0].pot}` : "No candidates"}</DashCard>
      <DashCard title="BEST VALUE" accent="#4ADE80">{sorted.length > 0 ? `${[...sorted].sort((a,b)=>(a.salary/(a.ovr||1))-(b.salary/(b.ovr||1)))[0].name} · $${[...sorted].sort((a,b)=>(a.salary/(a.ovr||1))-(b.salary/(b.ovr||1)))[0].salary}M` : "No candidates"}</DashCard>
      <DashCard title="LINEUP COMPARISON" accent={team.color}>{myDrivers.length > 0 && sorted[0] ? `${sorted[0].ovr - Math.min(...myDrivers.map(d=>d.ovr)) >= 0 ? "+" : ""}${sorted[0].ovr - Math.min(...myDrivers.map(d=>d.ovr))} vs weaker current driver` : "Sign drivers to unlock comparison"}</DashCard>
    </div>
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", maxWidth: 850, borderCollapse: "collapse" }}>
      <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["DRIVER", "SERIES", "AGE", "OVR", "POTENTIAL", "PACE", "CON", "WET", "COST", ""].map(h => (<th key={h} style={{ textAlign: "left", padding: "7px 8px", fontSize: 8, color: DIM, letterSpacing: 2, fontWeight: 600 }}>{h}</th>))}</tr></thead>
      <tbody>{sorted.map(p => {
        const seriesCol = p.series === "F2" ? { bg: "rgba(59,130,246,0.3)", fg: "#60A5FA" } : p.series === "IndyCar" ? { bg: "rgba(239,68,68,0.3)", fg: "#F87171" } : p.series === "Free Agent" ? { bg: "rgba(255,255,255,0.15)", fg: "#fff" } : { bg: "rgba(34,197,94,0.3)", fg: "#4ADE80" };
        return (<tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
        <td style={{ padding: "9px 8px", color: "#fff", fontWeight: 700 }}><DriverLink driver={p} onOpen={openDriverCard} color="#fff" /></td>
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

function GridTab({ drivers, driverPoints, team, season, teamCars, teamCarProfiles, openDriverCard }) {
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
          {teamCarProfiles?.[t.id] && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
            {["aero", "power", "grip", "tyreWear", "reliability"].map(k => <div key={k} style={{ fontSize: 8, color: DIM2 }}>{k.toUpperCase().replace("TYREWEAR", "TYRE")} <span style={{ color: TEXT2 }}>{teamCarProfiles[t.id][k]}</span></div>)}
          </div>}
          {td.map(d => (<div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span style={{ color: mine ? "#fff" : TEXT2 }}><DriverLink driver={d} onOpen={openDriverCard} color={mine ? "#fff" : TEXT2} /></span><div style={{ display: "flex", gap: 12 }}><span style={{ fontSize: 10, color: DIM }}>OVR {d.ovr}</span><span style={{ fontSize: 10, color: "#E2B53A", fontWeight: 700 }}>{driverPoints[d.id] || 0} pts</span></div></div>))}
        </div>);
      })}
    </div>
  </div>);
}


function ProfilesTab({ drivers, teams, team, driverPoints, constructorPoints, season, driverSeasonStats, driverCareer, teamSeasonStats, teamHistory, teamCars }) {
  const [mode, setMode] = useState("drivers");
  const activeDrivers = drivers.filter(d => d.teamId);
  const [selectedDriverId, setSelectedDriverId] = useState(activeDrivers[0]?.id || null);
  const [selectedTeamId, setSelectedTeamId] = useState(team.id);

  const dSeason = driverSeasonStats || {};
  const dCareer = driverCareer || {};
  const tSeason = teamSeasonStats || {};
  const tHistory = teamHistory || {};

  const selectedDriver = activeDrivers.find(d => d.id === selectedDriverId) || activeDrivers[0];
  const selectedTeam = teams.find(t => t.id === selectedTeamId) || team;
  const selectedTeamDrivers = drivers.filter(d => d.teamId === selectedTeam?.id);

  return (
    <div>
      <Sec>PROFILES</Sec>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          { id: "drivers", label: "DRIVER PROFILE" },
          { id: "teams", label: "TEAM PROFILE" },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: "5px 14px", background: mode === m.id ? "rgba(0,0,0,0.15)" : "transparent", border: `1px solid ${mode === m.id ? BORDER2 : BORDER}`, color: mode === m.id ? "#fff" : DIM, cursor: "pointer", fontSize: 10, fontFamily: "inherit", letterSpacing: 1, fontWeight: mode === m.id ? 700 : 400 }}>{m.label}</button>
        ))}
      </div>

      {mode === "drivers" && selectedDriver && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", maxWidth: 900 }}>
            {activeDrivers.map(d => (
              <button key={d.id} onClick={() => setSelectedDriverId(d.id)} style={{ padding: "5px 10px", background: selectedDriver.id === d.id ? `${(teams.find(t => t.id === d.teamId)?.color || BLUE)}33` : "transparent", border: `1px solid ${selectedDriver.id === d.id ? (teams.find(t => t.id === d.teamId)?.color || BORDER2) : BORDER}`, color: selectedDriver.id === d.id ? "#fff" : TEXT2, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>{d.name}</button>
            ))}
          </div>
          <div style={{ background: BG3, border: `1px solid ${BORDER}`, padding: 16, maxWidth: 900 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif" }}>{selectedDriver.name}</div>
                <div style={{ fontSize: 10, color: DIM }}>Age {selectedDriver.age} · {(teams.find(t => t.id === selectedDriver.teamId)?.name) || "Free Agent"}</div>
                <div style={{ fontSize: 10, color: DIM2, marginTop: 3 }}>Contract: {selectedDriver.contractEnd || "Free Agent"} · Years remaining: {selectedDriver.contractEnd ? Math.max(0, selectedDriver.contractEnd - season) : 0} · Salary: ${selectedDriver.salary}M</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 2 }}>OVR</div>
                <div style={{ fontSize: 28, color: "#E2B53A", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{selectedDriver.ovr}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 360, gap: 12, marginBottom: 14 }}>
              {[['PACE', selectedDriver.pace], ['CONSISTENCY', selectedDriver.consistency], ['WET', selectedDriver.wet]].map(([l, v]) => <div key={l}><div style={{ fontSize: 8, color: DIM, letterSpacing: 1, marginBottom: 3 }}>{l}</div>{dots(v)}</div>)}
            </div>
            <Sec>CURRENT SEASON</Sec>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(90px, 1fr))", gap: 8, marginBottom: 14 }}>
              {(() => { const st = dSeason[selectedDriver.id] || blankSeasonStats(); return [
                ["POINTS", driverPoints[selectedDriver.id] || st.points, "#E2B53A"],
                ["WINS", st.wins, "#4ADE80"],
                ["PODIUMS", st.podiums, BLUE],
                ["POLES", st.poles, "#C084FC"],
                ["AVG FIN", avgFinish(st), "#fff"],
                ["DNFS", st.dnfs, "#F87171"],
              ].map(([l,v,c]) => <div key={l} style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "10px 12px" }}><div style={{ fontSize: 8, color: DIM, letterSpacing: 2 }}>{l}</div><div style={{ fontSize: 20, color: c, fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{v}</div></div>); })()}
            </div>
            <Sec>CAREER TOTALS</Sec>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(90px, 1fr))", gap: 8, marginBottom: 14 }}>
              {(() => { const c = dCareer[selectedDriver.id]?.total || blankSeasonStats(); return [
                ["POINTS", c.points, "#E2B53A"], ["WINS", c.wins, "#4ADE80"], ["PODIUMS", c.podiums, BLUE], ["POLES", c.poles, "#C084FC"], ["AVG FIN", avgFinish(c), "#fff"], ["DNFS", c.dnfs, "#F87171"],
              ].map(([l,v,col]) => <div key={l} style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "10px 12px" }}><div style={{ fontSize: 8, color: DIM, letterSpacing: 2 }}>{l}</div><div style={{ fontSize: 20, color: col, fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{v}</div></div>); })()}
            </div>
            <div>
              <div style={{ fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 6 }}>CAREER BY SEASON</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["SEASON", "PTS", "W", "POD", "POLE", "AVG", "DNF"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {((dCareer[selectedDriver.id]?.seasons || []).length > 0 ? [...(dCareer[selectedDriver.id]?.seasons || [])].reverse() : [{ season, ...(dSeason[selectedDriver.id] || blankSeasonStats()), live: true }]).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "8px", color: row.live ? BLUE : "#fff", fontWeight: 700 }}>{row.season}{row.live ? "*" : ""}</td>
                      <td style={{ padding: "8px", color: "#E2B53A", fontWeight: 700 }}>{row.points}</td>
                      <td style={{ padding: "8px", color: "#4ADE80" }}>{row.wins}</td>
                      <td style={{ padding: "8px", color: BLUE }}>{row.podiums}</td>
                      <td style={{ padding: "8px", color: "#C084FC" }}>{row.poles}</td>
                      <td style={{ padding: "8px", color: TEXT2 }}>{avgFinish(row)}</td>
                      <td style={{ padding: "8px", color: "#F87171" }}>{row.dnfs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 9, color: DIM3, marginTop: 6 }}>* current in-progress season</div>
            </div>
          </div>
        </div>
      )}

      {mode === "teams" && selectedTeam && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", maxWidth: 900 }}>
            {teams.map(t => (<button key={t.id} onClick={() => setSelectedTeamId(t.id)} style={{ padding: "5px 10px", background: selectedTeam.id === t.id ? `${t.color}33` : "transparent", border: `1px solid ${selectedTeam.id === t.id ? t.color : BORDER}`, color: selectedTeam.id === t.id ? "#fff" : TEXT2, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>{t.name}</button>))}
          </div>
          <div style={{ background: BG3, border: `1px solid ${BORDER}`, padding: 16, maxWidth: 900 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><TeamBadge teamId={selectedTeam.id} size={24} /><span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Arial Black', sans-serif" }}>{selectedTeam.name}</span></div><div style={{ fontSize: 10, color: DIM }}>Engine: {selectedTeam.engine}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 9, color: DIM, letterSpacing: 2 }}>CAR RATING</div><div style={{ fontSize: 28, color: "#E2B53A", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{teamCars?.[selectedTeam.id] ?? selectedTeam.car}</div></div>
            </div>
            <Sec>CURRENT DRIVERS</Sec>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {selectedTeamDrivers.map(d => <div key={d.id} style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "10px 12px" }}><div style={{ fontWeight: 700, color: "#fff" }}>{d.name}</div><div style={{ fontSize: 10, color: DIM }}>OVR {d.ovr} · {driverPoints[d.id] || 0} pts</div></div>)}
            </div>
            <Sec>CURRENT SEASON</Sec>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(100px, 1fr))", gap: 8, marginBottom: 14 }}>
              {(() => {
                const st = tSeason[selectedTeam.id] || blankSeasonStats();
                const pos = buildConstructorStandings(constructorPoints).findIndex(row => row.team?.id === selectedTeam.id) + 1;
                return [
                  ["POSITION", pos || "—", "#fff"],
                  ["POINTS", constructorPoints[selectedTeam.id] || st.points, "#E2B53A"],
                  ["WINS", st.wins, "#4ADE80"],
                  ["PODIUMS", st.podiums, BLUE],
                ].map(([l,v,c]) => <div key={l} style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "10px 12px" }}><div style={{ fontSize: 8, color: DIM, letterSpacing: 2 }}>{l}</div><div style={{ fontSize: 20, color: c, fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{v}</div></div>);
              })()}
            </div>
            <Sec>TEAM HISTORY BY SEASON</Sec>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["SEASON", "WCC", "PTS", "W", "POD", "POLE", "AVG FIN", "DNF"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2 }}>{h}</th>)}</tr></thead>
              <tbody>
                {((tHistory[selectedTeam.id]?.seasons || []).length > 0 ? [...(tHistory[selectedTeam.id]?.seasons || [])].reverse() : [{ season, ...(tSeason[selectedTeam.id] || blankSeasonStats()), position: "—", live: true }]).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "8px", color: row.live ? BLUE : "#fff", fontWeight: 700 }}>{row.season}{row.live ? "*" : ""}</td>
                    <td style={{ padding: "8px", color: TEXT2 }}>P{row.position || "—"}</td>
                    <td style={{ padding: "8px", color: "#E2B53A", fontWeight: 700 }}>{row.points}</td>
                    <td style={{ padding: "8px", color: "#4ADE80" }}>{row.wins}</td>
                    <td style={{ padding: "8px", color: BLUE }}>{row.podiums}</td>
                    <td style={{ padding: "8px", color: "#C084FC" }}>{row.poles}</td>
                    <td style={{ padding: "8px", color: TEXT2 }}>{avgFinish(row)}</td>
                    <td style={{ padding: "8px", color: "#F87171" }}>{row.dnfs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 9, color: DIM3, marginTop: 6 }}>* current in-progress season</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractsTab({ drivers, season, team, driverPoints, openDriverCard }) {
  const freeAgents = drivers.filter(d => d.teamId === null).sort((a, b) => b.ovr - a.ovr);
  const contracted = drivers.filter(d => d.teamId !== null).sort((a, b) => (a.contractEnd || 0) - (b.contractEnd || 0));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 980 }}>
      <div>
        <Sec>CONTRACT STATUS</Sec>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["DRIVER", "TEAM", "END", "YRS", "SAL"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2 }}>{h}</th>)}</tr></thead>
          <tbody>
            {contracted.map(d => {
              const t = TEAMS.find(x => x.id === d.teamId);
              const yrs = d.contractEnd ? Math.max(0, d.contractEnd - season) : 0;
              const danger = yrs <= 1;
              const mine = d.teamId === team.id;
              return <tr key={d.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}1f` : "transparent" }}>
                <td style={{ padding: "8px", color: mine ? "#fff" : TEXT, fontWeight: mine ? 700 : 500 }}><DriverLink driver={d} onOpen={openDriverCard} color={mine ? "#fff" : TEXT} weight={mine ? 700 : 500} /></td>
                <td style={{ padding: "8px", color: TEXT2, fontSize: 11 }}>{t?.name}</td>
                <td style={{ padding: "8px", color: danger ? "#F87171" : "#4ADE80", fontWeight: 700 }}>{d.contractEnd}</td>
                <td style={{ padding: "8px", color: danger ? "#F87171" : DIM }}>{yrs}</td>
                <td style={{ padding: "8px", color: "#E2B53A" }}>${d.salary}M</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <div>
        <Sec>FREE AGENTS</Sec>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${BORDER2}` }}>{["DRIVER", "AGE", "OVR", "LAST PTS", "ASKING"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 8, color: DIM, letterSpacing: 2 }}>{h}</th>)}</tr></thead>
          <tbody>
            {freeAgents.length === 0 ? <tr><td style={{ padding: "12px 8px", color: DIM, fontSize: 11 }} colSpan={5}>No free agents currently.</td></tr> : freeAgents.map(d => <tr key={d.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <td style={{ padding: "8px", color: "#fff", fontWeight: 700 }}><DriverLink driver={d} onOpen={openDriverCard} color="#fff" /></td>
              <td style={{ padding: "8px", color: DIM }}>{d.age}</td>
              <td style={{ padding: "8px", color: "#E2B53A", fontWeight: 700 }}>{d.ovr}</td>
              <td style={{ padding: "8px", color: TEXT2 }}>{driverPoints[d.id] || 0}</td>
              <td style={{ padding: "8px", color: "#E2B53A" }}>${d.salary}M</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StandingsTab({ driverStandings, constructorStandings, team, openDriverCard }) {
  if (driverStandings.length === 0) return <div style={{ color: DIM, padding: 40, textAlign: "center" }}>Complete a race first.</div>;
  const myTeam = constructorStandings.find(s => s.team?.id === team.id);
  const myPos = constructorStandings.findIndex(s => s.team?.id === team.id) + 1;
  const leadPts = constructorStandings[0]?.pts || 0;
  const gap = leadPts - (myTeam?.pts || 0);
  return (<div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: 8, maxWidth: 980, marginBottom: 14 }}>
      <DashCard title="YOUR POSITION" accent={team.color}>P{myPos || "—"}</DashCard>
      <DashCard title="POINTS" accent="#E2B53A">{myTeam?.pts || 0}</DashCard>
      <DashCard title="GAP TO LEADER" accent="#F87171">{gap > 0 ? `-${gap}` : "Level / Leading"}</DashCard>
      <DashCard title="RIVAL TEAM" accent="#60A5FA">{constructorStandings[Math.max(0, myPos - 2)]?.team?.name || "TBD"}</DashCard>
      <DashCard title="FORM NOTE" accent="#4ADE80">{myPos <= 3 ? "Title fight active" : myPos <= 6 ? "Strong midfield battle" : "Recovery phase"}</DashCard>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 980 }}>
    <div><Sec>DRIVERS'</Sec><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
      {driverStandings.map((s, i) => { const mine = s.driver?.teamId === team.id; return (<tr key={s.driver?.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent" }}><td style={{ padding: "6px 8px", color: i < 3 ? BLUE : DIM, fontWeight: 700, width: 28 }}>{i + 1}</td><td style={{ padding: "6px 8px" }}><DriverLink driver={s.driver} onOpen={openDriverCard} color={mine ? "#fff" : TEXT} weight={mine ? 800 : 500} /> <TeamBadge teamId={s.driver?.teamId} size={12} /></td><td style={{ padding: "6px 8px", textAlign: "right", color: "#E2B53A", fontWeight: 700 }}>{s.pts}</td></tr>); })}
    </tbody></table></div>
    <div><Sec>CONSTRUCTORS'</Sec><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
      {constructorStandings.map((s, i) => { const mine = s.team?.id === team.id; return (<tr key={s.team?.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent" }}><td style={{ padding: "6px 8px", color: i < 3 ? BLUE : DIM, fontWeight: 700, width: 28 }}>{i + 1}</td><td style={{ padding: "6px 8px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><TeamBadge teamId={s.team?.id} size={16} /><span style={{ color: mine ? "#fff" : TEXT, fontWeight: mine ? 800 : 400 }}>{s.team?.name}</span></span></td><td style={{ padding: "6px 8px", textAlign: "right", color: "#E2B53A", fontWeight: 700 }}>{s.pts}</td></tr>); })}
    </tbody></table></div>
  </div></div>);
}


function HistoryTab({ history, rivalry }) {
  const h = history || {};
  return (
    <div>
      <Sec>ALL-TIME RECORDS</Sec>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 900, marginBottom: 24 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(130px, 1fr))", gap: 8, maxWidth: 900, marginBottom: 24 }}>
        <DashCard title="BEST WCC FINISH" accent="#E2B53A">{h.seasons?.length ? `P${Math.min(...h.seasons.map(s => s.wccPos || 99))}` : "—"}</DashCard>
        <DashCard title="AVERAGE SEASON PTS" accent="#60A5FA">{h.seasons?.length ? Math.round(h.seasons.reduce((acc, s) => acc + (s.wccPts || 0), 0) / h.seasons.length) : 0}</DashCard>
        <DashCard title="SAVE MILESTONE" accent="#4ADE80">{h.totalRaces >= 100 ? "100+ races completed" : `${h.totalRaces || 0} races logged`}</DashCard>
        <DashCard title="HIGHLIGHT" accent="#C084FC">{h.seasons?.length ? `${h.seasons[h.seasons.length - 1].year} campaign complete` : "Run first season to unlock"}</DashCard>
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
