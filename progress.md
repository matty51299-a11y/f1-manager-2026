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
### v0.1.0
- Initial setup
- Added baseline race sim loop, scouting, standings, and seasonal flow
- Added profile/contracts views and early contract-market logic
