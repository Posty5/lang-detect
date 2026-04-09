import { DetectionStage } from "../enums/detection-stage.enum";
import { IDetectionContext } from "../interfaces/context.interface";
import { IDetectionStrategy, IResolvedConfig } from "../interfaces/strategy.interface";

/**
 * Detects language from visitor's IP address → country → language mapping.
 *
 * Server-only: requires `context.ip` and a `geoDetector` function.
 * If no `geoDetector` is configured, attempts to use `geoip-country` (optional peer dep).
 * Gracefully skips if IP is unavailable (e.g. in browser contexts).
 */
export class VisitorGeoStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.VISITOR_GEO;

  async detect(context: IDetectionContext, config: IResolvedConfig): Promise<string | null> {
    const ip = context.ip;
    if (!ip) return null;

    let countryCode: string | null = null;

    if (config.geoDetector) {
      countryCode = await config.geoDetector(ip);
    } else {
      countryCode = this.tryGeoIpLookup(ip);
    }

    if (!countryCode) return null;

    const lang = config.geoToLang[countryCode.toUpperCase()];
    if (lang && config.supportedLanguages.includes(lang)) {
      return lang;
    }

    return null;
  }

  /**
   * Try to use `geoip-country` package if installed.
   * Returns null if the package is not available.
   */
  private tryGeoIpLookup(ip: string): string | null {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const geoip = require("geoip-country");
      const result = geoip.lookup(ip);
      return result?.country ?? null;
    } catch {
      return null;
    }
  }
}
