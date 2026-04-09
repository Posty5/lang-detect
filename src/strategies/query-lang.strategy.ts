import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from query string parameters.
 * Checks keys: lang, language, langCode, languageCode (configurable).
 * Example: `?lang=ar` → `ar`
 */
export class QueryLangStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.QUERY_LANG;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    for (const key of config.queryLangKeys) {
      const value = context.queryParams[key];
      if (!value) continue;

      const normalized = value.toLowerCase();
      if (config.supportedLanguages.includes(normalized)) {
        return normalized;
      }
    }

    return null;
  }
}
