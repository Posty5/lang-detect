import { ILangDetectConfig } from "../interfaces/config.interface";
import { detectLanguage, resolveConfig } from "../core/detector";
import { createExpressContext } from "../adapters/express.adapter";

/**
 * Express middleware for language detection.
 *
 * Sets `res.locals['lang']` and `res.locals['isRTL']`.
 * Optionally persists the detected language in a cookie.
 *
 * @param config - Optional configuration. Pass `userLangResolver` to extract user language from request.
 *
 * @example
 * // Basic usage:
 * app.use(langDetectMiddleware());
 *
 * @example
 * // With custom config:
 * app.use(langDetectMiddleware({
 *   supportedLanguages: ['en', 'ar', 'fr'],
 *   stages: [DetectionStage.COOKIE, DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT],
 *   cookieKeys: ['user_lang', 'lang'],
 * }));
 *
 * @example
 * // With logged-in user language from auth middleware:
 * app.use(langDetectMiddleware({
 *   userLangResolver: (req, res) => res.locals.loggedUserInfo?.languageCode,
 * }));
 */
export function langDetectMiddleware(
  config?: ILangDetectConfig & {
    /**
     * Function to extract the logged-in user's language preference from the request.
     * Called for each request to populate `context.userLang`.
     * Return `null` or `undefined` if no user language is available.
     */
    userLangResolver?: (req: any, res: any) => string | null | undefined;
  },
) {
  const resolvedConfig = resolveConfig(config);
  const userLangResolver = config?.userLangResolver;

  return async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userLang = userLangResolver ? (userLangResolver(req, res) ?? null) : null;
      const context = createExpressContext(req, { userLang });
      const result = await detectLanguage(context, config);

      res.locals["lang"] = result.lang;
      res.locals["isRTL"] = result.isRTL;
      res.locals["langDetectedBy"] = result.detectedBy;

      // Persist detected language in cookie
      if (resolvedConfig.setCookie && result.lang !== req.cookies?.["lang"]) {
        if (typeof res.cookie === "function") {
          res.cookie("lang", result.lang, {
            maxAge: resolvedConfig.cookieOptions.maxAge,
            httpOnly: resolvedConfig.cookieOptions.httpOnly,
            sameSite: resolvedConfig.cookieOptions.sameSite,
            secure: resolvedConfig.cookieOptions.secure,
            path: resolvedConfig.cookieOptions.path,
          });
        }
      }

      next();
    } catch {
      // On error, fall back to default language
      res.locals["lang"] = resolvedConfig.defaultLanguage;
      res.locals["isRTL"] = false;
      next();
    }
  };
}
