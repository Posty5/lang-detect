import { DetectionStage } from "../enums/detection-stage.enum";
import { ILangDetectConfig } from "../interfaces/config.interface";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionResult } from "../interfaces/result.interface";
import { IResolvedConfig } from "../interfaces/strategy.interface";
import { getStrategy } from "../strategies";
import { DEFAULT_SUPPORTED_LANGUAGES } from "../data/supported-languages";
import { DEFAULT_GEO_TO_LANG } from "../data/geo-to-lang";
import { RTL_LANGUAGES } from "../data/rtl-languages";

/** Default stage execution order */
const DEFAULT_STAGES: DetectionStage[] = [
  DetectionStage.PATH_LANG,
  DetectionStage.QUERY_LANG,
  DetectionStage.GEO_PATH,
  DetectionStage.GEO_QUERY,
  DetectionStage.COOKIE,
  DetectionStage.USER_LANG,
  DetectionStage.VISITOR_GEO,
  DetectionStage.ACCEPT_LANGUAGE,
  DetectionStage.DEFAULT,
];

/**
 * Resolve user config with defaults.
 */
export function resolveConfig(config?: ILangDetectConfig): IResolvedConfig {
  let stages = config?.stages ?? DEFAULT_STAGES;

  // Ensure DEFAULT is always the last stage if not explicitly included
  if (!stages.includes(DetectionStage.DEFAULT)) {
    stages = [...stages, DetectionStage.DEFAULT];
  }

  return {
    supportedLanguages: config?.supportedLanguages ?? DEFAULT_SUPPORTED_LANGUAGES,
    stages,
    geoToLang: config?.geoToLang ?? DEFAULT_GEO_TO_LANG,
    cookieKeys: config?.cookieKeys ?? ["lang"],
    queryLangKeys: config?.queryLangKeys ?? ["lang", "language", "langCode", "languageCode"],
    geoQueryKeys: config?.geoQueryKeys ?? ["locale", "culture", "region", "country"],
    defaultLanguage: config?.defaultLanguage ?? "en",
    geoDetector: config?.geoDetector ?? null,
    pathSegmentIndex: config?.pathSegmentIndex ?? 0,
    setCookie: config?.setCookie ?? true,
    cookieOptions: {
      maxAge: config?.cookieOptions?.maxAge ?? 365 * 24 * 60 * 60 * 1000,
      httpOnly: config?.cookieOptions?.httpOnly ?? false,
      sameSite: config?.cookieOptions?.sameSite ?? "lax",
      secure: config?.cookieOptions?.secure ?? false,
      path: config?.cookieOptions?.path ?? "/",
    },
  };
}

/**
 * Detect the user's language based on the provided context and configuration.
 *
 * Iterates through the configured detection stages in order.
 * The first stage that returns a non-null result wins.
 *
 * @param context - Environment-agnostic detection context
 * @param config - Optional configuration (defaults are applied)
 * @returns Detection result with language code, source stage, and RTL flag
 *
 * @example
 * // Server (Express)
 * const context = createExpressContext(req);
 * const result = await detectLanguage(context, { supportedLanguages: ['en', 'ar', 'fr'] });
 *
 * @example
 * // Browser
 * const context = createBrowserContext({ userLang: decodedJwt.lang });
 * const result = await detectLanguage(context);
 *
 * @example
 * // Custom priority — only cookie then default
 * const result = await detectLanguage(context, {
 *   stages: [DetectionStage.COOKIE, DetectionStage.DEFAULT],
 * });
 */
export async function detectLanguage(context: IDetectionContext, config?: ILangDetectConfig): Promise<IDetectionResult> {
  const resolved = resolveConfig(config);

  for (const stage of resolved.stages) {
    const strategy = getStrategy(stage);
    const lang = await strategy.detect(context, resolved);

    if (lang) {
      return {
        lang,
        detectedBy: stage,
        isRTL: RTL_LANGUAGES.includes(lang),
      };
    }
  }

  // Should not reach here since DEFAULT stage always returns a value,
  // but just in case:
  return {
    lang: resolved.defaultLanguage,
    detectedBy: DetectionStage.DEFAULT,
    isRTL: RTL_LANGUAGES.includes(resolved.defaultLanguage),
  };
}
