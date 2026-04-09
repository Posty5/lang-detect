import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from geo/locale query string parameters, mapped via geoToLang.
 * Checks keys: locale, culture, region, country (configurable).
 * Example: `?locale=eg` → EG → `ar`
 */
export class GeoQueryStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.GEO_QUERY;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    for (const key of config.geoQueryKeys) {
      const value = context.queryParams[key];
      if (!value) continue;

      const geoCode = value.toUpperCase();
      const lang = config.geoToLang[geoCode];

      if (lang && config.supportedLanguages.includes(lang)) {
        return lang;
      }
    }

    return null;
  }
}
