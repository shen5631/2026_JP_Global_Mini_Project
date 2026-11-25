import { getAccessToken } from "./authApi";

const translationCache = new Map();
const MAX_CACHE_ENTRIES = 600;

async function requestTranslations(texts, targetLanguage) {
  const token = getAccessToken();
  if (!token) throw new Error("Authentication required");

  const response = await fetch("/api/translations", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ texts, targetLanguage }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message || `HTTP ${response.status}`);
  }
  if (
    !Array.isArray(result?.translations) ||
    result.translations.length !== texts.length ||
    result.translations.some((text) => typeof text !== "string")
  ) {
    throw new Error("Invalid translation response");
  }
  return result.translations;
}

export async function translateTexts(texts, targetLanguage) {
  if (!getAccessToken()) return texts;

  const uniqueTexts = [...new Set(texts.filter((text) => text.trim() !== ""))];
  const uncachedTexts = uniqueTexts.filter(
    (text) => !translationCache.has(`${targetLanguage}:${text}`),
  );

  if (uncachedTexts.length > 0) {
    const translated = await requestTranslations(uncachedTexts, targetLanguage);
    translated.forEach((text, index) => {
      const key = `${targetLanguage}:${uncachedTexts[index]}`;
      translationCache.set(key, text);
      if (translationCache.size > MAX_CACHE_ENTRIES) {
        translationCache.delete(translationCache.keys().next().value);
      }
    });
  }

  return texts.map((text) =>
    text.trim() === ""
      ? text
      : translationCache.get(`${targetLanguage}:${text}`) ?? text,
  );
}
