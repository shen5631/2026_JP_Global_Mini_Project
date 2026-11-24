import { useEffect, useState } from "react";
import { translateTexts } from "../api/translation";

export function useTranslatedTexts(texts, targetLanguage) {
  const requestKey = JSON.stringify([targetLanguage, texts]);
  const [result, setResult] = useState(null);
  const [, currentTexts] = JSON.parse(requestKey);

  useEffect(() => {
    const [language, requestTexts] = JSON.parse(requestKey);
    let active = true;
    translateTexts(requestTexts, language)
      .then((translatedTexts) => {
        if (active) {
          setResult({
            key: requestKey,
            texts: translatedTexts,
            failed: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            key: requestKey,
            texts: requestTexts,
            failed: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [requestKey]);

  const currentResult = result?.key === requestKey ? result : null;
  return {
    texts: currentResult?.texts ?? currentTexts,
    failed: currentResult?.failed ?? false,
  };
}
