/**
 * Test Express application for @posty5/lang-detect.
 *
 * Usage:
 *   npx ts-node tests/test-app.ts
 *
 * Then test with:
 *   curl http://localhost:3456/en/page
 *   curl http://localhost:3456/page?lang=ar
 *   curl http://localhost:3456/us/page
 *   curl http://localhost:3456/page?locale=eg
 *   curl -H "Cookie: lang=fr" http://localhost:3456/page
 *   curl -H "Accept-Language: es,en;q=0.9" http://localhost:3456/page
 *   curl http://localhost:3456/page
 */
import express from "express";
import cookieParser from "cookie-parser";
import { langDetectMiddleware, DetectionStage } from "../src";

const app = express();
app.use(cookieParser());

// Default config — all stages
app.use(
  langDetectMiddleware({
    userLangResolver: (_req, res) => res.locals.loggedUserInfo?.languageCode ?? null,
  }),
);

app.get("*", (req, res) => {
  res.json({
    lang: res.locals["lang"],
    isRTL: res.locals["isRTL"],
    detectedBy: res.locals["langDetectedBy"],
    path: req.path,
    query: req.query,
  });
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`🌐 Lang-detect test app running on http://localhost:${PORT}`);
  console.log("");
  console.log("Try these:");
  console.log(`  curl http://localhost:${PORT}/en/page`);
  console.log(`  curl http://localhost:${PORT}/page?lang=ar`);
  console.log(`  curl http://localhost:${PORT}/us/page`);
  console.log(`  curl http://localhost:${PORT}/page?locale=eg`);
  console.log(`  curl -H "Cookie: lang=fr" http://localhost:${PORT}/page`);
  console.log(`  curl -H "Accept-Language: es" http://localhost:${PORT}/page`);
  console.log(`  curl http://localhost:${PORT}/page`);
});
