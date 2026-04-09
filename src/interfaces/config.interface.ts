import { DetectionStage } from "../enums/detection-stage.enum";

/**
 * Cookie options for persisting the detected language.
 */
export interface ICookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
  path?: string;
}

/**
 * Main configuration for the language detector.
 * All fields are optional — sensible defaults are provided.
 */
export interface ILangDetectConfig {
  /**
   * List of supported language codes (ISO 639-1).
   * Only languages in this list will be returned.
   * @default ['ar','en','hi','es','zh','bn','pt','ru','fr','ur','de','it','ja','ko','tr']
   */
  supportedLanguages?: string[];

  /**
   * Ordered list of detection stages to execute.
   * First match wins. Pass a subset to limit detection.
   * If `DEFAULT` is not included, it will be appended automatically.
   * @default [PATH_LANG, QUERY_LANG, GEO_PATH, GEO_QUERY, COOKIE, USER_LANG, VISITOR_GEO, ACCEPT_LANGUAGE, DEFAULT]
   */
  stages?: DetectionStage[];

  /**
   * Map of ISO 3166-1 alpha-2 country codes (uppercase) to language codes.
   * Used by GEO_PATH, GEO_QUERY, and VISITOR_GEO stages.
   * @default Built-in map with ~45 country codes
   */
  geoToLang?: Record<string, string>;

  /**
   * Cookie key(s) to check for stored language preference.
   * Checked in order — first valid match wins.
   * @default ['lang']
   */
  cookieKeys?: string[];

  /**
   * Query string parameter names to check for language code.
   * Used by QUERY_LANG stage. Checked in order.
   * @default ['lang', 'language', 'langCode', 'languageCode']
   */
  queryLangKeys?: string[];

  /**
   * Query string parameter names to check for geo/locale code.
   * Used by GEO_QUERY stage. Checked in order.
   * @default ['locale', 'culture', 'region', 'country']
   */
  geoQueryKeys?: string[];

  /**
   * Default fallback language when no stage detects a language.
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * Custom function to resolve an IP address to an ISO 3166-1 alpha-2 country code.
   * Used by VISITOR_GEO stage. If not provided, the stage tries to use `geoip-country` (peer dep).
   * Return `null` if country cannot be determined.
   */
  geoDetector?: (ip: string) => Promise<string | null> | string | null;

  /**
   * Which path segment index (0-based) to check for language/geo code.
   * @default 0 (first segment after `/`)
   */
  pathSegmentIndex?: number;

  /**
   * Whether the Express middleware should set a cookie with the detected language.
   * @default true
   */
  setCookie?: boolean;

  /**
   * Cookie options for the language cookie set by Express middleware.
   * @default { maxAge: 365*24*60*60*1000, httpOnly: false, sameSite: 'lax' }
   */
  cookieOptions?: ICookieOptions;
}
