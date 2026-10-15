/**
 * MI DÍA · Puente con Google Calendar
 * ------------------------------------
 * Pega este archivo en script.google.com (ver GUIA.md) y despliégalo como
 * "Aplicación web". La app lo usa para:
 *   - LEER   cumpleaños y eventos de tu Google Calendar  (GET)
 *   - ESCRIBIR cumpleaños y eventos que crees en la app   (POST)
 *   - BORRAR  lo que borres desde la app                  (POST)
 */

// ====================== CONFIGURACIÓN ======================
const CONFIG = {
  // Clave secreta: invéntate una larga y pon LA MISMA en Ajustes de la app.
  SECRET: 'CAMBIA-ESTA-CLAVE-por-algo-largo-y-raro',

  // Calendario donde viven tus cumpleaños. Si no existe, se crea solo
  // la primera vez que añadas un cumpleaños desde la app.
  BDAY_CALENDAR: 'Cumpleaños',

  // ¿Leer también los cumpleaños de tus Contactos de Google?
  INCLUDE_CONTACTS: true,

  // ¿Buscar cumpleaños en tu calendario principal por el título?
  // (eventos que empiecen por "Cumpleaños de…", "Cumple de…" o lleven 🎂)
  SCAN_MAIN_CALENDAR: true,

  // Cuántos días hacia delante se leen los eventos del calendario principal.
  EVENT_DAYS: 60,

  // Zona horaria de tus eventos.
  TZ: 'Europe/Madrid',
};
// ===========================================================

const CONTACTS_CAL_IDS = [
  'addressbook#contacts@group.v.calendar.google.com',
  '#contacts@group.v.calendar.google.com',
];
const BDAY_RE = /^\s*(🎂\s*)?(cumpleaños|cumpleanos|cumple|birthday)\s*(de|of)?\s*/i;
const TAG = 'midia';

/* ---------------------- Entradas HTTP ---------------------- */

function doGet(e) {
  return guard_(e && e.parameter, p => {
    if ((p.action || 'sync') === 'ping') return { ok: true, user: Session.getActiveUser().getEmail() };
    return { ok: true, bdays: readBirthdays_(), events: readEvents_(), at: new Date().toISOString() };
  });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false, error: 'JSON no válido' }); }
  return guard_(body, b => {
    switch (b.action) {
      case 'addBday':  return { ok: true, gid: addBirthday_(b) };
      case 'addEvent': return { ok: true, gid: addEvent_(b) };
      case 'delete':   return { ok: true, deleted: deleteById_(b.gid) };
      default:         return { ok: false, error: 'Acción desconocida' };
    }
  });
}

