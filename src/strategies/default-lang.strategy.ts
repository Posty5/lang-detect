import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Fallback strategy that returns the configured default language.
 */
export class DefaultLangStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.DEFAULT;

  detect(_context: IDetectionContext, config: IResolvedConfig): string | null {
    return config.defaultLanguage;
  }
}
