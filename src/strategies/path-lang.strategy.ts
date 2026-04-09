import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from URL path segment.
 * Example: `/en/page` → `en`, `/ar/dashboard` → `ar`
 */
export class PathLangStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.PATH_LANG;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    const segments = context.path.split("/").filter(Boolean);
    const segment = segments[config.pathSegmentIndex];
    if (!segment) return null;

    const normalized = segment.toLowerCase();
    if (config.supportedLanguages.includes(normalized)) {
      return normalized;
    }

    return null;
  }
}
