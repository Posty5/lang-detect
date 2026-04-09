import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Uses the logged-in user's saved language preference.
 *
 * Works in both server and browser environments:
 * - Server: set `context.userLang` from the user record in DB or decoded JWT
 * - Browser: set `context.userLang` from a decoded JWT token or user profile API response
 *
 * This stage is high priority (above VISITOR_GEO, ACCEPT_LANGUAGE, DEFAULT)
 * because a logged-in user's explicit language preference should be respected.
 */
export class UserLangStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.USER_LANG;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    const userLang = context.userLang;
    if (!userLang) return null;

    const normalized = userLang.toLowerCase();
    if (config.supportedLanguages.includes(normalized)) {
      return normalized;
    }

    return null;
  }
}
