import { IDetectionContext } from "../interfaces/context.interface";

/**
 * Options for creating a browser detection context.
 */
export interface IBrowserContextOptions {
  /** Logged-in user's preferred language (e.g. from decoded JWT token) */
  userLang?: string | null;

  /**
   * Client IP address for geo-based detection.
   * In browsers, IP is not available natively — pass it here if you fetched it
   * from an external service (e.g. `https://api.ipify.org`, your own backend, etc.).
   * When provided, the VISITOR_GEO stage will be able to run.
   */
  ip?: string | null;
}

/**
 * Create a detection context from the browser environment.
 *
 * Reads `window.location`, `document.cookie`, and `navigator.languages`.
 * IP is not available natively in browsers, but you can pass it via `options.ip`
 * if you fetched it from an external service. When provided, the VISITOR_GEO
 * stage will use it for geo-based language detection.
 *
 * @example
 * // Basic usage:
 * const context = createBrowserContext();
 * const result = await detectLanguage(context);
 *
 * @example
 * // With IP from an external service:
 * const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip);
 * const context = createBrowserContext({ ip });
 * const result = await detectLanguage(context);
 */
export function createBrowserContext(options?: IBrowserContextOptions): IDetectionContext {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const queryParams: Record<string, string> = {};
  const cookies: Record<string, string> = {};

  // Parse URL search params
  if (typeof window !== "undefined" && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
  }

  // Parse document.cookie
  if (typeof document !== "undefined" && document.cookie) {
    document.cookie.split(";").forEach((pair) => {
      const [key, ...rest] = pair.split("=");
      const trimmedKey = key.trim();
      if (trimmedKey) {
        cookies[trimmedKey] = decodeURIComponent(rest.join("=").trim());
      }
    });
  }

  // Navigator languages
  const navigatorLanguages = typeof navigator !== "undefined" && navigator.languages ? Array.from(navigator.languages) : [];

  return {
    path,
    queryParams,
    cookies,
    headers: {},
    userLang: options?.userLang ?? null,
    ip: options?.ip ?? null,
    navigatorLanguages,
  };
}
