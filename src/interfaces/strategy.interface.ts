import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "./context.interface";

/**
 * Strategy interface for a single detection stage.
 * Each stage implements this to provide its detection logic.
 */
export interface IDetectionStrategy {
  /** Which stage this strategy handles */
  readonly stage: DetectionStage;

  /**
   * Attempt to detect the language from the given context.
   * @returns The detected language code, or `null` if this strategy cannot determine the language.
   */
  detect(context: IDetectionContext, config: Required<IResolvedConfig>): Promise<string | null> | string | null;
}

/**
 * Fully resolved config with all defaults applied.
 * Used internally by strategies.
 */
export interface IResolvedConfig {
  supportedLanguages: string[];
  stages: DetectionStage[];
  geoToLang: Record<string, string>;
  cookieKeys: string[];
  queryLangKeys: string[];
  geoQueryKeys: string[];
  defaultLanguage: string;
  geoDetector: ((ip: string) => Promise<string | null> | string | null) | null;
  pathSegmentIndex: number;
  setCookie: boolean;
  cookieOptions: {
    maxAge: number;
    httpOnly: boolean;
    sameSite: "strict" | "lax" | "none";
    secure: boolean;
    path: string;
  };
}
