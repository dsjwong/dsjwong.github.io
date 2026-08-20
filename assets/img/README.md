# Images to add

Drop these files in here. Nothing breaks if they are missing — the portrait
hides itself and the favicon just falls back to the browser default — but the
site looks noticeably better with them.

| File            | Size          | Used for                                   |
|-----------------|---------------|--------------------------------------------|
| `portrait.jpg`  | 600×600 sq.   | About section photo                        |
| `favicon.png`   | 512×512 sq.   | Browser tab icon                           |
| `og-cover.png`  | 1200×630      | Link preview on LinkedIn / WhatsApp / X    |

Screenshots of your projects go here too. To put one at the top of a project
card, add this just inside the `<article>` in `index.html`:

```html
<img src="assets/img/project-name.png" alt=""
     class="w-full aspect-video object-cover rounded-lg mb-5">
```

Keep every image under ~300 KB. https://squoosh.app compresses them well.
