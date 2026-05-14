// Build and download an .ics (iCalendar) file the user's device can open
// to add an event to whatever calendar they use (Apple, Google, Outlook).

function pad(n) {
  return String(n).padStart(2, "0");
}

// Format Date → "YYYYMMDDTHHMMSS" (floating local time per iCal spec)
function toIcsLocal(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}`;
}

function escapeText(s = "") {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// event = { title, description, location, startsAt: Date, durationMinutes }
function buildIcs({ title, description, location, startsAt, durationMinutes = 60 }) {
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const uid = `${start.getTime()}-trainedbyj@local`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TrainedByJ//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsLocal(new Date())}`,
    `DTSTART:${toIcsLocal(start)}`,
    `DTEND:${toIcsLocal(end)}`,
    `SUMMARY:${escapeText(title)}`,
    location ? `LOCATION:${escapeText(location)}` : null,
    description ? `DESCRIPTION:${escapeText(description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function addToCalendar(event) {
  const ics = buildIcs(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(event.title || "session").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Google Calendar quick-add URL (alternative — opens in a new tab pre-filled).
function fmtGcalDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export function googleCalendarUrl({ title, description, location, startsAt, durationMinutes = 60 }) {
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "",
    dates: `${fmtGcalDate(start)}/${fmtGcalDate(end)}`,
    details: description || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
