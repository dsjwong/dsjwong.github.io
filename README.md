# darrenwongsj.dev

Personal site. Static HTML, no build step, no `npm install`, **no runtime dependencies**.
Deployed to GitHub Pages. About 19 KB gzipped in total.

```
darrenwongsj.dev/
├── index.html        ← 95% of your edits happen here
├── css/layout.css    ← grid, spacing, breakpoints (Tailwind class names, precompiled)
├── css/styles.css    ← the palette, type, rows, buttons, animations
├── js/main.js        ← theme toggle, mobile menu, scroll reveal (leave alone)
├── 404.html
├── CNAME             ← the custom domain. Do not delete.
├── .nojekyll         ← stops GitHub ignoring files starting with _
└── assets/
    ├── resume.pdf    ← 🚧 you need to add this
    └── img/          ← 🚧 portrait, favicon, social card
```

---

## Preview it locally

```bash
cd ~/GitHub/darrenwongsj.dev
python3 serve.py          # then open http://localhost:8000
```

Use `serve.py`, **not** `python3 -m http.server`. The only difference is that it
sends no-cache headers. Without them the browser keeps serving you an old copy
of `styles.css` and it looks like your edits did nothing — which is exactly what
happened the first time this site was previewed.

If you ever do see a stale page: hard-refresh with <kbd>⌘⇧R</kbd>, and bump the
`?v=6` on the stylesheet link in `index.html` when you make a big CSS change.

### Checking it at other screen sizes

Open DevTools (<kbd>⌘⌥I</kbd>) and click the device-toolbar icon, or just drag
the window narrower. The three widths worth checking are **390px** (phone),
**768px** (tablet) and **1440px** (laptop).

---

## What to edit, in the order that matters

Open `index.html` and search for **`🚧`** — that marks everything still outstanding.
`✏️` marks things you *may* want to change but that are fine as they are.

### 1. Things that are wrong until you fix them

| Where | What |
|---|---|
| Contact section | The email is `you@example.com`. **Fix this first.** |
| Contact section | LinkedIn URL says `YOUR-HANDLE` |
| `<head>` | Page title and meta description — these are your Google result |
| Hero | Graduation date, location |
| Education | Degree start year |
| Experience | The entire section is placeholder text |

### 2. Files you need to supply

- `assets/resume.pdf` — or delete the Résumé button
- `assets/img/portrait.jpg` — or delete the photo block in About
- `assets/img/favicon.png`, `assets/img/og-cover.png` — optional, but the social
  card is what people see when you paste the link into a chat

### 3. Content worth rewriting in your own words

The About paragraphs and the project descriptions are written as a starting
point. They are accurate — the tech stacks were read out of the repos and the
metrics came from the evaluation outputs — but the *voice* is not yours yet.

---

## Adding a project

Projects are a hairline-separated **list of rows**, not a grid of boxes. At the
bottom of the list there is a blank row with `hidden` on it.

1. Copy the whole `<article> … </article>` block.
2. Paste it above the template.
3. Delete `hidden` from the copy, and fix the row number.
4. Fill it in.

Four rules that decide whether a row helps you:

1. **Lead with the result, not the stack.** "93.4% accuracy across 12 classes" says
   more than "used PyTorch and a ViT".
2. **Only claim numbers you can point at.** If someone opens the repo the figure
   should be findable. This matters more than it sounds like it does.
3. **Three to five entries.** More reads as a list; fewer reads as thin.
4. **Every link must work.** A dead GitHub link is worse than no link.

Experience, Skills and Education use the same `.row` pattern, so adding an entry
anywhere on the page works the same way.


---

## Changing how it looks

| Want to change | Where |
|---|---|
| **Accent colour** | `css/styles.css` — `--accent` and `--accent-2`, at the very top. Three alternative palettes are listed in the comment above them. |
| Background / text tones | `css/styles.css` — `--paper`, `--ink`, `--body`, `--line` |
| Dark mode colours | `css/styles.css` — the `.dark { }` block |
| Roundness | `css/styles.css` — `--radius` |
| Row hover effect | `css/styles.css` section 8 — delete the `.row:hover` rules for a static list |
| Fade-in on scroll | `css/styles.css` section 9 — or remove `data-reveal` from an element |
| Icons | any `<i data-lucide="name">`; browse names at <https://lucide.dev/icons> |

The layout classes in `index.html` (`grid`, `gap-6`, `lg:col-span-7` …) use
**Tailwind's names and Tailwind's values**, but they are written out in
`css/layout.css` rather than generated at runtime by the Tailwind library. Any
Tailwind documentation still describes what they do:
<https://tailwindcss.com/docs>. `lg:` means "on large screens and wider", so
`lg:col-span-7` is full width on a phone and seven of twelve columns on a laptop.

**The catch:** only the classes actually in `css/layout.css` exist. Adding a new
one to the HTML does nothing until you add it to that file — which is one line,
and the file explains the scale (1 unit = 0.25rem).

The trade for that small inconvenience: the page went from **182 KB of
libraries to 19 KB total**, renders with no flash of unstyled content, and needs
no JavaScript for any of its content.

---

## Deploying

The DNS for `darrenwongsj.dev` already points at GitHub Pages (A records to
`185.199.108–111.153`, AAAA records, and `www` as a CNAME). What is left:

