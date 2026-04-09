/**
 * Detection stages for language detection.
 * Each stage represents a strategy that can detect the user's language.
 * Stages are executed in priority order — first match wins.
 */
export enum DetectionStage {
  /** Detect language from URL path segment: `/en/page` → `en` */
  PATH_LANG = "PATH_LANG",

  /** Detect language from query string: `?lang=ar` */
  QUERY_LANG = "QUERY_LANG",

  /** Detect geo from URL path segment, map to language: `/us/page` → `en` */
  GEO_PATH = "GEO_PATH",

  /** Detect geo from query string, map to language: `?locale=eg` → `ar` */
  GEO_QUERY = "GEO_QUERY",

  /** Detect language from cookie */
  COOKIE = "COOKIE",

  /**
   * Use the logged-in user's saved language preference.
   * Works in both server and browser — developer provides `context.userLang`
   * (e.g. from DB on server, or decoded JWT token in browser).
   */
  USER_LANG = "USER_LANG",

  /** Detect language from visitor's IP → country → language mapping */
  VISITOR_GEO = "VISITOR_GEO",

  /** Detect language from Accept-Language header (server) or navigator.languages (browser) */
  ACCEPT_LANGUAGE = "ACCEPT_LANGUAGE",

  /** Fallback to default language */
  DEFAULT = "DEFAULT",
}
