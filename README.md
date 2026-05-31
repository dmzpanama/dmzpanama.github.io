# Cloud Sync DMZ — Landing Page

## Local
Visit http://localhost:3000/site/ (full API support: gallery + lead form)

## Deploy to GitHub Pages (free)

1. Create a repo on GitHub
2. Push the `dmz-site/` folder as the root of that repo
3. Go to Settings → Pages → deploy from main branch /root
4. Update WhatsApp number in `index.html`: replace `507XXXXXXXX` with your number
5. Done

**Note:** On GitHub Pages the API endpoints won't work (no backend). The form falls back to WhatsApp-only. For API support, deploy the full server to Render.com or Railway.app.
