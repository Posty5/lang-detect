// Enums
export { DetectionStage } from "./enums";

// Core
export { detectLanguage, resolveConfig } from "./core";

// Interfaces
export type { ILangDetectConfig, ICookieOptions, IDetectionContext, IDetectionResult, IDetectionStrategy, IResolvedConfig } from "./interfaces";

// Adapters
export { createExpressContext, createBrowserContext } from "./adapters";
export type { IExpressContextOptions, IBrowserContextOptions } from "./adapters";

// Middleware
export { langDetectMiddleware } from "./middleware";

// Strategies (for advanced use / customization)
export {
  PathLangStrategy,
  QueryLangStrategy,
  GeoPathStrategy,
  GeoQueryStrategy,
  CookieStrategy,
  UserLangStrategy,
  VisitorGeoStrategy,
  AcceptLanguageStrategy,
  DefaultLangStrategy,
  getStrategy,
} from "./strategies";

// Data / defaults
export { DEFAULT_SUPPORTED_LANGUAGES } from "./data/supported-languages";
export { DEFAULT_GEO_TO_LANG } from "./data/geo-to-lang";
export { RTL_LANGUAGES } from "./data/rtl-languages";
