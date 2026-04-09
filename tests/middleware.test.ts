import { langDetectMiddleware, DetectionStage } from "../src";

/** Simple mock for Express response */
function mockRes() {
  const locals: Record<string, any> = {};
  const cookiesSet: Array<{ name: string; value: string; options: any }> = [];
  return {
    locals,
    cookie(name: string, value: string, options: any) {
      cookiesSet.push({ name, value, options });
    },
    _cookiesSet: cookiesSet,
  };
}

/** Simple mock for Express request */
function mockReq(
  overrides: Partial<{
    path: string;
    query: Record<string, any>;
    cookies: Record<string, string>;
    headers: Record<string, string | string[]>;
    ip: string;
  }> = {},
) {
  return {
    path: overrides.path ?? "/",
    query: overrides.query ?? {},
    cookies: overrides.cookies ?? {},
    headers: overrides.headers ?? {},
    ip: overrides.ip ?? "127.0.0.1",
  };
}

describe("langDetectMiddleware", () => {
  it("sets res.locals.lang and res.locals.isRTL", async () => {
    const middleware = langDetectMiddleware();
    const req = mockReq({ path: "/ar/page" });
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.locals["lang"]).toBe("ar");
    expect(res.locals["isRTL"]).toBe(true);
    expect(res.locals["langDetectedBy"]).toBe(DetectionStage.PATH_LANG);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("sets cookie when detected language differs from cookie", async () => {
    const middleware = langDetectMiddleware();
    const req = mockReq({ path: "/fr/page", cookies: { lang: "en" } });
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.locals["lang"]).toBe("fr");
    expect(res._cookiesSet.length).toBe(1);
    expect(res._cookiesSet[0].name).toBe("lang");
    expect(res._cookiesSet[0].value).toBe("fr");
  });

  it("does not set cookie when language matches cookie", async () => {
    const middleware = langDetectMiddleware();
    const req = mockReq({ path: "/fr/page", cookies: { lang: "fr" } });
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res._cookiesSet.length).toBe(0);
  });

  it("does not set cookie when setCookie is false", async () => {
    const middleware = langDetectMiddleware({ setCookie: false });
    const req = mockReq({ path: "/fr/page" });
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res._cookiesSet.length).toBe(0);
  });

  it("uses userLangResolver to get logged-in user language", async () => {
    const middleware = langDetectMiddleware({
      stages: [DetectionStage.USER_LANG, DetectionStage.DEFAULT],
      userLangResolver: (_req, res) => res.locals["loggedUserLang"],
    });

    const req = mockReq();
    const res = mockRes();
    res.locals["loggedUserLang"] = "ko";
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.locals["lang"]).toBe("ko");
    expect(res.locals["langDetectedBy"]).toBe(DetectionStage.USER_LANG);
  });

  it("falls back to default on error", async () => {
    const middleware = langDetectMiddleware({
      geoDetector: () => {
        throw new Error("boom");
      },
      stages: [DetectionStage.VISITOR_GEO],
    });

    const req = mockReq({ ip: "1.2.3.4" });
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // Error in geoDetector propagates → catch block → defaultLanguage
    expect(res.locals["lang"]).toBe("en");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("supports custom stage order", async () => {
    const middleware = langDetectMiddleware({
      stages: [DetectionStage.QUERY_LANG, DetectionStage.PATH_LANG, DetectionStage.DEFAULT],
    });

    const req = mockReq({ path: "/fr/page", query: { lang: "ar" } });
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // QUERY_LANG runs first → ar
    expect(res.locals["lang"]).toBe("ar");
    expect(res.locals["langDetectedBy"]).toBe(DetectionStage.QUERY_LANG);
  });
});
