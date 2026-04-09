import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionStrategy } from "../interfaces/strategy.interface";
import { PathLangStrategy } from "./path-lang.strategy";
import { QueryLangStrategy } from "./query-lang.strategy";
import { GeoPathStrategy } from "./geo-path.strategy";
import { GeoQueryStrategy } from "./geo-query.strategy";
import { CookieStrategy } from "./cookie.strategy";
import { UserLangStrategy } from "./user-lang.strategy";
import { VisitorGeoStrategy } from "./visitor-geo.strategy";
import { AcceptLanguageStrategy } from "./accept-language.strategy";
import { DefaultLangStrategy } from "./default-lang.strategy";

/** Strategy registry: maps each stage to a singleton strategy instance */
const strategyMap = new Map<DetectionStage, IDetectionStrategy>([
  [DetectionStage.PATH_LANG, new PathLangStrategy()],
  [DetectionStage.QUERY_LANG, new QueryLangStrategy()],
  [DetectionStage.GEO_PATH, new GeoPathStrategy()],
  [DetectionStage.GEO_QUERY, new GeoQueryStrategy()],
  [DetectionStage.COOKIE, new CookieStrategy()],
  [DetectionStage.USER_LANG, new UserLangStrategy()],
  [DetectionStage.VISITOR_GEO, new VisitorGeoStrategy()],
  [DetectionStage.ACCEPT_LANGUAGE, new AcceptLanguageStrategy()],
  [DetectionStage.DEFAULT, new DefaultLangStrategy()],
]);

/**
 * Get the strategy instance for a given detection stage.
 */
export function getStrategy(stage: DetectionStage): IDetectionStrategy {
  const strategy = strategyMap.get(stage);
  if (!strategy) {
    throw new Error(`Unknown detection stage: ${stage}`);
  }
  return strategy;
}

export { PathLangStrategy } from "./path-lang.strategy";
export { QueryLangStrategy } from "./query-lang.strategy";
export { GeoPathStrategy } from "./geo-path.strategy";
export { GeoQueryStrategy } from "./geo-query.strategy";
export { CookieStrategy } from "./cookie.strategy";
export { UserLangStrategy } from "./user-lang.strategy";
export { VisitorGeoStrategy } from "./visitor-geo.strategy";
export { AcceptLanguageStrategy } from "./accept-language.strategy";
export { DefaultLangStrategy } from "./default-lang.strategy";
