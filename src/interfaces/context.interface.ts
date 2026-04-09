/**
 * Environment-agnostic detection context.
 * Adapters (Express, browser) populate this from their respective environments.
 */
export interface IDetectionContext {
  /** URL path, e.g. `/en/page` or `/us/trends/all` */
  path: string;

  /** Query string parameters as key-value pairs */
  queryParams: Record<string, string>;

  /** Cookies as key-value pairs */
  cookies: Record<string, string>;

  /** HTTP headers (lowercase keys). On browser, this is typically empty. */
  headers: Record<string, string>;

  /**
   * The logged-in user's preferred language code.
   * Set this from your user record (DB/session on server, decoded JWT in browser).
   * Used by USER_LANG stage.
   */
  userLang?: string | null;

  /** Client IP address. Used by VISITOR_GEO stage. `null` in browser contexts. */
  ip?: string | null;

  /**
   * Browser's preferred languages from `navigator.languages`.
   * Used by ACCEPT_LANGUAGE stage in browser contexts.
   * On server, the Accept-Language header is used instead.
   */
  navigatorLanguages?: string[];
}
