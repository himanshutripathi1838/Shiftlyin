/**
 * Google Analytics 4 (GA4) & GTM Integration for Shiftlyin
 */

let isInitialized = false;

/**
 * Initializes GA4 and GTM scripts dynamically if Measurement ID is provided in ENV.
 */
export function initAnalytics() {
  if (isInitialized || typeof window === "undefined") return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const gtmId = import.meta.env.VITE_GTM_ID;

  if (gaId && gaId.trim() !== "" && !window.gtag) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", gaId, { send_page_view: false }); // Handled manually on route changes
  }

  if (gtmId && gtmId.trim() !== "") {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", gtmId);
  }

  isInitialized = true;
}

/**
 * Tracks a page view event in GA4.
 * @param {string} path - Page path (e.g. '/help', '/services/part-time-jobs')
 * @param {string} title - Page title
 */
export function trackPageView(path, title) {
  if (typeof window === "undefined" || !window.gtag) return;
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId) return;

  window.gtag("config", gaId, {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Sends a custom conversion event to GA4.
 * @param {string} eventName
 * @param {Object} params
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

/**
 * Pre-defined tracking helper functions for Shiftlyin user actions.
 */
export const AnalyticsEvents = {
  studentRegistered: (method = "email") =>
    trackEvent("student_registration", { method, role: "student" }),

  businessRegistered: (method = "email") =>
    trackEvent("business_registration", { method, role: "business" }),

  userLoggedIn: (role = "student") =>
    trackEvent("login_success", { role }),

  jobApplied: (jobId, jobTitle, company) =>
    trackEvent("job_application_submitted", { job_id: jobId, job_title: jobTitle, company }),

  ctaClicked: (ctaName, location) =>
    trackEvent("cta_click", { cta_name: ctaName, cta_location: location }),

  contactSubmitted: (reason) =>
    trackEvent("contact_form_submitted", { contact_reason: reason }),

  serviceViewed: (serviceSlug, serviceName) =>
    trackEvent("service_page_viewed", { service_slug: serviceSlug, service_name: serviceName }),
};
