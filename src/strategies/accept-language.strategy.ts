import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from Accept-Language header (server) or navigator.languages (browser).
 *
 * Server: Parses the `accept-language` header, sorted by quality value (q).
 * Browser: Uses `context.navigatorLanguages` (from `navigator.languages`).
 * Returns the first supported language found.
 */
export class AcceptLanguageStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.ACCEPT_LANGUAGE;

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    // Browser path: use navigator.languages
    if (context.navigatorLanguages && context.navigatorLanguages.length > 0) {
      return this.findFirstSupported(context.navigatorLanguages, config.supportedLanguages);
    }

    // Server path: parse Accept-Language header
    const header = context.headers["accept-language"];
    if (!header) return null;

    const languages = this.parseAcceptLanguage(header);
    return this.findFirstSupported(languages, config.supportedLanguages);
  }

  /**
   * Parse Accept-Language header into an array of base language codes sorted by quality.
   * Example: "ar,en-US;q=0.9,fr;q=0.8" → ["ar", "en", "fr"]
   */
  private parseAcceptLanguage(header: string): string[] {
    const entries = header.split(",").map((entry) => {
      const parts = entry.trim().split(";");
      const code = parts[0].trim();
      const qMatch = parts[1]?.match(/q=([\d.]+)/);
      const q = qMatch ? parseFloat(qMatch[1]) : 1.0;
      const baseLang = code.split(/[-_]/)[0].toLowerCase();
      return { lang: baseLang, q };
    });

    entries.sort((a, b) => b.q - a.q);
    return entries.map((e) => e.lang);
  }

  /**
   * Find the first language in the candidates list that is supported.
   */
  private findFirstSupported(candidates: string[], supported: string[]): string | null {
    for (const candidate of candidates) {
      const base = candidate.split(/[-_]/)[0].toLowerCase();
      if (supported.includes(base)) {
        return base;
      }
    }
    return null;
  }
}
