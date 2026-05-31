# Cloud Sync DMZ — Public Landing Page

Free static landing page for Cloud Sync DMZ, hosted on GitHub Pages.

## Live Site

https://rodolfocampos2986-art.github.io/dmz-site/

## Update WhatsApp Number

Edit `index.html` — replace all `507XXXXXXXX` with your real number (format: `507` + 8 digits, no spaces/symbols). Then commit and push — Pages auto-deploys.

## Local Development

```
cd bot && node server.js
open http://localhost:3000/site/
```

On localhost the gallery and lead form connect to the backend API. On GitHub Pages they show fallback messages — the site is a pure brochure (WhatsApp button still works).
