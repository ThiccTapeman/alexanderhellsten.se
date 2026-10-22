// Keep analytics optional: a blocked tracker must never interrupt an action.
export function trackEvent(name, metadata = {}) {
  if (typeof window === "undefined" ||
      !["alexanderhellsten.se", "www.alexanderhellsten.se"].includes(window.location.hostname) ||
      /^\/admin(?:\/|$)/.test(window.location.pathname)) return;
  try {
    window.sa_event = window.sa_event || function (...args) {
      (window.sa_event.q = window.sa_event.q || []).push(args);
    };
    window.sa_event(name, { page: window.location.pathname, ...metadata });
  } catch {
    // Analytics is best effort.
  }
}
