# Deployment Guide — Google Sheets Lead Capture

## Overview

Replace the broken `/api/leads/public` endpoint with a Google Sheets + Google Apps Script backend. All form submissions are stored in a Google Sheet you control.

---

## Step 1 — Create the Sheet

1. Go to [sheets.new](https://sheets.new)
2. Rename the sheet to `DMZ Panamá Leads`
3. Rename Sheet1 to `Leads`
4. Enter the header row in row 1:

   | A | B | C | D | E | F | G | H | I |
   |---|---|---|---|---|---|---|---|---|
   | `timestamp` | `name` | `company` | `station` | `phone` | `email` | `locations` | `lead_score` | `priority` |

5. **Bold the header row** (select row 1 → Ctrl+B)

---

## Step 2 — Create the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**
2. Delete the default `function myFunction() {}` code
3. Paste the entire contents of `apps-script.js`
4. Click the **Save** icon (or Ctrl+S)
5. Name the project: `DMZ Lead Capture`

---

## Step 3 — Deploy the Web App

1. Click **Deploy → New Deployment**
2. Click the gear icon ⚙ → **Web app**
3. Configure:

   | Setting | Value |
   |---|---|
   | **Description** | `DMZ Lead Capture v1` |
   | **Execute as** | `Me` (your Google account) |
   | **Who has access** | `Anyone` |

4. Click **Deploy**
5. Click **Review Permissions** → choose your Google account → click **Advanced** (if needed) → **Go to DMZ Lead Capture (unsafe)** → **Allow**
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfyc.../exec
   ```

---

## Step 4 — Update the Site

1. Open `app.js`
2. Find this line at the top:

   ```js
   const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
   ```

3. Replace `YOUR_WEB_APP_URL_HERE` with the URL you copied in Step 3
4. Save the file

---

## Step 5 — Test

1. Open `index.html` in a browser (or your live GitHub Pages URL)
2. Fill out the assessment form and submit
3. Check the Sheet:
   - A new row should appear with the submitted data
   - Timestamp should show the submission time in UTC

---

## Troubleshooting

### CORS / "Network Error" in console

Apps Script Web Apps don't support CORS in the traditional sense. The `fetch` call uses `no-cors` mode automatically. If submissions fail:

1. Open the Apps Script project
2. Click **Deploy → Manage Deployments**
3. Ensure the latest version is **active**
4. Re-deploy if needed

### 404 errors

Make sure the URL in `APPS_SCRIPT_URL` ends with `/exec` (not `/dev`).

### Permission errors

If you see "Authorization is required":

1. Run the `doGet` function manually in the Apps Script editor (select it and click Run)
2. Accept the permissions
3. Re-deploy

### Form shows error but data exists

Check the Apps Script editor: **View → Logs** for error details.

---

## Security Notes

- The endpoint accepts submissions from **anyone with the URL** (configured as `Anyone`). Treat the Sheet as a public-facing inbox.
- Google Apps Script quotas apply: ~20 simultaneous executions, ~6 min execution time per trigger, ~100 MB daily data transfer for consumer accounts. These limits are sufficient for lead volumes under ~5,000/day.
- To block spam, add reCAPTCHA in a future iteration.

---

## Updating the Script

1. Open the Apps Script project from **Extensions → Apps Script** in the Sheet
2. Edit the code
3. Click **Deploy → Manage Deployments**
4. Click the edit pencil ✏ next to the active deployment
5. Select the latest version
6. Click **Deploy**

The URL stays the same — no need to update `app.js`.
