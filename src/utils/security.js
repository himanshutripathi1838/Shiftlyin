/**
 * Security & Bot Protection Utility for Shiftlyin
 */

// Simple client-side rate limiting store
const attemptStore = new Map();

/**
 * Checks if an action is allowed based on rate limits.
 * @param {string} key - Identifier for the action (e.g. 'login_attempt', 'contact_submit')
 * @param {number} maxAttempts - Max allowed attempts in time window
 * @param {number} windowMs - Time window in milliseconds (default 1 minute)
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const record = attemptStore.get(key) || { count: 0, firstAttempt: now };

  // Reset window if expired
  if (now - record.firstAttempt > windowMs) {
    record.count = 1;
    record.firstAttempt = now;
    attemptStore.set(key, record);
    return { allowed: true, remaining: maxAttempts - 1, resetMs: windowMs };
  }

  if (record.count >= maxAttempts) {
    const resetMs = windowMs - (now - record.firstAttempt);
    return { allowed: false, remaining: 0, resetMs };
  }

  record.count += 1;
  attemptStore.set(key, record);
  return { allowed: true, remaining: maxAttempts - record.count, resetMs: windowMs - (now - record.firstAttempt) };
}

/**
 * Checks if a honeypot field was filled by a bot.
 * @param {Object} formData - Form input state object
 * @param {string} honeypotFieldName - Name of the hidden honeypot field (e.g. 'website_hp')
 * @returns {boolean} True if triggered by bot
 */
export function isHoneypotTriggered(formData, honeypotFieldName = "website_hp") {
  if (!formData) return false;
  const value = formData[honeypotFieldName];
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Sanitizes input string to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
