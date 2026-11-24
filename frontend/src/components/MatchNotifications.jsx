import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useI18n } from "../i18n";
import { clearAuth, getAccessToken } from "../api/authApi";
import {
  fetchUnreadNotifications,
  markNotificationRead,
} from "../api/notification";

export default function MatchNotifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!getAccessToken()) {
      return;
    }
    try {
      const result = await fetchUnreadNotifications();
      setNotifications(Array.isArray(result) ? result : []);
      setError("");
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        setNotifications([]);
        navigate("/", { replace: true });
        return;
      }
      setError(t(e.message || "알림을 불러오지 못했어요."));
    }
  }, [navigate, t]);

  useEffect(() => {
    const initialLoadId = window.setTimeout(loadNotifications, 0);
    const timerId = window.setInterval(loadNotifications, 15000);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(timerId);
    };
  }, [loadNotifications, location.pathname]);

  async function acknowledge(notification) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await markNotificationRead(notification.notificationId);
      setNotifications((current) =>
        current.filter((item) => item.notificationId !== notification.notificationId),
      );
      if (notification.boardDecisionRequired) {
        navigate("/mypage");
      }
    } catch (e) {
      setError(t(e.message || "알림을 확인 처리하지 못했어요."));
    } finally {
      setBusy(false);
    }
  }

  const current = notifications[0];
  const canceledByMatch = current?.message.match(/^(.*)님이 매칭을 취소했어요\.$/);
  if ((!current && !error) || !getAccessToken()) return null;

  return (
    <aside className="match-notice" aria-live="polite">
      <style>{css}</style>
      <div className="match-notice__card">
        <strong className="match-notice__title">
          {current ? t("매칭 알림") : t("알림")}
        </strong>
        <p className="match-notice__message">
          {current
            ? canceledByMatch
              ? t("{name}님이 매칭을 취소했어요.", { name: canceledByMatch[1] })
              : t(current.message)
            : error}
        </p>
        {current && (
          <button
            type="button"
            className="match-notice__action"
            onClick={() => acknowledge(current)}
            disabled={busy}
          >
            {busy
              ? t("처리 중...")
              : current.boardDecisionRequired
                ? t("모집글 처리하기")
                : t("확인")}
          </button>
        )}
      </div>
    </aside>
  );
}

const css = `
.match-notice {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: 50%;
  z-index: 200;
  width: min(390px, calc(100% - 32px));
  transform: translateX(-50%);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.match-notice__card {
  padding: 16px;
  border: 1px solid #f1d4c6;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 28px rgba(31, 29, 27, 0.16);
}
.match-notice__title { color: #ee6c26; font-size: 14px; }
.match-notice__message {
  margin: 8px 0 12px;
  color: #333333;
  font-size: 14px;
  line-height: 1.5;
}
.match-notice__action {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: #ee6c26;
  color: #ffffff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.match-notice__action:disabled { opacity: 0.6; cursor: default; }
`;
