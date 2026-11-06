# darrenwongsj.dev

Personal site. Static HTML, no build step, no `npm install`, **no runtime dependencies**.
Deployed to GitHub Pages. 

```
darrenwongsj.dev/
├── index.html        <- home: hero board, stories, work, experience, contact
├── stories/*.html    <- one page per story (copy one to add another)
├── css/layout.css    <- reset and layout utilities (Tailwind-style names)
├── css/styles.css    <- design system, home page
├── css/story.css     <- article layout, story pages only
├── js/main.js        <- theme toggle, mobile menu, reveal, copy button
├── js/board.js       <- the departures board (live HKIA data, fallback in index.html)
├── js/hkia-live.js   <- live AUC numbers in the HKIA project card
├── test/run.sh       <- browser test suite (index.html + every stories/*.html)
├── 404.html, CNAME, .nojekyll, sitemap.xml, robots.txt
└── assets/           <- fonts (3 woff2), img, resume.pdf
```

Static site, no build step, no dependencies. Preview with `python3 serve.py`
(never `python3 -m http.server`; it caches stale CSS). Run `./test/run.sh` before pushing.

Adding a story: copy a file in `stories/`, edit it, add a card in the Stories
section of `index.html` and a `<url>` in `sitemap.xml`.

Content notes for the redesign (intro options, story checklist, how to add a photo) are in REDESIGN-NOTES.md.
