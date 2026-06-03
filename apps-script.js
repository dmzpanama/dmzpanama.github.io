/**
 * DMZ Panamá — Lead Capture (Google Apps Script)
 *
 * Deployment:
 *   1. Create a Google Sheet with header row:
 *      timestamp | name | company | station | phone | email | locations | lead_score | priority
 *   2. Extensions → Apps Script → paste this code
 *   3. Deploy → New Deployment → Web App
 *      - Execute as: Me
 *      - Access: Anyone
 *   4. Copy the Web App URL into app.js as APPS_SCRIPT_URL
 */

const SHEET_NAME = 'Leads';

/**
 * Lead scoring rules (based on locations selected in the form):
 *   1 location   →  5 points   → Low
 *   2–5 locations → 15 points  → Medium
 *   6–10 locations → 30 points → High
 *   10+ locations  → 50 points → High
 */
function calculateScore(locations) {
  const LOCATION_SCORES = {
    '1': 5,
    '2-3': 15,
    '4-6': 30,
    '7-10': 30,
    '10+': 50,
  };
  return LOCATION_SCORES[locations] || 0;
}

function determinePriority(score) {
  if (score >= 30) return 'High';
  if (score === 15) return 'Medium';
  return 'Low';
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);

  try {
    const sheet = getSheet_();
    const data = parsePayload_(e);
    const errors = validate_(data);

    if (errors.length > 0) {
      return jsonResponse_(400, { success: false, errors });
    }

    const lead_score = calculateScore(data.locations);
    const priority = determinePriority(lead_score);

    const row = [
      new Date().toISOString(),
      data.name,
      data.company || '',
      data.station,
      data.phone,
      data.email,
      data.locations,
      lead_score,
      priority,
    ];

    sheet.appendRow(row);

    return jsonResponse_(200, { success: true, lead_score, priority });
  } catch (err) {
    console.error('doPost error:', err.message);
    return jsonResponse_(500, { success: false, errors: ['Error interno del servidor. Intente de nuevo.'] });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_(200, { status: 'ok', message: 'DMZ Panamá Lead Capture endpoint is running.' });
}

/* ─── helpers ─────────────────────────────────────────────── */

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp', 'name', 'company', 'station', 'phone', 'email', 'locations', 'lead_score', 'priority']);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

function parsePayload_(e) {
  let body;
  if (e && e.postData && e.postData.contents) {
    body = JSON.parse(e.postData.contents);
  } else if (e && e.parameter) {
    body = e.parameter;
  } else {
    body = {};
  }
  return {
    name: String(body.name || '').trim(),
    company: String(body.company || '').trim(),
    station: String(body.station || '').trim(),
    phone: String(body.phone || '').trim(),
    email: String(body.email || '').trim(),
    locations: String(body.locations || '').trim(),
  };
}

function validate_(data) {
  const errors = [];

  if (!data.name) errors.push('El nombre es obligatorio');
  if (!data.station) errors.push('La estación de servicio es obligatoria');
  if (!data.phone) errors.push('El teléfono es obligatorio');
  if (!data.email) errors.push('El correo electrónico es obligatorio');
  if (!data.locations) errors.push('El número de ubicaciones es obligatorio');

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Correo electrónico inválido');
  }

  if (data.phone) {
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 7) errors.push('El teléfono debe tener al menos 7 dígitos');
  }

  return errors;
}

function jsonResponse_(statusCode, payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
