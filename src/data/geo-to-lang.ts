/**
 * Default mapping of ISO 3166-1 alpha-2 country codes (uppercase) to language codes.
 * Union of all Posty5 projects' GEO_TO_LANG maps.
 */
export const DEFAULT_GEO_TO_LANG: Record<string, string> = {
  // English-speaking
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",

  // Arabic-speaking
  EG: "ar",
  SA: "ar",
  AE: "ar",
  JO: "ar",
  KW: "ar",
  QA: "ar",
  LY: "ar",
  MA: "ar",
  SD: "ar",
  OM: "ar",
  BH: "ar",
  TN: "ar",
  DZ: "ar",
  IQ: "ar",
  LB: "ar",
  SY: "ar",
  YE: "ar",
  PS: "ar",

  // European
  DE: "de",
  AT: "de",
  CH: "de",
  FR: "fr",
  BE: "fr",
  ES: "es",
  MX: "es",
  CO: "es",
  PE: "es",
  VE: "es",
  CL: "es",
  AR: "es",
  IT: "it",
  PT: "pt",
  BR: "pt",
  RU: "ru",
  BY: "ru",
  KZ: "ru",

  // Asian
  JP: "ja",
  KR: "ko",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  IN: "hi",
  BD: "bn",
  PK: "ur",
  TR: "tr",
};
