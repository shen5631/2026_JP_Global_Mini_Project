import { getAccessToken } from "../api/authApi";
import { useI18n } from "../i18n";

export default function TranslationNotice({ failed, hasContent }) {
  const { t } = useI18n();
  if (!hasContent || !getAccessToken()) return null;

  return (
    <>
      <style>{css}</style>
      <p className="translation-notice" role="status">
        {t("게시글과 채팅 내용은 DeepL 번역을 위해 외부 서버로 전송됩니다.")}
        {failed && (
          <>
            <br />
            {t("일부 내용을 번역하지 못했어요. 원문을 표시합니다.")}
          </>
        )}
      </p>
    </>
  );
}

const css = `
.translation-notice {
  margin: 12px 20px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8f8f8;
  color: #777777;
  font-size: 12px;
  line-height: 1.6;
}
.detail__main .translation-notice,
.chat__list .translation-notice,
.mypage__section .translation-notice {
  margin: 8px 0;
  padding: 8px 10px;
}
`;
