# Project: F1 Manager Sim

## Overview
Browser-based motorsport management sim inspired by Basketball GM.
You run an F1 team across multiple seasons: hire drivers, manage contracts/budget, and chase titles.

## Current Version
- Version: 0.1.0
- Status: In Development

## Core Features (Planned)
- [ ] Driver contracts system
- [ ] Team budgets & finances
- [ ] Race simulation engine
- [ ] Qualifying system
- [ ] Calendar / season structure
- [ ] AI driver transfers & retirements
- [ ] UI dashboard
- [ ] Historical stats tracking

## Implemented Features
- [x] Team selection and season start flow
- [x] Race weekend loop (preview → qualifying → race)
- [x] Driver and constructor points standings
- [x] Scouting + driver signing/release actions
- [x] News feed with dynamic events/effects
- [x] Season transition flow with aging/progression
- [x] Driver profile and team profile views
- [x] Contracts tab with free-agent visibility
- [x] Basic AI contract/transfer market behavior
- [x] Historical records and season history tracking

## In Progress
- [ ] Contract market tuning (better AI decisions for elite teams)
- [ ] Balancing salary/budget impact on roster moves
- [ ] UX polish for profile/contracts readability

## Known Issues / Bugs
- [ ] AI roster logic can still produce occasional unrealistic moves
- [ ] Fastest-lap logic is simplified and not lap-time based
- [ ] Some contract/news flows can feel repetitive across seasons

## Next Priorities
1. Improve AI contract logic to better protect top drivers
2. Add deeper finance system (salary cap pressure / sponsor impacts)
3. Track and display per-season driver performance in contract decisions
4. Add clearer contract renewal flow for player team
5. Add save/load support for long-term careers

## Future Ideas
- [ ] Driver traits/personality affecting consistency and negotiations
- [ ] Staff system (team principal, technical director, head of aero)
- [ ] Car development tree with upgrade packages
- [ ] Driver academies and junior promotions
- [ ] Expanded race strategy layer (tyres, pit timing, weather calls)

## Tech Stack
- Frontend: React + Vite
- State Management: React local state (`useState` / component state)
- Hosting: TBD (likely static host)
- Other tools: ESLint, npm scripts

## Notes
- Keep systems simple first; add realism in layers.
- Prioritize readable UI and fast iteration over deep realism early.
- Update this file at the end of each dev session.

## Change Log
### v0.1.7
- Added large startup talent-pool expansion (~100 total drivers) with explicit F1-ready depth bands to stabilize early-season AI signings.
- Rebalanced retirement safeguards to prevent unrealistic young retirements except extreme edge cases.
- Tuned AI contract renewals and signing standards to improve lineup continuity and reduce sub-standard race-seat churn.

### v0.1.6
- Rebalanced AI re-signing so contract renewals are now a common outcome for fitting/performing drivers, reducing unrealistic yearly churn.
- Removed artificial seat-entry OVR inflation and improved prospect generation toward naturally F1-ready high-end youth.
- Expanded dev diagnostics with lineup continuity, re-sign counts, and lowest OVR among newly signed race-seat drivers.

### v0.1.5
- Introduced centralized `ensureValidTeamRosters` hard validation and emergency fallback to guarantee exactly 2 drivers per team.
- Added roster enforcement checkpoints across qualifying/race flow, offseason transitions, and full dev-season simulations.
- Expanded dev diagnostics with roster invalid/emergency counters to verify long-run roster integrity.

### v0.1.4
- Added stronger top-team downside risk in car evolution (larger elite stall/miss exposure and heavier diminishing returns).
- Increased bounded race variability/attrition and underdog opportunity to reduce zero-point seasons and improve lower-half points access.
- Extended dev summary diagnostics with constructor gap and points-bucket visibility for championship spread tuning.

### v0.1.3
- Replaced hard active-grid 80 OVR clamping with entry-based F1 seat floor behavior.
- Added stronger seat-loss pressure for sub-80 active drivers, including multi-season low-rating penalties in AI retention.
- Expanded grid-quality debug metrics (active <80, tier buckets, average grid OVR) for long-save balancing.

### v0.1.2
- Raised active-grid driver quality floor so race starters remain F1-level while preserving tier separation.
- Tuned offseason/star progression pressure to reduce sticky long-term dominance at very high ratings.
- Increased quality of elite young prospect generation and added clearer dev summary metrics for active-grid quality checks.

### v0.1.1
- Added long-save balancing updates for elite-driver plateau/decline and top-end rating compression.
- Improved generated-driver uniqueness and stronger top-tier prospect emergence.
- Rebalanced race/quali car-vs-driver weighting so strong cars matter more over a season.
- Added more aggressive AI lineup upgrades for teams with competitive cars.
- Expanded dev sim summary diagnostics (top OVR distribution, team mismatch checks, zero-point teams, constructor order).

### v0.1.0
- Initial setup
- Added baseline race sim loop, scouting, standings, and seasonal flow
- Added profile/contracts views and early contract-market logic
