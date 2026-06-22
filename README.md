# Thynks — Alternate Site

Static marketing site for Thynks (digital marketing, design & AI agency, Weston FL). Plain HTML/CSS/JS — no build step. Open `index.html` in a browser to preview.

## Structure

```
thynks-alternate/
├── index.html                 # Home
├── capabilities/              # Discipline pages
│   ├── identity.html          # Brand & Identity (Design & Branding)
│   ├── interactive.html       # Web & Dev
│   ├── advertising.html       # Media
│   ├── content.html           # Content & Social
│   ├── automation.html        # Workflows
│   └── ai-search.html         # AI Search
├── services/                  # Service hubs & detail pages
│   ├── index.html             # Services overview
│   ├── marketing.html
│   ├── ai-automation.html
│   ├── ppc.html
│   ├── social-media.html
│   ├── email-automation.html
│   └── reputation-management.html
├── industries/                # Industry pages
│   ├── index.html             # Industries overview
│   ├── healthcare.html
│   ├── restaurants.html
│   ├── home-services.html
│   └── ecommerce.html
├── work/                      # Case studies
│   └── *.html
├── assets/
│   ├── css/thynks.css         # Single shared stylesheet
│   ├── js/thynks.js           # GSAP-driven interactions
│   ├── img/                   # webp/jpg/png/svg
│   └── video/                 # mp4 background videos
└── thynks_com_reboot_copy_master.md   # Working copy doc (reference, not a page)
```

## Design system notes

- Dark/light sections via `data-section-theme`; theme toggle in nav.
- Headings use `display-xl/lg/md` with `data-split`; eyebrows use `.label`.
- Scroll reveals via `data-reveal` / `data-reveal-group` (GSAP ScrollTrigger).
- Lightbulb / circuit / "current" motif throughout; gold is the accent, used sparingly.
- Reusable components: `.checklist`, `.process`, `.current-card` (cards), `.xlinks`, `.faq`, `.page-hero`.

## Preview locally

Just open `index.html`, or serve the folder:

```
python -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- Proof placeholders (real client metrics, testimonials, screenshots) are not yet filled in — flagged in the copy master as needed before launch.
- New pages are generated to match the existing design system exactly; nav and footer share one information architecture across all pages.
