import { IDetectionContext } from "../interfaces/context.interface";

/**
 * Options for creating a browser detection context.
 */
export interface IBrowserContextOptions {
  /** Logged-in user's preferred language (e.g. from decoded JWT token) */
  userLang?: string | null;
}

/**
 * Create a detection context from the browser environment.
 *
 * Reads `window.location`, `document.cookie`, and `navigator.languages`.
 * IP is not available in browser — VISITOR_GEO stage will be skipped.
 *
 * @example
 * // In an Angular component or service:
 * const userLang = jwtDecode(token).lang;
 * const context = createBrowserContext({ userLang });
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
    ip: null,
    navigatorLanguages,
  };
}
