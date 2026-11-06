# Redesign notes (branch `redesign`)

Not merged to `main`. Review, edit, then merge when happy. Everything marked `[TBC: ...]` shows as a highlighted note on the page so it cannot be missed.

## What changed

- Hero is now a live split-flap Departures board for HKIA (`js/board.js`). It reads `departures_today.json` (and `departures_tomorrow.json` if fewer than six flights are left) from the HKIA repo on raw.githubusercontent, picks the next six scheduled departures with their P(delay > 15 min), and flaps to them. Six real rows from 5 Nov 2026 sit in the page as the fallback and as the screen-reader table. It refreshes every 5 minutes, ignores data whose newest score is over 6 hours old, and skips animation under `prefers-reduced-motion`.
- Six story pages under `stories/` plus cards on the home page.
- Projects are image cards (webp, 30-55 KB each, lazy-loaded). HKIA live tiles are now one sentence ("Right now: live AUC ...") still driven by `js/hkia-live.js`.
- Experience is one timeline (CarryAI, UNSW, TRM, mentor, peer companion, HKUST). Skills became a four-line toolbox. Old Skills/Education/Leadership sections were folded in.
- Design: Bricolage Grotesque (headings) + Inter (body) + JetBrains Mono (board only); Instrument Serif removed. One accent, signage amber, used as a highlighter behind ink text. Dark mode kept. No eyebrow labels, section numbers or stat blocks.
- Kept: title, description, canonical, OG tags, Person JSON-LD (unchanged), sitemap (6 story URLs added), 404 (restyled). Stories carry BlogPosting JSON-LD linked to the Person.
- `serve.py` is now threaded (the test suite and Chrome open parallel connections). `test/run.sh` runs the suite on `index.html` and every `stories/*.html`.

## Intro options

The live draft is wrapped in `INTRO-TBC start` / `INTRO-TBC end` comments in `index.html` (search for it). Replace its `<p class="intro">`.

**A (in the page now)**
> I build machine-learning systems and then grade them in public. The one I am proudest of predicts delays at Hong Kong's airport, waits for each plane to leave, and marks its own homework: the board is live. Right now I am an AI engineering intern at CarryAI, cutting false alarms from a vision-language safety monitor.

**B (story-led, a little warmer)**
> I like finding out whether I was right. So I built a model that predicts which flights leave Hong Kong late, and then made it publish every guess and score itself afterwards. It tied a table of averages on its first week, and I put that on the page too. I study CS and AI at HKUST and work at CarryAI.

**C (aviation-led, shortest)**
> Planes are the reason I got into machine learning: every departure is a prediction that gets answered a few minutes later. The board above is my delay model's live guesses for Hong Kong. By day I study CS and AI at HKUST and work on vision-language models at CarryAI.

Note: C's first sentence is a claim about your motivation. Use it only if true, or rewrite it.

## Story drafts: review checklist

All six are first-person drafts built only from your notes, repo READMEs and reports. Each page has a removable draft banner (`DRAFT-BANNER` comment). For each: read it, fill or cut every `[TBC]`, then delete the banner.

| Story | File | [TBC] items for you |
|---|---|---|
| The week my model tied a lookup table | `hkia-lost-to-a-lookup-table.html` | How it felt to see the tie on the report card and what you did next. Check "on some days the lookup table ranked flights better" (read off the 20 Aug report-card chart; later days not checked) |
| Why I keep ending up at airports | `why-airports.html` | Origin of the aviation interest; where you grew up and the languages; badminton paragraph (placeholder); whether to keep the languages-and-labelling paragraph. Mostly TBC by design: your notes had few facts here |
| Does the AI forecast the market, or remember it? | `does-the-llm-forecast-or-remember.html` | Confirm the backtester repo is public (the project card links to it; your notes from August said private); why you tried anonymising |
| Six models, twelve pests, one semester in Sydney | `six-models-one-semester.html` | Course, teammates, a Sydney detail; whether the "better data for hard classes" idea was tested or only inferred |
| The retrain that looked worse, and wasn't | `retrain-looked-worse.html` | Your own advice on comparing models across windows; how long it took |
| Teaching a safety camera to stay quiet | `teaching-a-camera-to-stay-quiet.html` | CarryAI-safe: uses only numbers already on your public CV, no client names, sites or footage, no image. Confirm 4/15 vs 14/14 are on comparable frames; confirm the plain-language description of "menu-of-states" is right and fine to share; ask CarryAI if unsure |

Also check: story read times are estimates; dates are omitted on purpose.

## Other [TBC] on the home page

- `CURRENTLY-TBC`: "Currently: building [...], reading [...]" in the hero.
- Hero board fallback rows are a 5 Nov 2026 snapshot; refresh them occasionally (instructions in the HTML comment above the hero).

## Adding a photo later

Nothing is shown until you do this, so there is no empty placeholder.

1. Save a square-ish photo as `assets/img/portrait.webp` (about 800x800, under 100 KB: `cwebp -q 80 -resize 800 800 in.jpg -o assets/img/portrait.webp`).
2. In `index.html`, at the `PHOTO-SLOT` comment in the hero, add:
   ```html
   <img class="portrait" src="assets/img/portrait.webp" width="800" height="800" alt="Darren Wong at ...">
   ```
3. In `css/styles.css`, section 4, add:
   ```css
   .portrait { width: 7.5rem; height: 7.5rem; object-fit: cover; border-radius: 50%; margin-top: 1.5rem; border: 2px solid var(--ink); }
   ```
4. Optionally add the same image to the story pages' author line, and update `og:image`.
5. Run `./test/run.sh` (it checks every image has alt text and that the asset exists).

## Verification (6 Nov 2026)

- `./test/run.sh`: all checks pass at 1440, 800 and 500 px on `index.html` and all six story pages.
- Lighthouse (local, mobile / desktop): home 98 / 100 performance, 100 accessibility, 100 best practices, 100 SEO; a story page 99 / 100, 100, 100, 100. Re-run after any change.
- Screenshots: `REDESIGN-screens/` (git-ignored): `home-*` and `story-*`, desktop (1440) and mobile (360), light and dark. Mobile shots are a 360 px iframe, so media queries respond to 360. The mobile board may be caught mid-flap.
- Font weight: 3 woff2 files, about 120 KB total.

## Go-live checklist

1. Fill or cut every `[TBC]`; delete the draft banners; pick an intro.
2. Confirm the backtester repo visibility.
3. Merge `redesign` into `main`; check https://darrenwongsj.dev, the sitemap, and one story URL.
