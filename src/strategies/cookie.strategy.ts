import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from cookie value.
 * Checks configurable cookie key(s) in order.
 * Example: Cookie `lang=fr` → `fr`
 */
export class CookieStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.COOKIE;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    for (const key of config.cookieKeys) {
      const value = context.cookies[key];
      if (!value) continue;

      const normalized = value.toLowerCase();
      if (config.supportedLanguages.includes(normalized)) {
        return normalized;
      }
    }

    return null;
  }
}
