export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function isDateTimePast(value, now = Date.now()) {
  const date = toDate(value);
  return Boolean(date && date.getTime() <= now);
}

export function getJobDisplayStatus(job, now = Date.now()) {
  if (isDateTimePast(job?.shiftEndsAt, now)) return "expired";
  return job?.status || "active";
}
