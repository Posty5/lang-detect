<p align="center">
  <img src="https://img.shields.io/npm/v/@posty5/lang-detect?color=blue&label=npm" alt="npm version" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build" />
  <img src="https://img.shields.io/badge/tests-67%20passed-brightgreen" alt="tests" />
  <img src="https://img.shields.io/badge/bundle-13.7KB-blue" alt="bundle size" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
</p>

# @posty5/lang-detect

**Unified, strategy-based language detection for Node.js, Angular SSR, and the browser.**

One package to detect your user's language from URL paths, query strings, cookies, geo-IP, JWT tokens, headers — with fully configurable priority, zero lock-in, and first-class TypeScript support.

---

## Table of Contents

- [Why This Package?](#why-this-package)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Detection Stages](#detection-stages)
- [Package Structure](#package-structure)
- [API Reference](#api-reference)
  - [`detectLanguage()`](#detectlanguagecontext-config)
  - [`langDetectMiddleware()`](#langdetectmiddlewareconfig)
  - [`createExpressContext()`](#createexpresscontextreq-options)
  - [`createBrowserContext()`](#createbrowsercontextoptions)
  - [`ILangDetectConfig`](#ilangdetectconfig)
  - [`IDetectionContext`](#idetectioncontext)
  - [`IDetectionResult`](#idetectionresult)
  - [`DetectionStage` enum](#detectionstage-enum)
- [Usage Guide: Node.js / Express](#usage-guide-nodejs--express)
  - [Basic Express Middleware](#basic-express-middleware)
  - [Custom Priority Order](#custom-priority-order)
  - [Logged-in User Language (Server)](#logged-in-user-language-server)
  - [IP-based Geo Detection](#ip-based-geo-detection)
  - [Custom Cookie & Query Keys](#custom-cookie--query-keys)
  - [Disable Cookie Persistence](#disable-cookie-persistence)
- [Usage Guide: Angular SSR](#usage-guide-angular-ssr)
  - [Step 1 — Express Middleware in server.ts](#step-1--express-middleware-in-serverts)
  - [Step 2 — Pass Language to Angular via REQUEST_CONTEXT](#step-2--pass-language-to-angular-via-request_context)
  - [Step 3 — Angular Service with TransferState](#step-3--angular-service-with-transferstate)
  - [Step 4 — Use in Components](#step-4--use-in-components)
- [Usage Guide: Angular (Browser-Only)](#usage-guide-angular-browser-only)
  - [Basic Browser Detection](#basic-browser-detection)
  - [With JWT Token (Logged-in User)](#with-jwt-token-logged-in-user)
  - [Angular Service Example](#angular-service-example)
- [Usage Guide: Any TypeScript / Node.js Service](#usage-guide-any-typescript--nodejs-service)
- [Configuration Reference](#configuration-reference)
  - [Supported Languages (Default)](#supported-languages-default)
  - [Geo-to-Language Map (Default)](#geo-to-language-map-default)
  - [RTL Languages](#rtl-languages)
  - [Full Config Example](#full-config-example)
- [Advanced Usage](#advanced-usage)
  - [Single Stage Only](#single-stage-only)
  - [Custom Strategy](#custom-strategy)
  - [Custom Geo-to-Language Map](#custom-geo-to-language-map)
- [How Detection Works](#how-detection-works)
- [Testing](#testing)
- [License](#license)

---

## Why This Package?

| Problem                                          | Solution                                                    |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Language detection duplicated across 3+ projects | **One package**, import everywhere                          |
| Hard-coded priority order                        | **Configurable stage array** — reorder, add, remove         |
| Server-only or browser-only                      | **Works in Node.js, Angular SSR, and browser**              |
| Different query param names across projects      | **Configurable keys** for cookies, query params, geo params |
| No typed API                                     | **Full TypeScript** with exported interfaces and enums      |
| Can't extend detection logic                     | **Strategy pattern** — plug in custom stages                |

---

## Quick Start

```bash
npm install @posty5/lang-detect
```

**Express (one line):**

```ts
import { langDetectMiddleware } from "@posty5/lang-detect";

app.use(langDetectMiddleware());
// → res.locals['lang']    = 'ar'
// → res.locals['isRTL']   = true
// → res.locals['langDetectedBy'] = 'PATH_LANG'
```

**Browser / Angular:**

```ts
import { detectLanguage, createBrowserContext } from "@posty5/lang-detect";

const result = await detectLanguage(createBrowserContext());
console.log(result.lang); // 'en'
```

---

## Installation

```bash
# npm
npm install @posty5/lang-detect

# yarn
yarn add @posty5/lang-detect

# pnpm
pnpm add @posty5/lang-detect
```

**Optional peer dependency** for IP-based geo detection (server-only):

```bash
npm install geoip-country
```

> If you don't install `geoip-country`, the `VISITOR_GEO` stage will be skipped unless you provide a custom `geoDetector` function.

---

## Detection Stages

The detector runs through stages **in order**. The **first stage that returns a result wins**.

| #   | Stage             | What it does                        | Example                      | Browser?      |
| --- | ----------------- | ----------------------------------- | ---------------------------- | ------------- |
| 1   | `PATH_LANG`       | Language code in URL path           | `/en/dashboard` → `en`       | Yes           |
| 2   | `QUERY_LANG`      | Language in query string            | `?lang=ar` → `ar`            | Yes           |
| 3   | `GEO_PATH`        | Geo code in URL path → language     | `/us/trends` → `en`          | Yes           |
| 4   | `GEO_QUERY`       | Geo code in query string → language | `?locale=eg` → `ar`          | Yes           |
| 5   | `COOKIE`          | Language stored in cookie           | Cookie `lang=fr` → `fr`      | Yes           |
| 6   | `USER_LANG`       | Logged-in user's saved preference   | JWT `{ lang: 'ko' }` → `ko`  | Yes           |
| 7   | `VISITOR_GEO`     | IP → country → language             | IP `41.x.x.x` → EG → `ar`    | Server only   |
| 8   | `ACCEPT_LANGUAGE` | Browser/header language preference  | `Accept-Language: es` → `es` | Yes (adapted) |
| 9   | `DEFAULT`         | Fallback                            | — → `en`                     | Yes           |

> **Tip:** Pass your own `stages` array to change the order or use only the stages you need.

---

## Package Structure

```
@posty5/lang-detect
├── src/
│   ├── index.ts                              # Barrel export (everything re-exported)
│   │
│   ├── enums/
│   │   └── detection-stage.enum.ts           # DetectionStage enum (9 stages)
│   │
│   ├── interfaces/
│   │   ├── config.interface.ts               # ILangDetectConfig, ICookieOptions
│   │   ├── context.interface.ts              # IDetectionContext
│   │   ├── result.interface.ts               # IDetectionResult
│   │   └── strategy.interface.ts             # IDetectionStrategy, IResolvedConfig
│   │
│   ├── data/
│   │   ├── supported-languages.ts            # Default 15 languages
│   │   ├── geo-to-lang.ts                    # Default 45+ country → language map
│   │   └── rtl-languages.ts                  # RTL language list ['ar', 'ur']
│   │
│   ├── strategies/                           # Strategy Pattern — one class per stage
│   │   ├── path-lang.strategy.ts             # /en/page → en
│   │   ├── query-lang.strategy.ts            # ?lang=ar → ar
│   │   ├── geo-path.strategy.ts              # /us/page → en (via GEO_TO_LANG)
│   │   ├── geo-query.strategy.ts             # ?locale=eg → ar (via GEO_TO_LANG)
│   │   ├── cookie.strategy.ts                # Cookie lang=fr → fr
│   │   ├── user-lang.strategy.ts             # context.userLang → user's saved lang
│   │   ├── visitor-geo.strategy.ts           # IP → country → language
│   │   ├── accept-language.strategy.ts       # Accept-Language header / navigator.languages
│   │   ├── default-lang.strategy.ts          # Fallback to config.defaultLanguage
│   │   └── index.ts                          # Strategy registry + factory
│   │
│   ├── core/
│   │   └── detector.ts                       # detectLanguage() + resolveConfig()
│   │
│   ├── adapters/
│   │   ├── express.adapter.ts                # createExpressContext(req)
│   │   └── browser.adapter.ts                # createBrowserContext()
│   │
│   └── middleware/
│       └── express.middleware.ts              # langDetectMiddleware() for Express
│
├── tests/
│   ├── detector.test.ts                      # 52 tests — all stages, priority, RTL, config
│   ├── middleware.test.ts                     # 7 tests — Express middleware
│   ├── express-adapter.test.ts               # 5 tests — context extraction
│   └── test-app.ts                           # Manual test Express server (port 3456)
│
├── dist/                                     # Build output
│   ├── index.js                              # CommonJS (13.7 KB)
│   ├── index.mjs                             # ESM (13.2 KB)
│   └── index.d.ts                            # TypeScript declarations
│
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── jest.config.js
```

---

## API Reference

### `detectLanguage(context, config?)`

The core detection function. Works in **any environment** (Node.js, browser, SSR).

```ts
function detectLanguage(context: IDetectionContext, config?: ILangDetectConfig): Promise<IDetectionResult>;
```

| Param     | Type                | Description                                           |
| --------- | ------------------- | ----------------------------------------------------- |
| `context` | `IDetectionContext` | Environment-agnostic context (from adapter or manual) |
| `config`  | `ILangDetectConfig` | Optional. All fields have defaults.                   |

**Returns:** `Promise<IDetectionResult>` — always resolves (never throws).

```ts
import { detectLanguage, createExpressContext } from "@posty5/lang-detect";

const context = createExpressContext(req);
const result = await detectLanguage(context);

// result = {
//   lang: 'ar',
//   detectedBy: 'PATH_LANG',
//   isRTL: true
// }
```

---

### `langDetectMiddleware(config?)`

Express middleware. Drop it in and it handles everything.

```ts
function langDetectMiddleware(
  config?: ILangDetectConfig & {
    userLangResolver?: (req, res) => string | null | undefined;
  },
): RequestHandler;
```

**Sets on `res.locals`:**

| Key              | Type      | Description                                   |
| ---------------- | --------- | --------------------------------------------- |
| `lang`           | `string`  | Detected language code (`'en'`, `'ar'`, etc.) |
| `isRTL`          | `boolean` | `true` for Arabic and Urdu                    |
| `langDetectedBy` | `string`  | Which `DetectionStage` matched                |

**Sets cookie:** `lang=<detected>` (365 days, configurable, disable with `setCookie: false`).

---

### `createExpressContext(req, options?)`

Creates an `IDetectionContext` from an Express `Request` object.

```ts
function createExpressContext(req: Request, options?: { userLang?: string | null }): IDetectionContext;
```

Extracts `path`, `query`, `cookies`, `headers`, and `ip` (from `x-forwarded-for`, `x-real-ip`, or `req.ip`).

---

### `createBrowserContext(options?)`

Creates an `IDetectionContext` from the browser environment.

```ts
function createBrowserContext(options?: { userLang?: string | null }): IDetectionContext;
```

Reads `window.location`, `document.cookie`, and `navigator.languages`. IP is `null` (server-only stages are skipped).

---

### `ILangDetectConfig`

All fields are **optional**. Defaults are applied automatically.

```ts
interface ILangDetectConfig {
  supportedLanguages?: string[]; // Default: 15 languages
  stages?: DetectionStage[]; // Default: all 9 in order
  geoToLang?: Record<string, string>; // Default: 45+ country codes
  cookieKeys?: string[]; // Default: ['lang']
  queryLangKeys?: string[]; // Default: ['lang','language','langCode','languageCode']
  geoQueryKeys?: string[]; // Default: ['locale','culture','region','country']
  defaultLanguage?: string; // Default: 'en'
  geoDetector?: (ip: string) => Promise<string | null> | string | null;
  pathSegmentIndex?: number; // Default: 0
  setCookie?: boolean; // Default: true
  cookieOptions?: ICookieOptions; // Default: { maxAge: 1yr, httpOnly: false, sameSite: 'lax' }
}
```

---

### `IDetectionContext`

```ts
interface IDetectionContext {
  path: string; // URL path, e.g. '/en/page'
  queryParams: Record<string, string>; // Query params as key-value
  cookies: Record<string, string>; // Cookies as key-value
  headers: Record<string, string>; // HTTP headers (lowercase keys)
  userLang?: string | null; // Logged-in user's language (from DB, JWT, etc.)
  ip?: string | null; // Client IP (null in browser)
  navigatorLanguages?: string[]; // Browser's navigator.languages
}
```

---

### `IDetectionResult`

```ts
interface IDetectionResult {
  lang: string; // 'en', 'ar', 'fr', etc.
  detectedBy: DetectionStage; // Which stage detected the language
  isRTL: boolean; // true for 'ar' and 'ur'
}
```

---

### `DetectionStage` enum

```ts
enum DetectionStage {
  PATH_LANG = "PATH_LANG",
  QUERY_LANG = "QUERY_LANG",
  GEO_PATH = "GEO_PATH",
  GEO_QUERY = "GEO_QUERY",
  COOKIE = "COOKIE",
  USER_LANG = "USER_LANG",
  VISITOR_GEO = "VISITOR_GEO",
  ACCEPT_LANGUAGE = "ACCEPT_LANGUAGE",
  DEFAULT = "DEFAULT",
}
```

---

## Usage Guide: Node.js / Express

### Basic Express Middleware

```ts
import express from "express";
import cookieParser from "cookie-parser";
import { langDetectMiddleware } from "@posty5/lang-detect";

const app = express();
app.use(cookieParser());
app.use(langDetectMiddleware());

app.get("*", (req, res) => {
  res.json({
    lang: res.locals["lang"], // 'en', 'ar', 'fr', etc.
    isRTL: res.locals["isRTL"], // true / false
    source: res.locals["langDetectedBy"],
  });
});
```

**What happens:**

| Request                             | `lang` | `detectedBy`      |
| ----------------------------------- | ------ | ----------------- |
| `GET /ar/page`                      | `ar`   | `PATH_LANG`       |
| `GET /page?lang=fr`                 | `fr`   | `QUERY_LANG`      |
| `GET /us/trends`                    | `en`   | `GEO_PATH`        |
| `GET /page?locale=eg`               | `ar`   | `GEO_QUERY`       |
| `GET /page` + Cookie `lang=de`      | `de`   | `COOKIE`          |
| `GET /page` + `Accept-Language: es` | `es`   | `ACCEPT_LANGUAGE` |
| `GET /page`                         | `en`   | `DEFAULT`         |

---

### Custom Priority Order

Override the default stage order. **Only the stages you list will run**, in that exact order.

```ts
app.use(
  langDetectMiddleware({
    stages: [
      DetectionStage.COOKIE, // 1. Check cookie first
      DetectionStage.USER_LANG, // 2. Then logged-in user
      DetectionStage.QUERY_LANG, // 3. Then query string
      DetectionStage.ACCEPT_LANGUAGE, // 4. Then browser header
      // DEFAULT is auto-appended
    ],
  }),
);
```

> **Note:** If you omit `DEFAULT` from your array, it is automatically appended as the last stage.

---

### Logged-in User Language (Server)

Use `userLangResolver` to extract the user's language from your auth middleware:

```ts
// Your auth middleware runs first and sets res.locals.user
app.use(authMiddleware);

app.use(
  langDetectMiddleware({
    userLangResolver: (req, res) => {
      // From database user record
      return res.locals.user?.languageCode ?? null;
    },
  }),
);
```

Or from a JWT token:

```ts
app.use(
  langDetectMiddleware({
    userLangResolver: (req) => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return null;
      try {
        const decoded = jwt.verify(token, SECRET);
        return decoded.lang ?? null;
      } catch {
        return null;
      }
    },
  }),
);
```

---

### IP-based Geo Detection

**Option A: Using `geoip-country` (recommended for server-side)**

```bash
npm install geoip-country
```

No extra config needed — the `VISITOR_GEO` stage auto-detects `geoip-country`:

```ts
app.use(langDetectMiddleware());
// VISITOR_GEO will use geoip-country automatically if installed
```

**Option B: Custom API call**

```ts
app.use(
  langDetectMiddleware({
    geoDetector: async (ip) => {
      const res = await fetch(`https://api.example.com/geo?ip=${ip}`);
      const data = await res.json();
      return data.countryCode ?? null; // Return 'US', 'EG', etc. or null
    },
  }),
);
```

**Option C: Using CDN headers (Cloudflare, Vercel, etc.)**

If your CDN sets country headers, the middleware already reads `x-forwarded-for` and `x-real-ip`. For geo detection without IP lookup, you can create a custom `geoDetector` that reads from headers:

```ts
app.use(
  langDetectMiddleware({
    geoDetector: async (ip) => {
      // This runs per-request, but you might prefer
      // a dedicated stage. See "Custom Strategy" in Advanced Usage.
      return null;
    },
  }),
);

// OR — just use a prior middleware to set userGeo and map it yourself
app.use((req, res, next) => {
  const country = req.headers["cf-ipcountry"] || req.headers["x-country-code"];
  if (country) {
    res.locals["userGeo"] = country;
  }
  next();
});
```

---

### Custom Cookie & Query Keys

```ts
app.use(
  langDetectMiddleware({
    // Check these cookie names in order
    cookieKeys: ["user_language", "preferred_lang", "lang"],

    // Check these query param names for language
    queryLangKeys: ["lng", "lang", "language"],

    // Check these query param names for geo code
    geoQueryKeys: ["geo", "locale", "country"],
  }),
);
```

---

### Disable Cookie Persistence

```ts
app.use(
  langDetectMiddleware({
    setCookie: false,
  }),
);
```

Or customize cookie options:

```ts
app.use(
  langDetectMiddleware({
    cookieOptions: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days instead of 365
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    },
  }),
);
```

---

## Usage Guide: Angular SSR

For Angular SSR projects, the language is detected **on the server** and transferred to the **browser** via Angular's `TransferState`.

### Step 1 — Express Middleware in server.ts

In your Angular SSR Express server (`server.ts`):

```ts
import express from "express";
import cookieParser from "cookie-parser";
import { langDetectMiddleware, DetectionStage } from "@posty5/lang-detect";

const app = express();
app.use(cookieParser());

// Detect language before Angular handles the request
app.use(
  langDetectMiddleware({
    supportedLanguages: ["en", "ar", "fr", "de", "es"],
    userLangResolver: (_req, res) => res.locals.loggedUserInfo?.languageCode ?? null,
  }),
);
```

### Step 2 — Pass Language to Angular via REQUEST_CONTEXT

When rendering Angular pages, pass the detected language through `REQUEST_CONTEXT`:

```ts
// In your Angular SSR handler / buildAngularPage function:
import { CommonEngine } from "@angular/ssr/node";

const engine = new CommonEngine();

app.get("*", async (req, res) => {
  const html = await engine.render({
    bootstrap: AppServerModule,
    documentFilePath: indexHtml,
    url: req.url,
    providers: [
      {
        provide: "REQUEST_CONTEXT",
        useValue: {
          lang: res.locals["lang"], // ← from langDetectMiddleware
          isRTL: res.locals["isRTL"], // ← from langDetectMiddleware
        },
      },
    ],
  });

  res.send(html);
});
```

### Step 3 — Angular Service with TransferState

Create a service that reads the language on **both** server and client:

```ts
// src/app/core/services/language-detection.service.ts

import { Injectable, inject, makeStateKey, TransferState, REQUEST_CONTEXT, PLATFORM_ID } from "@angular/core";
import { isPlatformServer } from "@angular/common";

const LANG_STATE_KEY = makeStateKey<string>("ssrLang");
const RTL_STATE_KEY = makeStateKey<boolean>("ssrIsRTL");

@Injectable({ providedIn: "root" })
export class LanguageDetectionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly requestContext = inject(REQUEST_CONTEXT, { optional: true }) as any;

  readonly lang: string;
  readonly isRTL: boolean;

  constructor() {
    if (isPlatformServer(this.platformId)) {
      // SERVER: Read from REQUEST_CONTEXT (set by middleware)
      this.lang = this.requestContext?.["lang"] ?? "en";
      this.isRTL = this.requestContext?.["isRTL"] ?? false;

      // Store in TransferState for client
      this.transferState.set(LANG_STATE_KEY, this.lang);
      this.transferState.set(RTL_STATE_KEY, this.isRTL);
    } else {
      // BROWSER: Read from TransferState (set by server)
      this.lang = this.transferState.get(LANG_STATE_KEY, "en");
      this.isRTL = this.transferState.get(RTL_STATE_KEY, false);
    }
  }
}
```

### Step 4 — Use in Components

```ts
// src/app/pages/home/home.component.ts

import { Component, inject } from "@angular/core";
import { LanguageDetectionService } from "../../core/services/language-detection.service";

@Component({
  selector: "app-home",
  template: `
    <div [dir]="langService.isRTL ? 'rtl' : 'ltr'">
      <p>Detected Language: {{ langService.lang }}</p>
    </div>
  `,
})
export class HomeComponent {
  readonly langService = inject(LanguageDetectionService);
}
```

### SSR Flow Diagram

```
Browser Request
    │
    ▼
Express Server
    │
    ├─ cookieParser()
    ├─ langDetectMiddleware()          ← detects language
    │   └─ sets res.locals['lang'], res.locals['isRTL']
    │
    ▼
Angular SSR Engine
    │
    ├─ REQUEST_CONTEXT = { lang, isRTL }
    ├─ LanguageDetectionService reads REQUEST_CONTEXT
    ├─ Stores in TransferState
    │
    ▼
HTML Response (includes TransferState data)
    │
    ▼
Browser Hydration
    │
    ├─ LanguageDetectionService reads TransferState
    └─ lang + isRTL available instantly (no flash)
```

---

## Usage Guide: Angular (Browser-Only)

For Angular apps **without SSR**, or when you need to re-detect language on the client side.

### Basic Browser Detection

```ts
import { detectLanguage, createBrowserContext } from "@posty5/lang-detect";

// Reads window.location, document.cookie, navigator.languages
const context = createBrowserContext();
const result = await detectLanguage(context);

console.log(result.lang); // 'en'
console.log(result.detectedBy); // 'COOKIE' or 'ACCEPT_LANGUAGE' etc.
console.log(result.isRTL); // false
```

> **Note:** `VISITOR_GEO` (IP detection) is automatically skipped in browser — no IP is available.

### With JWT Token (Logged-in User)

When the user is logged in and you have a JWT token:

```ts
import { detectLanguage, createBrowserContext, DetectionStage } from "@posty5/lang-detect";
import { jwtDecode } from "jwt-decode";

// Decode the JWT to get the user's saved language
const token = localStorage.getItem("auth_token");
const decoded = token ? jwtDecode<{ lang?: string }>(token) : null;

const context = createBrowserContext({
  userLang: decoded?.lang ?? null,
});

const result = await detectLanguage(context, {
  stages: [
    DetectionStage.PATH_LANG,
    DetectionStage.QUERY_LANG,
    DetectionStage.USER_LANG, // JWT language has high priority
    DetectionStage.COOKIE,
    DetectionStage.ACCEPT_LANGUAGE,
    DetectionStage.DEFAULT,
  ],
});
```

### Angular Service Example

```ts
// src/app/core/services/browser-language.service.ts

import { Injectable } from "@angular/core";
import { detectLanguage, createBrowserContext, DetectionStage, IDetectionResult } from "@posty5/lang-detect";

@Injectable({ providedIn: "root" })
export class BrowserLanguageService {
  private _result: IDetectionResult | null = null;

  /** Detect language from the current browser environment */
  async detect(userLang?: string | null): Promise<IDetectionResult> {
    const context = createBrowserContext({ userLang });

    this._result = await detectLanguage(context, {
      supportedLanguages: ["en", "ar", "fr", "de", "es"],
      stages: [DetectionStage.PATH_LANG, DetectionStage.QUERY_LANG, DetectionStage.USER_LANG, DetectionStage.COOKIE, DetectionStage.ACCEPT_LANGUAGE, DetectionStage.DEFAULT],
    });

    return this._result;
  }

  get lang(): string {
    return this._result?.lang ?? "en";
  }

  get isRTL(): boolean {
    return this._result?.isRTL ?? false;
  }

  get detectedBy(): string {
    return this._result?.detectedBy ?? "DEFAULT";
  }
}
```

Usage in a component:

```ts
@Component({
  /* ... */
})
export class AppComponent implements OnInit {
  private langService = inject(BrowserLanguageService);
  private authService = inject(AuthService);

  async ngOnInit() {
    const userLang = this.authService.currentUser?.lang ?? null;
    const result = await this.langService.detect(userLang);
    console.log("Language:", result.lang, "from:", result.detectedBy);
  }
}
```

---

## Usage Guide: Any TypeScript / Node.js Service

Use `detectLanguage()` directly without Express — works in any Node.js or TypeScript context:

```ts
import { detectLanguage, IDetectionContext, DetectionStage } from "@posty5/lang-detect";

// Build context manually
const context: IDetectionContext = {
  path: "/ar/dashboard",
  queryParams: {},
  cookies: { lang: "en" },
  headers: { "accept-language": "ar,en;q=0.9" },
  userLang: "ar", // from your user database
  ip: "41.33.0.1", // from your request
};

const result = await detectLanguage(context, {
  supportedLanguages: ["en", "ar", "fr"],
  stages: [DetectionStage.USER_LANG, DetectionStage.PATH_LANG, DetectionStage.COOKIE, DetectionStage.DEFAULT],
});

// result.lang = 'ar'
// result.detectedBy = 'USER_LANG'
// result.isRTL = true
```

---

## Configuration Reference

### Supported Languages (Default)

15 languages out of the box:

| Code | Language   | RTL |
| ---- | ---------- | --- |
| `ar` | Arabic     | Yes |
| `en` | English    | No  |
| `hi` | Hindi      | No  |
| `es` | Spanish    | No  |
| `zh` | Chinese    | No  |
| `bn` | Bengali    | No  |
| `pt` | Portuguese | No  |
| `ru` | Russian    | No  |
| `fr` | French     | No  |
| `ur` | Urdu       | Yes |
| `de` | German     | No  |
| `it` | Italian    | No  |
| `ja` | Japanese   | No  |
| `ko` | Korean     | No  |
| `tr` | Turkish    | No  |

Override with `supportedLanguages: ['en', 'ar', 'fr']`.

---

### Geo-to-Language Map (Default)

45+ country-to-language mappings built in:

| Countries                                                              | Language          |
| ---------------------------------------------------------------------- | ----------------- |
| US, GB, CA, AU, NZ, IE, ZA                                             | English (`en`)    |
| EG, SA, AE, JO, KW, QA, LY, MA, SD, OM, BH, TN, DZ, IQ, LB, SY, YE, PS | Arabic (`ar`)     |
| DE, AT, CH                                                             | German (`de`)     |
| FR, BE                                                                 | French (`fr`)     |
| ES, MX, CO, PE, VE, CL, AR                                             | Spanish (`es`)    |
| IT                                                                     | Italian (`it`)    |
| PT, BR                                                                 | Portuguese (`pt`) |
| RU, BY, KZ                                                             | Russian (`ru`)    |
| JP                                                                     | Japanese (`ja`)   |
| KR                                                                     | Korean (`ko`)     |
| CN, TW, HK                                                             | Chinese (`zh`)    |
| IN                                                                     | Hindi (`hi`)      |
| BD                                                                     | Bengali (`bn`)    |
| PK                                                                     | Urdu (`ur`)       |
| TR                                                                     | Turkish (`tr`)    |

Override with `geoToLang: { US: 'en', EG: 'ar', ... }`.

---

### RTL Languages

`ar` (Arabic) and `ur` (Urdu) are detected as RTL. The `isRTL` flag is set automatically in every `IDetectionResult`.

---

### Full Config Example

```ts
import { langDetectMiddleware, DetectionStage } from "@posty5/lang-detect";

app.use(
  langDetectMiddleware({
    // Only support these languages
    supportedLanguages: ["en", "ar", "fr", "de", "es", "tr"],

    // Custom detection order
    stages: [
      DetectionStage.PATH_LANG,
      DetectionStage.QUERY_LANG,
      DetectionStage.COOKIE,
      DetectionStage.USER_LANG,
      DetectionStage.GEO_PATH,
      DetectionStage.ACCEPT_LANGUAGE,
      // DEFAULT auto-appended
    ],

    // Custom country → language map
    geoToLang: {
      US: "en",
      GB: "en",
      CA: "en",
      EG: "ar",
      SA: "ar",
      AE: "ar",
      DE: "de",
      FR: "fr",
      ES: "es",
      TR: "tr",
    },

    // Cookie configuration
    cookieKeys: ["user_lang", "lang"],
    setCookie: true,
    cookieOptions: {
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      httpOnly: false,
      sameSite: "lax",
      secure: true,
    },

    // Query string keys
    queryLangKeys: ["lang", "language"],
    geoQueryKeys: ["locale", "country"],

    // URL path segment (0 = first segment after /)
    pathSegmentIndex: 0,

    // Default fallback
    defaultLanguage: "en",

    // IP → country resolver
    geoDetector: async (ip) => {
      const res = await fetch(`https://your-api.com/geo?ip=${ip}`);
      const data = await res.json();
      return data.country ?? null;
    },

    // Extract logged-in user language
    userLangResolver: (req, res) => res.locals.user?.lang ?? null,
  }),
);
```

---

## Advanced Usage

### Single Stage Only

Run only one detection stage:

```ts
const result = await detectLanguage(context, {
  stages: [DetectionStage.COOKIE],
});
// Only checks cookie. If no cookie → falls back to DEFAULT (auto-appended).
```

---

### Custom Strategy

Extend detection with your own strategy class:

```ts
import { IDetectionStrategy, IDetectionContext, IResolvedConfig, DetectionStage, getStrategy } from "@posty5/lang-detect";

// Example: detect from a custom header
class CustomHeaderStrategy implements IDetectionStrategy {
  readonly stage = DetectionStage.COOKIE; // reuse an existing stage slot

  detect(context: IDetectionContext, config: IResolvedConfig): string | null {
    const headerLang = context.headers["x-user-language"];
    if (headerLang && config.supportedLanguages.includes(headerLang.toLowerCase())) {
      return headerLang.toLowerCase();
    }
    return null;
  }
}
```

---

### Custom Geo-to-Language Map

Override the default mapping entirely:

```ts
const result = await detectLanguage(context, {
  geoToLang: {
    US: "en",
    MX: "es",
    BR: "pt",
    EG: "ar",
    // ... your custom mappings
  },
});
```

Or extend the defaults:

```ts
import { DEFAULT_GEO_TO_LANG } from "@posty5/lang-detect";

const result = await detectLanguage(context, {
  geoToLang: {
    ...DEFAULT_GEO_TO_LANG,
    // Add or override
    FI: "fi",
    SE: "sv",
  },
  supportedLanguages: [...DEFAULT_SUPPORTED_LANGUAGES, "fi", "sv"],
});
```

---

## How Detection Works

```
detectLanguage(context, config)
    │
    ├─ 1. Merge user config with defaults (resolveConfig)
    │
    ├─ 2. For each stage in config.stages (in order):
    │      │
    │      ├─ Get strategy instance from registry
    │      ├─ Call strategy.detect(context, resolvedConfig)
    │      │
    │      ├─ If result is non-null AND is in supportedLanguages:
    │      │   └─ RETURN { lang, detectedBy: stage, isRTL }
    │      │
    │      └─ If result is null:
    │          └─ Continue to next stage
    │
    └─ 3. If no stage matched (shouldn't happen — DEFAULT always matches):
           └─ Return { lang: defaultLanguage, detectedBy: DEFAULT, isRTL }
```

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Build
npm run build
```

### Manual Testing with Test App

```bash
npx ts-node tests/test-app.ts
```

Then in another terminal:

```bash
# Path language
curl http://localhost:3456/en/page
# → {"lang":"en","detectedBy":"PATH_LANG","isRTL":false}

# Query string
curl http://localhost:3456/page?lang=ar
# → {"lang":"ar","detectedBy":"QUERY_LANG","isRTL":true}

# Geo path
curl http://localhost:3456/us/page
# → {"lang":"en","detectedBy":"GEO_PATH","isRTL":false}

# Geo query
curl "http://localhost:3456/page?locale=eg"
# → {"lang":"ar","detectedBy":"GEO_QUERY","isRTL":true}

# Cookie
curl -H "Cookie: lang=fr" http://localhost:3456/page
# → {"lang":"fr","detectedBy":"COOKIE","isRTL":false}

# Accept-Language header
curl -H "Accept-Language: es,en;q=0.9" http://localhost:3456/page
# → {"lang":"es","detectedBy":"ACCEPT_LANGUAGE","isRTL":false}

# Default fallback
curl http://localhost:3456/page
# → {"lang":"en","detectedBy":"DEFAULT","isRTL":false}
```

---

## License

MIT &copy; [Posty5](https://posty5.com)
