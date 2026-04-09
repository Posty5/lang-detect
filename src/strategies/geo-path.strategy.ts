import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from geo code in URL path, mapped via geoToLang.
 * Example: `/us/trends` → US → `en`, `/eg/news` → EG → `ar`
 */
export class GeoPathStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.GEO_PATH;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    const segments = context.path.split("/").filter(Boolean);
    const segment = segments[config.pathSegmentIndex];
    if (!segment) return null;

    const geoCode = segment.toUpperCase();
    const lang = config.geoToLang[geoCode];

    if (lang && config.supportedLanguages.includes(lang)) {
      return lang;
    }

    return null;
  }
}