```bash
cd ~/GitHub/darrenwongsj.dev
git init && git add -A
git commit -m "Personal site"
git branch -M main

# Create the repo on GitHub, then:
git remote add origin git@github.com:<USERNAME>/<REPO>.git
git push -u origin main
```

Then in the repo on GitHub: **Settings → Pages**

- Source: `Deploy from a branch`, branch `main`, folder `/ (root)`
- Custom domain: `darrenwongsj.dev`
- Tick **Enforce HTTPS** once the certificate finishes provisioning (a few minutes)

Two workable repo names:

- **`<username>.github.io`** — the account's "user site". Also serves at that
  address as a backup URL. Only one per account.
- **`personal-website`** — an ordinary repo with Pages turned on. Works exactly
  the same for the custom domain, and does not tie the site to a username.

`.dev` is on the HSTS preload list, so browsers refuse plain HTTP for it.
The site simply will not load until GitHub has issued the certificate — that is
expected, not a fault. Give it up to an hour.

After every push, GitHub Pages takes ~30 seconds to rebuild. Hard-refresh
(<kbd>⌘⇧R</kbd>) if you still see the old version.

---

## Testing

```bash
./test/run.sh            # 1440, 800 and 500 px
./test/run.sh 1440       # one width
```

Drives the real page in headless Chrome and asserts 46 things: every anchor and
asset resolves, no duplicate ids, the theme toggle flips and persists, the
mobile menu opens/closes/responds to Escape and reports `aria-expanded`, the
copy button is wired, nothing overflows horizontally, no dead component CSS,
heading levels never skip, every link and button has an accessible name, and
the small-text colours meet WCAG AA contrast.

Run it after any edit. It catches the two mistakes that are easiest to make
here: adding a class that does not exist in `layout.css`, and column spans in
one grid that do not add up to 12.

**One known-flaky assertion:** `scroll spy marks the current section`.
IntersectionObserver does not reliably re-evaluate after a programmatic scroll
in headless Chrome, which has no compositor. The feature works — confirm by
scrolling in a real browser and watching the nav underline follow you.

---

## How the responsive layout works

There are only four mechanisms, and every professional site uses the same ones.

**1. A container with a max-width.** `.wrap` in `styles.css`:

```css
.wrap {
  width: 100%;
  max-width: 76rem;                          /* stop growing past 1216px */
  margin-inline: auto;                       /* centre the leftover space */
  padding-inline: clamp(1.25rem, 5vw, 3rem); /* 20px on a phone, 48px on a desktop */
}
```

This is the single most important rule on the site. Below 1216px the container
is the full width of the screen minus its padding; above it, the container stops
growing and the extra space becomes margin. That is why the site does not stretch
into unreadable full-width lines on a large monitor.

**2. `clamp()` for anything that should scale.** `clamp(min, preferred, max)` —
the browser uses the middle value but never goes outside the outer two:

```css
.hero-name { font-size: clamp(3rem, 10vw, 7.5rem); }
.section   { padding-block: clamp(3.5rem, 9vw, 7rem); }
```

Your name is 10% of the viewport width, but never smaller than 48px or larger
than 120px. No breakpoints, no media queries, smooth at every size in between.

**3. A 12-column grid that collapses.** Sections use `lg:grid-cols-12`, meaning
the grid only exists at 1024px and above. Below that, every child is a normal
block and stacks vertically. That is the whole mobile layout — there is no
separate mobile version.

Column spans within one grid must add up to 12. `lg:col-span-2` for the section
label plus `lg:col-span-10` for the content. If they sum to 13 the last item
wraps onto its own line, which is a bug that is easy to introduce and easy to miss.

**4. One breakpoint for show/hide.** 768px, in the `.only-desktop` /
`.only-mobile` rules. Below it the nav is a hamburger; above it the links show
inline.

The order matters: **write the mobile layout first as the default**, then add
`lg:` rules for the desktop arrangement. Designing for desktop and patching
mobile afterwards is how sites end up with horizontal scrollbars on phones.

## Things worth knowing

- Keep this folder **out of `~/Documents` and `~/Desktop`** — both are iCloud-synced,
  and iCloud evicting file contents is what corrupted a batch of repos in August 2026.
- **Never type the two characters that close an HTML comment inside another comment.**
  Doing so ends the comment early and dumps the rest of it onto the page as visible
  text — and if that happens above `<meta charset>`, accented characters break too.
- Tailwind handles layout only (grid, spacing, breakpoints). Every colour, font and
  border comes from `css/styles.css`, so there is one place to change the look.
- **Icons are inline `<svg>`**, not a library. To add one, copy the paths from
  <https://lucide.dev/icons> into an `<svg>` matching those already in the markup.
- The only external request is **Google Fonts**. Everything else is served from
  this repo.
- `assets/img/favicon.png` and `assets/img/og-cover.png` were generated from HTML
  templates rendered with headless Chrome. Regenerating them means rebuilding
  those templates — easier to just edit the PNGs, or ask for them to be redone.
- Structured data (`application/ld+json` in the `<head>`) tells search engines this
  page is about a person. Keep it in step with the visible content, and validate
  changes at <https://validator.schema.org>.
