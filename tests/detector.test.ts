import { detectLanguage, DetectionStage, IDetectionContext } from "../src";

/**
 * Helper to create a minimal context with overrides.
 */
function ctx(overrides: Partial<IDetectionContext> = {}): IDetectionContext {
  return {
    path: "/",
    queryParams: {},
    cookies: {},
    headers: {},
    userLang: null,
    ip: null,
    ...overrides,
  };
}

describe("detectLanguage", () => {
  // ---------- PATH_LANG ----------
  describe("PATH_LANG stage", () => {
    it("detects language from URL path /en/page", async () => {
      const result = await detectLanguage(ctx({ path: "/en/page" }));
      expect(result.lang).toBe("en");
      expect(result.detectedBy).toBe(DetectionStage.PATH_LANG);
    });

    it("detects language from URL path /ar", async () => {
      const result = await detectLanguage(ctx({ path: "/ar" }));
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.PATH_LANG);
      expect(result.isRTL).toBe(true);
    });

    it("ignores unsupported language in path", async () => {
      const result = await detectLanguage(ctx({ path: "/xx/page" }));
      expect(result.detectedBy).not.toBe(DetectionStage.PATH_LANG);
    });

    it("handles root path /", async () => {
      const result = await detectLanguage(ctx({ path: "/" }));
      expect(result.detectedBy).not.toBe(DetectionStage.PATH_LANG);
    });

    it("respects custom pathSegmentIndex", async () => {
      const result = await detectLanguage(ctx({ path: "/app/fr/dashboard" }), {
        pathSegmentIndex: 1,
      });
      expect(result.lang).toBe("fr");
      expect(result.detectedBy).toBe(DetectionStage.PATH_LANG);
    });
  });

  // ---------- QUERY_LANG ----------
  describe("QUERY_LANG stage", () => {
    it("detects from ?lang=ar", async () => {
      const result = await detectLanguage(ctx({ queryParams: { lang: "ar" } }));
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.QUERY_LANG);
    });

    it("detects from ?language=fr", async () => {
      const result = await detectLanguage(ctx({ queryParams: { language: "fr" } }));
      expect(result.lang).toBe("fr");
      expect(result.detectedBy).toBe(DetectionStage.QUERY_LANG);
    });

    it("detects from ?langCode=es", async () => {
      const result = await detectLanguage(ctx({ queryParams: { langCode: "es" } }));
      expect(result.lang).toBe("es");
      expect(result.detectedBy).toBe(DetectionStage.QUERY_LANG);
    });

    it("detects from ?languageCode=de", async () => {
      const result = await detectLanguage(ctx({ queryParams: { languageCode: "de" } }));
      expect(result.lang).toBe("de");
      expect(result.detectedBy).toBe(DetectionStage.QUERY_LANG);
    });

    it("ignores unsupported language in query", async () => {
      const result = await detectLanguage(ctx({ queryParams: { lang: "zz" } }));
      expect(result.detectedBy).not.toBe(DetectionStage.QUERY_LANG);
    });

    it("respects custom queryLangKeys", async () => {
      const result = await detectLanguage(ctx({ queryParams: { lng: "ja" } }), {
        queryLangKeys: ["lng"],
      });
      expect(result.lang).toBe("ja");
      expect(result.detectedBy).toBe(DetectionStage.QUERY_LANG);
    });
  });

  // ---------- GEO_PATH ----------
  describe("GEO_PATH stage", () => {
    it("detects /us → en", async () => {
      const result = await detectLanguage(ctx({ path: "/us/trends" }));
      // PATH_LANG won't match 'us' (not a language), so GEO_PATH kicks in
      expect(result.lang).toBe("en");
      expect(result.detectedBy).toBe(DetectionStage.GEO_PATH);
    });

    it("detects /eg → ar", async () => {
      const result = await detectLanguage(ctx({ path: "/eg/news" }));
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.GEO_PATH);
      expect(result.isRTL).toBe(true);
    });

    it("detects /de → de", async () => {
      // Note: PATH_LANG will match 'de' first since 'de' is a valid language code
      const result = await detectLanguage(ctx({ path: "/de/page" }));
      expect(result.lang).toBe("de");
      // Could be either PATH_LANG or GEO_PATH — both return 'de'
    });

    it("ignores unknown geo code", async () => {
      const result = await detectLanguage(ctx({ path: "/zz/page" }));
      expect(result.detectedBy).not.toBe(DetectionStage.GEO_PATH);
    });
  });

  // ---------- GEO_QUERY ----------
  describe("GEO_QUERY stage", () => {
    it("detects ?locale=eg → ar", async () => {
      const result = await detectLanguage(ctx({ queryParams: { locale: "eg" } }));
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.GEO_QUERY);
    });

    it("detects ?country=jp → ja", async () => {
      const result = await detectLanguage(ctx({ queryParams: { country: "jp" } }));
      expect(result.lang).toBe("ja");
      expect(result.detectedBy).toBe(DetectionStage.GEO_QUERY);
    });

    it("detects ?region=br → pt", async () => {
      const result = await detectLanguage(ctx({ queryParams: { region: "br" } }));
      expect(result.lang).toBe("pt");
      expect(result.detectedBy).toBe(DetectionStage.GEO_QUERY);
    });

    it("detects ?culture=de → de", async () => {
      const result = await detectLanguage(ctx({ queryParams: { culture: "de" } }));
      expect(result.lang).toBe("de");
      expect(result.detectedBy).toBe(DetectionStage.GEO_QUERY);
    });

    it("respects custom geoQueryKeys", async () => {
      const result = await detectLanguage(ctx({ queryParams: { geo: "fr" } }), {
        geoQueryKeys: ["geo"],
      });
      expect(result.lang).toBe("fr");
      expect(result.detectedBy).toBe(DetectionStage.GEO_QUERY);
    });
  });

  // ---------- COOKIE ----------
  describe("COOKIE stage", () => {
    it("detects from cookie lang=fr", async () => {
      const result = await detectLanguage(ctx({ cookies: { lang: "fr" } }), {
        stages: [DetectionStage.COOKIE, DetectionStage.DEFAULT],
      });
      expect(result.lang).toBe("fr");
      expect(result.detectedBy).toBe(DetectionStage.COOKIE);
    });

    it("respects custom cookieKeys", async () => {
      const result = await detectLanguage(ctx({ cookies: { user_lang: "ko" } }), {
        stages: [DetectionStage.COOKIE, DetectionStage.DEFAULT],
        cookieKeys: ["user_lang", "lang"],
      });
      expect(result.lang).toBe("ko");
      expect(result.detectedBy).toBe(DetectionStage.COOKIE);
    });

    it("tries multiple cookie keys in order", async () => {
      const result = await detectLanguage(ctx({ cookies: { preferred_lang: "it", lang: "en" } }), {
        stages: [DetectionStage.COOKIE, DetectionStage.DEFAULT],
        cookieKeys: ["preferred_lang", "lang"],
      });
      expect(result.lang).toBe("it");
    });

    it("ignores unsupported cookie value", async () => {
      const result = await detectLanguage(ctx({ cookies: { lang: "xx" } }), {
        stages: [DetectionStage.COOKIE, DetectionStage.DEFAULT],
      });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });
  });

  // ---------- USER_LANG ----------
  describe("USER_LANG stage", () => {
    it("detects from user language preference", async () => {
      const result = await detectLanguage(ctx({ userLang: "ar" }), {
        stages: [DetectionStage.USER_LANG, DetectionStage.DEFAULT],
      });
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.USER_LANG);
      expect(result.isRTL).toBe(true);
    });

    it("ignores unsupported user language", async () => {
      const result = await detectLanguage(ctx({ userLang: "xx" }), {
        stages: [DetectionStage.USER_LANG, DetectionStage.DEFAULT],
      });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("ignores null userLang", async () => {
      const result = await detectLanguage(ctx({ userLang: null }), {
        stages: [DetectionStage.USER_LANG, DetectionStage.DEFAULT],
      });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("works for browser JWT decode scenario", async () => {
      // Simulates browser where developer decodes JWT and passes lang
      const decodedJwt = { lang: "ja", sub: "user123" };
      const result = await detectLanguage(ctx({ userLang: decodedJwt.lang }), {
        stages: [DetectionStage.USER_LANG, DetectionStage.DEFAULT],
      });
      expect(result.lang).toBe("ja");
      expect(result.detectedBy).toBe(DetectionStage.USER_LANG);
    });
  });

  // ---------- VISITOR_GEO ----------
  describe("VISITOR_GEO stage", () => {
    it("detects language from IP via custom geoDetector", async () => {
      const result = await detectLanguage(ctx({ ip: "1.2.3.4" }), {
        stages: [DetectionStage.VISITOR_GEO, DetectionStage.DEFAULT],
        geoDetector: async () => "EG",
      });
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.VISITOR_GEO);
    });

    it("skips when IP is null", async () => {
      const result = await detectLanguage(ctx({ ip: null }), {
        stages: [DetectionStage.VISITOR_GEO, DetectionStage.DEFAULT],
        geoDetector: async () => "EG",
      });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("handles geoDetector returning null", async () => {
      const result = await detectLanguage(ctx({ ip: "1.2.3.4" }), {
        stages: [DetectionStage.VISITOR_GEO, DetectionStage.DEFAULT],
        geoDetector: async () => null,
      });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("handles unknown country code", async () => {
      const result = await detectLanguage(ctx({ ip: "1.2.3.4" }), {
        stages: [DetectionStage.VISITOR_GEO, DetectionStage.DEFAULT],
        geoDetector: async () => "XX",
      });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("supports sync geoDetector", async () => {
      const result = await detectLanguage(ctx({ ip: "1.2.3.4" }), {
        stages: [DetectionStage.VISITOR_GEO, DetectionStage.DEFAULT],
        geoDetector: () => "JP",
      });
      expect(result.lang).toBe("ja");
    });
  });

  // ---------- ACCEPT_LANGUAGE ----------
  describe("ACCEPT_LANGUAGE stage", () => {
    it("detects from Accept-Language header", async () => {
      const result = await detectLanguage(ctx({ headers: { "accept-language": "ar,en-US;q=0.9,en;q=0.8" } }), { stages: [DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT] });
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.ACCEPT_LANGUAGE);
    });

    it("respects quality values", async () => {
      const result = await detectLanguage(ctx({ headers: { "accept-language": "en;q=0.5,fr;q=0.9,de;q=0.7" } }), { stages: [DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT] });
      expect(result.lang).toBe("fr");
    });

    it("handles browser navigator.languages", async () => {
      const result = await detectLanguage(ctx({ navigatorLanguages: ["ja", "en-US", "en"] }), { stages: [DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT] });
      expect(result.lang).toBe("ja");
      expect(result.detectedBy).toBe(DetectionStage.ACCEPT_LANGUAGE);
    });

    it("skips unsupported browser languages and finds supported one", async () => {
      const result = await detectLanguage(ctx({ navigatorLanguages: ["sv", "no", "ko"] }), { stages: [DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT] });
      expect(result.lang).toBe("ko");
    });

    it("falls through when no language matches", async () => {
      const result = await detectLanguage(ctx({ headers: { "accept-language": "sv,no;q=0.9" } }), { stages: [DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT] });
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("handles locale tags like en-US", async () => {
      const result = await detectLanguage(ctx({ headers: { "accept-language": "en-US,en;q=0.9" } }), {
        stages: [DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT],
        supportedLanguages: ["en", "fr"],
      });
      expect(result.lang).toBe("en");
    });
  });

  // ---------- DEFAULT ----------
  describe("DEFAULT stage", () => {
    it("returns en by default", async () => {
      const result = await detectLanguage(ctx());
      expect(result.lang).toBe("en");
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
      expect(result.isRTL).toBe(false);
    });

    it("respects custom default language", async () => {
      const result = await detectLanguage(ctx(), { defaultLanguage: "ar" });
      expect(result.lang).toBe("ar");
      expect(result.isRTL).toBe(true);
    });
  });

  // ---------- PRIORITY / ORDERING ----------
  describe("stage priority", () => {
    it("PATH_LANG wins over QUERY_LANG by default", async () => {
      const result = await detectLanguage(ctx({ path: "/fr/page", queryParams: { lang: "ar" } }));
      expect(result.lang).toBe("fr");
      expect(result.detectedBy).toBe(DetectionStage.PATH_LANG);
    });

    it("user can reorder: QUERY_LANG before PATH_LANG", async () => {
      const result = await detectLanguage(ctx({ path: "/fr/page", queryParams: { lang: "ar" } }), {
        stages: [DetectionStage.QUERY_LANG, DetectionStage.PATH_LANG, DetectionStage.DEFAULT],
      });
      expect(result.lang).toBe("ar");
      expect(result.detectedBy).toBe(DetectionStage.QUERY_LANG);
    });

    it("user can pass only one stage", async () => {
      const result = await detectLanguage(ctx({ path: "/fr/page", queryParams: { lang: "ar" }, cookies: { lang: "de" } }), {
        stages: [DetectionStage.COOKIE],
      });
      expect(result.lang).toBe("de");
      expect(result.detectedBy).toBe(DetectionStage.COOKIE);
    });

    it("DEFAULT is appended if not in custom stages", async () => {
      const result = await detectLanguage(ctx(), {
        stages: [DetectionStage.COOKIE],
      });
      // COOKIE won't match (no cookie), DEFAULT appended automatically
      expect(result.lang).toBe("en");
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });

    it("USER_LANG has higher priority than ACCEPT_LANGUAGE and DEFAULT", async () => {
      const result = await detectLanguage(
        ctx({
          userLang: "ko",
          headers: { "accept-language": "en" },
        }),
        {
          stages: [DetectionStage.USER_LANG, DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT],
        },
      );
      expect(result.lang).toBe("ko");
      expect(result.detectedBy).toBe(DetectionStage.USER_LANG);
    });

    it("subset of stages: only what user specifies runs", async () => {
      // VISITOR_GEO + DEFAULT only
      const result = await detectLanguage(ctx({ path: "/fr/page", queryParams: { lang: "ar" }, cookies: { lang: "de" } }), {
        stages: [DetectionStage.VISITOR_GEO, DetectionStage.DEFAULT],
      });
      // No IP → VISITOR_GEO skips, DEFAULT kicks in
      expect(result.lang).toBe("en");
      expect(result.detectedBy).toBe(DetectionStage.DEFAULT);
    });
  });

  // ---------- RTL ----------
  describe("RTL detection", () => {
    it("Arabic is RTL", async () => {
      const result = await detectLanguage(ctx({ path: "/ar" }));
      expect(result.isRTL).toBe(true);
    });

    it("Urdu is RTL", async () => {
      const result = await detectLanguage(ctx({ path: "/ur" }));
      expect(result.isRTL).toBe(true);
    });

    it("English is LTR", async () => {
      const result = await detectLanguage(ctx({ path: "/en" }));
      expect(result.isRTL).toBe(false);
    });

    it("French is LTR", async () => {
      const result = await detectLanguage(ctx({ path: "/fr" }));
      expect(result.isRTL).toBe(false);
    });
  });

  // ---------- CUSTOM CONFIG ----------
  describe("custom configuration", () => {
    it("custom supportedLanguages limits detection", async () => {
      const result = await detectLanguage(ctx({ path: "/fr/page" }), {
        supportedLanguages: ["en", "ar"],
      });
      // 'fr' not in supported list → falls through
      expect(result.lang).not.toBe("fr");
    });

    it("custom geoToLang mapping", async () => {
      const result = await detectLanguage(ctx({ path: "/xx/page" }), {
        geoToLang: { XX: "tr" },
        stages: [DetectionStage.GEO_PATH, DetectionStage.DEFAULT],
      });
      expect(result.lang).toBe("tr");
      expect(result.detectedBy).toBe(DetectionStage.GEO_PATH);
    });

    it("case insensitive language codes", async () => {
      const result = await detectLanguage(ctx({ queryParams: { lang: "AR" } }));
      expect(result.lang).toBe("ar");
    });

    it("case insensitive geo codes", async () => {
      const result = await detectLanguage(ctx({ queryParams: { locale: "Eg" } }), {
        stages: [DetectionStage.GEO_QUERY, DetectionStage.DEFAULT],
      });
      expect(result.lang).toBe("ar");
    });
  });
});
