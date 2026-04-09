import { DetectionStage } from "../enums/detection-stage.enum";

/**
 * Result of language detection.
 */
export interface IDetectionResult {
  /** Detected language code (ISO 639-1), e.g. 'en', 'ar' */
  lang: string;

  /** Which detection stage produced the result */
  detectedBy: DetectionStage;

  /** Whether the detected language is right-to-left */
  isRTL: boolean;
}
