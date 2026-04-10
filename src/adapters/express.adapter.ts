import { IDetectionContext } from "../interfaces/context.interface";

/**
 * Options for creating an Express detection context.
 */
export interface IExpressContextOptions {
  /** Logged-in user's preferred language (from DB, JWT, session, etc.) */
  userLang?: string | null;

  /**
   * Override the auto-detected client IP address.
   * By default, IP is extracted from `x-forwarded-for`, `x-real-ip`, or `req.ip`.
   * Pass a custom IP here if you resolve it differently (e.g. from a custom header or external service).
   */
  ip?: string | null;
}

/**
 * Create a detection context from an Express Request object.
 *
 * Extracts path, query params, cookies, headers, and client IP.
 * Pass `userLang` from your auth middleware if available.
 *
 * @example
 * app.use((req, res, next) => {
 *   const userLang = res.locals.loggedUserInfo?.languageCode;
 *   const context = createExpressContext(req, { userLang });
 *   // ...
 * });
 */
export function createExpressContext(
  req: {
    path: string;
    query: Record<string, any>;
    cookies?: Record<string, string>;
    headers: Record<string, string | string[] | undefined>;
    ip?: string;
  },
  options?: IExpressContextOptions,
): IDetectionContext {
  // Flatten query params to string values
  const queryParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === "string") {
      queryParams[key] = value;
    }
  }

  // Flatten headers to string values (lowercase keys)
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers[key.toLowerCase()] = value;
    } else if (Array.isArray(value)) {
      headers[key.toLowerCase()] = value[0];
    }
  }

  // Use custom IP if provided, otherwise extract from common proxy headers
  const ip = options?.ip ?? ((req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || (req.headers["x-real-ip"] as string) || req.ip || null);

  return {
    path: req.path,
    queryParams,
    cookies: req.cookies ?? {},
    headers,
    userLang: options?.userLang ?? null,
    ip,
  };
}
