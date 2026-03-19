import { useState, useEffect, useRef } from "react";
import TeamBadge from "./components/TeamBadge";
import { TEAMS, F1_DRIVERS, RACES_2026, POINTS } from "./data/gameData";
import { BG, BG2, BG3, BORDER, BORDER2, DIM, DIM2, DIM3, TEXT, TEXT2, GOLD, BLUE, BLUE2, CAT_COLORS } from "./styles/theme";
import {
  pick,
  maybe,
  surname,
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
const blankSeasonStats = () => ({ points: 0, wins: 0, podiums: 0, poles: 0, races: 0, finishes: 0, sumFinish: 0, dnfs: 0 });
const avgFinish = (st) => (st.finishes > 0 ? (st.sumFinish / st.finishes).toFixed(2) : "—");
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
    Object.entries(driverSeason).forEach(([id, stat]) => {
      const prevCareer = driverCareer[id] || { total: blankSeasonStats(), seasons: [] };
      const total = { ...prevCareer.total };
      total.points += stat.points;
      total.wins += stat.wins;
      total.podiums += stat.podiums;
      total.poles += stat.poles;
      total.races += stat.races;
      total.finishes += stat.finishes;
      total.sumFinish += stat.sumFinish;
      total.dnfs += stat.dnfs;
      const seasons = [...(prevCareer.seasons || []), { season, ...stat }];
      driverCareer[id] = { total, seasons };
      driverSeason[id] = blankSeasonStats();
    });

    Object.entries(teamSeason).forEach(([id, stat]) => {
      const standingsPos = Object.entries(constructorPoints).map(([tid, pts]) => ({ tid, pts })).sort((a, b) => b.pts - a.pts).findIndex(row => row.tid === id) + 1;
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
  const { team, drivers, prospects, budget, season, raceIndex, raceResults, driverPoints, constructorPoints, tab, weekendPhase, qualiResults, raceResult, qualiWeather, revealCount, raceRevealCount, news, modifiers, unreadNews, teamCars, history, rivalry, driverSeasonStats, driverCareer, teamSeasonStats, teamHistory } = game;
  const myDrivers = drivers.filter(d => d.teamId === team.id);
  const allActive = drivers.filter(d => d.teamId !== null);
  const currentRace = RACES_2026[raceIndex];


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
            const profileUpdates = updateProfileStats(p, rr, ndp, ncp, p.season, isLast);
            return { ...p, driverPoints: ndp, constructorPoints: ncp, weekendPhase: "race_done", raceResults: [...p.raceResults, rr], news: [...allNew, ...p.news], budget: effects.budget, modifiers: ticked, teamCars: regChange.teamCars, history: finalisedHist, rivalry: newRivalry, driverSeasonStats: profileUpdates.driverSeason, driverCareer: profileUpdates.driverCareer, teamSeasonStats: profileUpdates.teamSeason, teamHistory: profileUpdates.teamHistory };
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

      // Process drivers: age them, handle OVR growth/decline
      const agedDrivers = p.drivers.map(d => {
        const newAge = d.age + 1;
        let ovrChange = 0;
        if (newAge <= 23) ovrChange = Math.floor(Math.random() * 3) + 1;
        else if (newAge <= 27) ovrChange = Math.floor(Math.random() * 2);
        else if (newAge >= 36) ovrChange = -(Math.floor(Math.random() * 3) + 1);
        else if (newAge >= 33) ovrChange = -Math.floor(Math.random() * 2);
        const newOvr = Math.max(55, Math.min(99, d.ovr + ovrChange));
        return { ...d, age: newAge, ovr: newOvr };
      });

      // Contracts tick down each year; expired contracts become free agents for market phase
      const expiringByTeam = {};
      const processedDrivers = agedDrivers.map(d => {
        const contractExpired = d.contractEnd && d.contractEnd <= p.season;
        if (contractExpired && d.teamId) {
          if (!expiringByTeam[d.teamId]) expiringByTeam[d.teamId] = [];
          expiringByTeam[d.teamId].push(d.id);
        }
        return contractExpired ? { ...d, teamId: null, contractEnd: null } : d;
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
      const aiResult = aiTransfers(processedDrivers, allProspects, team.id, newSeason, transitionNews, p.driverPoints, p.constructorPoints, newTeamCars, expiringByTeam);
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
    { id: "profiles", label: "PROFILES", icon: "📁" },
    { id: "contracts", label: "CONTRACTS", icon: "📜" },
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
          {tab === "profiles" && <ProfilesTab {...{ drivers, teams: TEAMS, team, driverPoints, constructorPoints, season, driverSeasonStats, driverCareer, teamSeasonStats, teamHistory, teamCars }} />}
          {tab === "contracts" && <ContractsTab {...{ drivers, season, team, driverPoints }} />}
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
              {fastestLap && <div style={{ marginBottom: 8, fontSize: 10, letterSpacing: 2, color: "#C084FC", fontWeight: 700 }}>⚡ FASTEST LAP: {fastestLap.name}</div>}
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
                      {d.name}
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
                const pos = Object.entries(constructorPoints).sort((a,b)=>b[1]-a[1]).findIndex(([id]) => id === selectedTeam.id) + 1;
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

function ContractsTab({ drivers, season, team, driverPoints }) {
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
                <td style={{ padding: "8px", color: mine ? "#fff" : TEXT, fontWeight: mine ? 700 : 500 }}>{d.name}</td>
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
              <td style={{ padding: "8px", color: "#fff", fontWeight: 700 }}>{d.name}</td>
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

function StandingsTab({ driverStandings, constructorStandings, team }) {
  if (driverStandings.length === 0) return <div style={{ color: DIM, padding: 40, textAlign: "center" }}>Complete a race first.</div>;
  return (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 880 }}>
    <div><Sec>DRIVERS'</Sec><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
      {driverStandings.map((s, i) => { const mine = s.driver?.teamId === team.id; return (<tr key={s.driver?.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent" }}><td style={{ padding: "6px 8px", color: i < 3 ? BLUE : DIM, fontWeight: 700, width: 28 }}>{i + 1}</td><td style={{ padding: "6px 8px" }}><span style={{ color: mine ? "#fff" : TEXT, fontWeight: mine ? 800 : 400 }}>{s.driver?.name}</span> <TeamBadge teamId={s.driver?.teamId} size={12} /></td><td style={{ padding: "6px 8px", textAlign: "right", color: "#E2B53A", fontWeight: 700 }}>{s.pts}</td></tr>); })}
    </tbody></table></div>
    <div><Sec>CONSTRUCTORS'</Sec><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
      {constructorStandings.map((s, i) => { const mine = s.team?.id === team.id; return (<tr key={s.team?.id} style={{ borderBottom: `1px solid ${BORDER}`, background: mine ? `${team.color}25` : "transparent" }}><td style={{ padding: "6px 8px", color: i < 3 ? BLUE : DIM, fontWeight: 700, width: 28 }}>{i + 1}</td><td style={{ padding: "6px 8px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><TeamBadge teamId={s.team?.id} size={16} /><span style={{ color: mine ? "#fff" : TEXT, fontWeight: mine ? 800 : 400 }}>{s.team?.name}</span></span></td><td style={{ padding: "6px 8px", textAlign: "right", color: "#E2B53A", fontWeight: 700 }}>{s.pts}</td></tr>); })}
    </tbody></table></div>
  </div>);
}


function HistoryTab({ history, rivalry }) {
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