function guard_(params, fn) {
  if (!params || params.key !== CONFIG.SECRET) return json_({ ok: false, error: 'Clave incorrecta' });
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    return json_(fn(params));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------- LEER ---------------------------- */

function readBirthdays_() {
  const start = startOfToday_();
  const end = new Date(start.getTime() + 366 * 864e5);
  const out = {};
  const add = (ev, source) => {
    const name = cleanName_(ev.getTitle());
    if (!name) return;
    const d = ev.isAllDayEvent() ? ev.getAllDayStartDate() : ev.getStartTime();
    const md = Utilities.formatDate(d, CONFIG.TZ, 'MM-dd');
    const k = name.toLowerCase() + '|' + md;
    if (out[k]) return;
    const year = (String(ev.getDescription() || '').match(/Nacimiento:\s*(\d{4})/) || [])[1];
    out[k] = {
      gid: seriesId_(ev),
      t: name,
      d: year ? year + '-' + md : md,   // "1990-03-14" o "03-14" si no se sabe el año
      src: source,
      app: ev.getTag(TAG) || null,
    };
  };

  getBdayCalendars_().forEach(c => c.cal.getEvents(start, end).forEach(ev => add(ev, c.src)));

  if (CONFIG.SCAN_MAIN_CALENDAR) {
    CalendarApp.getDefaultCalendar().getEvents(start, end)
      .filter(ev => isBdayTitle_(ev.getTitle()))
      .forEach(ev => add(ev, 'principal'));
  }
  return Object.keys(out).map(k => out[k]);
}

function readEvents_() {
  const start = startOfToday_();
  const end = new Date(start.getTime() + CONFIG.EVENT_DAYS * 864e5);
  return CalendarApp.getDefaultCalendar().getEvents(start, end)
    .filter(ev => !isBdayTitle_(ev.getTitle()))
    .map(ev => {
      const all = ev.isAllDayEvent();
      const s = all ? ev.getAllDayStartDate() : ev.getStartTime();
      return {
        gid: ev.getId(),
        t: ev.getTitle() || '(sin título)',
        d: Utilities.formatDate(s, CONFIG.TZ, 'yyyy-MM-dd'),
        h: all ? '' : Utilities.formatDate(s, CONFIG.TZ, 'HH:mm'),
        app: ev.getTag(TAG) || null,
      };
    });
}

/* ------------------------ ESCRIBIR ------------------------- */

function addBirthday_(b) {
  // b = { t: "Carlos", d: "1990-11-20", id: "<id en la app>" }
  const [y, m, d] = String(b.d).split('-').map(Number);
  const now = startOfToday_();
  let first = new Date(now.getFullYear(), m - 1, d);
  if (first < now) first.setFullYear(first.getFullYear() + 1);
  const cal = getOrCreateBdayCalendar_();
  const series = cal.createAllDayEventSeries(
    '🎂 Cumpleaños de ' + b.t,
    first,
    CalendarApp.newRecurrence().addYearlyRule(),
    { description: y ? 'Nacimiento: ' + y + '\nCreado desde Mi Día' : 'Creado desde Mi Día' }
  );
  if (b.id) series.setTag(TAG, String(b.id));
  return series.getId();
}

function addEvent_(b) {
  // b = { t: "Cena", d: "2026-11-02", h: "21:00", id: "<id en la app>" }
  const cal = CalendarApp.getDefaultCalendar();
  const [y, m, d] = String(b.d).split('-').map(Number);
  let ev;
  if (b.h) {
    const [H, M] = String(b.h).split(':').map(Number);
    const s = new Date(y, m - 1, d, H, M);
    ev = cal.createEvent(b.t, s, new Date(s.getTime() + 60 * 60 * 1000));
  } else {
    ev = cal.createAllDayEvent(b.t, new Date(y, m - 1, d));
  }
  ev.setDescription('Creado desde Mi Día');
  if (b.id) ev.setTag(TAG, String(b.id));
  return ev.getId();
}

function deleteById_(gid) {
  if (!gid) return false;
  const cals = [CalendarApp.getDefaultCalendar()].concat(CalendarApp.getCalendarsByName(CONFIG.BDAY_CALENDAR));
  for (const cal of cals) {
    try { const s = cal.getEventSeriesById(gid); if (s) { s.deleteEventSeries(); return true; } } catch (e) {}
    try { const ev = cal.getEventById(gid); if (ev) { ev.deleteEvent(); return true; } } catch (e) {}
  }
  return false; // p.ej. cumpleaños de Contactos: se borran desde Contactos
}

/* ------------------------ AYUDAS --------------------------- */

function getBdayCalendars_() {
  const list = CalendarApp.getCalendarsByName(CONFIG.BDAY_CALENDAR).map(cal => ({ cal, src: 'calendario' }));
  if (CONFIG.INCLUDE_CONTACTS) {
    for (const id of CONTACTS_CAL_IDS) {
      try { const c = CalendarApp.getCalendarById(id); if (c) { list.push({ cal: c, src: 'contactos' }); break; } } catch (e) {}
    }
  }
  return list;
}

function getOrCreateBdayCalendar_() {
  const found = CalendarApp.getCalendarsByName(CONFIG.BDAY_CALENDAR);
  if (found.length) return found[0];
  return CalendarApp.createCalendar(CONFIG.BDAY_CALENDAR, { color: CalendarApp.Color.YELLOW, timeZone: CONFIG.TZ });
}

function isBdayTitle_(t) { return BDAY_RE.test(t || '') || /🎂/.test(t || ''); }

function cleanName_(t) {
  return String(t || '').replace(BDAY_RE, '').replace(/🎂/g, '').replace(/^[\s:–-]+|[\s:–-]+$/g, '').trim();
}

function seriesId_(ev) {
  try { if (ev.isRecurringEvent()) return ev.getEventSeries().getId(); } catch (e) {}
  return ev.getId();
}

function startOfToday_() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }

/** Ejecuta esto una vez desde el editor para dar permisos y ver qué encuentra. */
function probar() {
  Logger.log('Cumpleaños encontrados: ' + JSON.stringify(readBirthdays_(), null, 1));
  Logger.log('Eventos próximos: ' + JSON.stringify(readEvents_(), null, 1));
}
