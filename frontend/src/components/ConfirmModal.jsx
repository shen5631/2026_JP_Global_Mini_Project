import { useEffect, useId } from "react";
import { useI18n } from "../i18n";

const css = `
.modal {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --text: #1f1d1b;

  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(20, 20, 20, 0.5);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.modal *, .modal *::before, .modal *::after { box-sizing: border-box; }

.modal__box {
  width: 100%;
  max-width: 342px;
  padding: 28px 24px 20px;
  border-radius: 20px;
  background: #ffffff;
  color: var(--text);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}
.modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}
.modal__message {
  margin: 12px 0 0;
  color: #555555;
  font-size: 15px;
  line-height: 1.65;
  word-break: keep-all;
}
.modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.modal__btn {
  flex: 1;
  height: 52px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.modal__btn:disabled { opacity: 0.6; cursor: default; }
.modal__btn--cancel {
  border: 1px solid var(--gray-100);
  background: #ffffff;
  color: #555555;
}
.modal__btn--confirm {
  border: 0;
  background: var(--primary);
  color: #ffffff;
}
.modal__btn--confirm:active:not(:disabled) { filter: brightness(0.94); }
.modal__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;

/**
 * P-017 참여 신청 확인 모달 (공통 확인 모달로 재사용 가능)
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const { t } = useI18n();

  // ESC 로 닫기
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, onCancel]);

  return (
    <div className="modal" onClick={loading ? undefined : onCancel}>
      <style>{css}</style>
      <div
        className="modal__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="modal__title">
          {t(title)}
        </h2>
        <p className="modal__message">{t(message)}</p>
        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn modal__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {t(cancelLabel)}
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t("처리 중...") : t(confirmLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}
