import { createExpressContext } from "../src/adapters/express.adapter";

describe("createExpressContext", () => {
  it("extracts path, query, cookies, headers, and IP", () => {
    const req = {
      path: "/en/page",
      query: { lang: "ar", page: "1" },
      cookies: { lang: "fr", session: "abc" },
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
        "x-custom": ["val1", "val2"],
      },
      ip: "127.0.0.1",
    };

    const context = createExpressContext(req);

    expect(context.path).toBe("/en/page");
    expect(context.queryParams).toEqual({ lang: "ar", page: "1" });
    expect(context.cookies).toEqual({ lang: "fr", session: "abc" });
    expect(context.headers["accept-language"]).toBe("en-US,en;q=0.9");
    expect(context.ip).toBe("1.2.3.4");
  });

  it("passes userLang from options", () => {
    const req = {
      path: "/",
      query: {},
      cookies: {},
      headers: {},
    };
    const context = createExpressContext(req, { userLang: "ko" });
    expect(context.userLang).toBe("ko");
  });

  it("falls back to req.ip when no proxy headers", () => {
    const req = {
      path: "/",
      query: {},
      cookies: {},
      headers: {},
      ip: "10.0.0.1",
    };
    const context = createExpressContext(req);
    expect(context.ip).toBe("10.0.0.1");
  });

  it("handles missing cookies gracefully", () => {
    const req = {
      path: "/",
      query: {},
      headers: {},
    };
    const context = createExpressContext(req);
    expect(context.cookies).toEqual({});
  });

  it("ignores non-string query params", () => {
    const req = {
      path: "/",
      query: { lang: "ar", arr: ["a", "b"], num: 42 },
      cookies: {},
      headers: {},
    };
    const context = createExpressContext(req);
    expect(context.queryParams).toEqual({ lang: "ar" });
  });
});
