import { TEAMS, F1_DRIVERS, PROSPECTS, POINTS, WEATHER_TYPES } from "../data/gameData";

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
  const d1 = drivers[0];
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

function genPreRace(team, drivers, race, round, budget) {
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

function genPostRace(team, drivers, raceResult, round) {
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
function genMidSeasonReg(teamCars, round) {
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

export { makeNews, pick, maybe, surname, genSeasonStart, genPreRace, genPostRace, genSigningNews, genReleaseNews, genSeasonEnd, applyNewsEffects, tickModifiers, getTeamMod, getDriverMod, pickWeather, formatTime, generateQuali, generateRace, aiTransfers, genMidSeasonReg, updateRivalry, updateRivalryPostRace, updateHistory, finaliseSeasonHistory, initGame };
