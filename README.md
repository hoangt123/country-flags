# Flag Quest 🌍

A Duolingo-style study app for memorising all 197 flags of the world (193 UN members plus Vatican City, Palestine, Kosovo and Taiwan).

## Features

- **Practice mode** – flip cards. The front shows the flag and a locator map with the country outlined in red and its neighbours named. Answer by multiple choice (keys `1`–`4`) or by typing the name, then the card flips to the capital, population, languages, currency, area, borders, a description of the flag with a memory hook, and a fun fact.
- **Spaced repetition** – a Leitner system (10 min → 1 day → 3 days → 1 week → 3 weeks) schedules reviews. Missed flags come back later in the same session until you get them.
- **Card selection** – sessions start with everything due for review, then fill by weighted lottery: flags you keep missing carry weight 10, new flags 4, mastered flags 1, and anything overdue is tripled. In practice a mastered flag shows up roughly 7× less often than a shaky one.
- **Smart distractors** – multiple-choice options deliberately include look-alike flags (Chad/Romania, Australia/New Zealand, Nordic crosses, Pan-Arab colours…) and same-region countries. There are 40+ curated look-alike drills.
- **Test mode** – 25, 50, 100 or all 197 flags with no hints or retries. The goal is **100 correct** in one sitting; results, time and misses are saved and you can jump straight into practising the ones you missed.
- **Progress** – mastery of every flag, day streak, XP, test-score history against the goal line, mastery by region, a 12-week activity heatmap, trouble flags, and a colour-coded grid of all flags.
- **Saving** – every answer is saved instantly in the browser (`localStorage`, with persistent storage requested). In Chrome/Edge you can additionally pick a local file (e.g. `flag-quest-progress.json`) that the app auto-saves to after every answer and reloads from on the next visit; any browser can download/import a JSON backup. Imports merge rather than overwrite, so nothing is lost.
- **Learn** – browse and search every flag with its map and facts, filter by region or look-alike set.
- Works on phone and desktop, light and dark mode, optional sound effects.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview
```

## Deploy

The included GitHub Actions workflow builds and publishes to GitHub Pages on every push to the default branch. In the repo settings choose **Pages → Source: GitHub Actions** once.

## Data sources

- Country facts (names, capitals, languages, borders, coordinates): [mledoze/countries](https://github.com/mledoze/countries)
- Population: Wikidata (latest dated estimate per country; a few rounded by hand)
- Flags: [flag-icons](https://github.com/lipis/flag-icons)
- Map shapes: [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth 1:50m)
- Flag notes and fun facts: written by hand in `src/data/facts.ts` — corrections welcome.
