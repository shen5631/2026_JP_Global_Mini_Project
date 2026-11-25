import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  cancelAppointment as cancelAppointmentRequest,
  fetchAppointment,
  fetchMessages,
  saveAppointment as saveAppointmentRequest,
  sendMessage,
} from "../api/chat";
import { clearAuth } from "../api/authApi";
import { useI18n } from "../i18n";
import { useTranslatedTexts } from "../hooks/useTranslatedTexts";
import TranslationNotice from "../components/TranslationNotice";

const POLL_MS = 3000; // 3초마다 새 메시지 확인

function formatTime(value, lang) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(lang === "ja" ? "ja-JP" : "ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAppointment(at, lang) {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  const locale = lang === "ja" ? "ja-JP" : "ko-KR";
  const date = d.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  return `${date} ${formatTime(at, lang)}`;
}

// datetime-local 의 min 값 (현재 시각)
function nowForInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// ESC 로 닫기
function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

// 상대 프로필: 매칭 완료 화면에서 state 로 넘겨받고, 새로고침해도 남도록 sessionStorage 에 보관해요
function loadPartner(chatRoomId, fromState) {
  const key = `chat_partner_${chatRoomId}`;
  let p = fromState;
  if (p) {
    try {
      sessionStorage.setItem(key, JSON.stringify(p));
    } catch {
      /* 저장 못 해도 괜찮아요 */
    }
  } else {
    try {
      p = JSON.parse(sessionStorage.getItem(key));
    } catch {
      p = null;
    }
  }
  if (!p) return null;
  return {
    nickname: p.userNickname ?? p.nickname ?? "상대방",
    age: p.userAge ?? p.age ?? null,
    userLocal: p.userLocal ?? false,
    country: p.userCountry ?? p.country ?? "",
  };
}

/**
 * P-011 매칭 채팅 화면 (+ P-020 채팅 종료 안내 모달)
 * 라우트: <Route path="/chats/:id" element={<ChatRoomPage />} />
 */
export default function ChatRoomPage() {
  const { id: chatRoomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useI18n();
  const partner = loadPartner(chatRoomId, location.state?.partner);

  const [loadState, setLoadState] = useState("loading"); // loading | ready | error | forbidden
  const [reload, setReload] = useState(0);
  const [status, setStatus] = useState("active"); // active | inactive
  const [messages, setMessages] = useState([]); // 서버 메시지
  const [notices, setNotices] = useState([]); // 화면에서만 보이는 안내 문구
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [appointment, setAppointment] = useState(null);
  const [appointmentError, setAppointmentError] = useState("");
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [appointmentCanceling, setAppointmentCanceling] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false); // P-020

  const listRef = useRef(null);
  const prevCount = useRef(0);
  const active = status === "active";
  const translatedMessages = useTranslatedTexts(
    messages.map((message) => message.text),
    lang,
  );

  const goLogin = useCallback(() => {
    clearAuth();
    navigate("/", { replace: true });
  }, [navigate]);

  const markInactive = useCallback(() => {
    setStatus((prev) => {
      if (prev === "active") setEndOpen(true); // 처음 종료됐을 때만 안내 모달
      return "inactive";
    });
  }, []);

  // 메시지 불러오기 + 3초마다 새 메시지 확인
  useEffect(() => {
    let stopped = false;
    let timer;

    const tick = async () => {
      try {
        const [messageData, appointmentData] = await Promise.all([
          fetchMessages(chatRoomId),
          fetchAppointment(chatRoomId),
        ]);
        if (stopped) return;
        setMessages(messageData.messages);
        setAppointment(appointmentData.appointment);
        setLoadState("ready");
        if (messageData.active === false || appointmentData.active === false) {
          markInactive();
          return; // 종료된 방은 더 이상 새로 확인하지 않아요
        }
      } catch (e) {
        if (stopped) return;
        if (e.status === 401) return goLogin();
        if (e.status === 403 || e.status === 404)
          return setLoadState("forbidden");
        if (loadState !== "ready") return setLoadState("error");
        // 이미 불러온 뒤의 일시적인 오류는 다음 확인 때 다시 시도해요
      }
      timer = setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId, reload, goLogin, markInactive]);

  const items = [
    ...messages.map((m, index) => ({
      ...m,
      text: translatedMessages.texts[index] ?? m.text,
      time: formatTime(m.sentAt, lang),
    })),
    ...notices,
  ];

  // 메시지가 늘어났을 때만 맨 아래로 (위로 스크롤해서 보는 중에는 그대로 둬요)
  useEffect(() => {
    const el = listRef.current;
    if (el && items.length !== prevCount.current)
      el.scrollTop = el.scrollHeight;
    prevCount.current = items.length;
  }, [items.length]);

  async function send() {
    const value = text.trim();
    if (!value || !active || sending) return;
    setSending(true);
    setSendError("");
    setText("");
    try {
      await sendMessage(chatRoomId, value);
    } catch (e) {
      setSending(false);
      if (e.status === 401) return goLogin();
      if (e.status === 409 || e.status === 410) return markInactive(); // 종료된 채팅방
      setText(value); // 실패하면 입력한 내용을 돌려줘요
      const lengthError = e.message?.match(/^메시지는 (\d+)자 이내로 입력해주세요$/);
      setSendError(
        lengthError
          ? t("메시지는 {max}자 이내로 입력해주세요", { max: lengthError[1] })
          : t(e.message || "메시지를 보내지 못했어요. 다시 시도해주세요."),
      );
      return;
    }
    try {
      const { messages: list } = await fetchMessages(chatRoomId);
      setMessages(list);
    } catch {
      /* 다음 3초 확인 때 가져와요 */
    }
    setSending(false);
  }

  function onKeyDown(e) {
    // 한글 입력 중(조합 중)에는 전송하지 않아요
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  async function saveAppointment(next) {
    if (appointmentSaving) return;
    setAppointmentSaving(true);
    setAppointmentError("");
    try {
      const saved = await saveAppointmentRequest(chatRoomId, next);
      setAppointment(saved);
      setApptOpen(false);
      setNotices((prev) => [
        ...prev,
        {
          id: `n${Date.now()}`,
          from: "system",
          kind: "appointment-saved",
          appointment: formatAppointment(saved.at, lang),
          place: saved.place,
        },
      ]);
    } catch (e) {
      if (e.status === 401) return goLogin();
      if (e.status === 403 || e.status === 404) {
        setLoadState("forbidden");
        setApptOpen(false);
        return;
      }
      if (e.status === 410) {
        markInactive();
        setApptOpen(false);
        return;
      }
      setAppointmentError(
        t(e.message || "약속을 저장하지 못했어요. 다시 시도해주세요."),
      );
    } finally {
      setAppointmentSaving(false);
    }
  }

  async function cancelAppointment() {
    if (appointmentCanceling) return;
    setAppointmentCanceling(true);
    setAppointmentError("");
    try {
      await cancelAppointmentRequest(chatRoomId);
      setAppointment(null);
      setStatus("inactive");
      setCancelOpen(false);
      setEndOpen(true);
    } catch (e) {
      if (e.status === 401) return goLogin();
      if (e.status === 403 || e.status === 404) {
        setLoadState("forbidden");
        setCancelOpen(false);
        return;
      }
      if (e.status === 410) {
        markInactive();
        setCancelOpen(false);
        return;
      }
      setAppointmentError(
        t(e.message || "약속을 취소하지 못했어요. 다시 시도해주세요."),
      );
    } finally {
      setAppointmentCanceling(false);
    }
  }

  return (
    <div className="chat">
      <style>{css}</style>

      {/* 상단 */}
      <header className="chat__header">
        <button
          type="button"
          className="chat__icon"
          aria-label={t("뒤로 가기")}
          onClick={() => navigate("/chats")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 12H4" />
            <path d="M10 6l-6 6 6 6" />
          </svg>
        </button>
        <h1 className="chat__name">{partner?.nickname ?? t("채팅방")}</h1>
        {partner && (
          <button
            type="button"
            className="chat__profile-btn"
            onClick={() => setProfileOpen(true)}
          >
            {t("프로필")}
          </button>
        )}
      </header>

      {/* 약속 / 상태 배너 */}
      {!active ? (
        <div className="chat__banner chat__banner--off" role="status">
          {t("종료된 채팅방이에요. 대화 내역은 종료 후 24시간 뒤에 삭제돼요.")}
        </div>
      ) : appointment ? (
        <section className="chat__appt" aria-label={t("약속 정보")}>
          <div className="chat__appt-info">
            <span className="chat__appt-label">{t("약속")}</span>
            <span className="chat__appt-main">
              {formatAppointment(appointment.at, lang)}
            </span>
            <span className="chat__appt-sub">{appointment.place}</span>
          </div>
          <div className="chat__appt-actions">
            <button
              type="button"
              className="chat__chip"
              onClick={() => {
                setAppointmentError("");
                setApptOpen(true);
              }}
            >
              {t("변경")}
            </button>
            <button
              type="button"
              className="chat__chip chat__chip--danger"
              onClick={() => setCancelOpen(true)}
            >
              {t("취소")}
            </button>
          </div>
        </section>
      ) : (
        <div className="chat__banner" role="status">
          <p className="chat__banner-text">
            <strong>{t("약속 시간과 장소를 정해주세요")}</strong>
            <span>{t("매칭 후 24시간 안에 등록하지 않으면 채팅방이 종료돼요.")}</span>
          </p>
          <button
            type="button"
            className="chat__banner-btn"
            onClick={() => {
              setAppointmentError("");
              setApptOpen(true);
            }}
          >
            {t("약속 설정")}
          </button>
        </div>
      )}

      {/* 메시지 목록 */}
      <main className="chat__list" ref={listRef} aria-live="polite">
        <TranslationNotice
          failed={translatedMessages.failed}
          hasContent={messages.length > 0}
        />
        {loadState === "loading" && (
          <p className="chat__state">{t("불러오는 중...")}</p>
        )}

        {loadState === "error" && (
          <div className="chat__state">
            <p>{t("대화를 불러오지 못했어요.")}</p>
            <button
              type="button"
              className="chat__retry"
              onClick={() => {
                setLoadState("loading");
                setReload((n) => n + 1);
              }}
            >
              {t("다시 시도")}
            </button>
          </div>
        )}

        {loadState === "forbidden" && (
          <div className="chat__state">
            <p>{t("접근할 수 없는 채팅방이에요.")}</p>
            <button
              type="button"
              className="chat__retry"
              onClick={() => navigate("/home")}
            >
              {t("홈으로")}
            </button>
          </div>
        )}

        {loadState === "ready" &&
          items.map((m) =>
            m.from === "system" ? (
              <p key={m.id} className="chat__system">
                {m.kind === "appointment-saved"
                  ? t("약속이 등록되었어요. {appointment} · {place}", {
                      appointment: m.appointment,
                      place: m.place,
                    })
                  : m.text}
              </p>
            ) : (
              <div
                key={m.id}
                className={`chat__row ${m.from === "me" ? "chat__row--me" : ""}`}
              >
                <span className="chat__bubble">{m.text}</span>
                <span className="chat__time">{m.time}</span>
              </div>
            ),
          )}
      </main>

      {sendError && (
        <p className="chat__send-error" role="alert">
          {sendError}
        </p>
      )}

      {/* 입력창 */}
      <footer className="chat__input">
        {active ? (
          <>
            <textarea
              className="chat__field"
              rows={1}
              placeholder={t("메시지를 입력해주세요")}
              aria-label={t("메시지 입력")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loadState !== "ready"}
            />
            <button
              type="button"
              className="chat__send"
              aria-label={t("보내기")}
              disabled={!text.trim() || sending || loadState !== "ready"}
              onClick={send}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3.4 20.4l17.4-7.5c.8-.3.8-1.5 0-1.8L3.4 3.6c-.7-.3-1.4.4-1.2 1.1L3.9 11l8.5 1-8.5 1-1.7 6.3c-.2.7.5 1.4 1.2 1.1z" />
              </svg>
            </button>
          </>
        ) : (
          <p className="chat__off">
            {t("종료된 채팅방에서는 메시지를 보낼 수 없어요.")}
          </p>
        )}
      </footer>

      {profileOpen && partner && (
        <ProfileSheet partner={partner} onClose={() => setProfileOpen(false)} />
      )}
      {apptOpen && (
        <AppointmentSheet
          initial={appointment}
          onSave={saveAppointment}
          error={appointmentError}
          saving={appointmentSaving}
          onClose={() => setApptOpen(false)}
        />
      )}
      {cancelOpen && (
        <Dialog
          title={t("약속을 취소하시겠어요?")}
          message={t("약속을 취소하면 채팅방이 바로 종료되고, 더 이상 메시지를 보낼 수 없어요.")}
          confirmLabel={t("약속 취소")}
          cancelLabel={t("돌아가기")}
          onConfirm={cancelAppointment}
          error={appointmentError}
          loading={appointmentCanceling}
          onClose={() => setCancelOpen(false)}
        />
      )}
      {/* P-020 채팅 종료 안내 모달 */}
      {endOpen && (
        <Dialog
          title={t("채팅이 종료되었어요")}
          message={t("이 채팅방에서는 더 이상 메시지를 보낼 수 없어요. 기존 대화 내역은 종료 후 24시간 동안만 볼 수 있어요.")}
          confirmLabel={t("확인")}
          onConfirm={() => setEndOpen(false)}
          onClose={() => setEndOpen(false)}
        />
      )}
    </div>
  );
}

/* ───────── 상대방 프로필 (바텀시트) ───────── */
function ProfileSheet({ partner, onClose }) {
  const { t } = useI18n();
  useEscape(onClose);
  return (
    <div className="sheet" onClick={onClose}>
      <div
        className="sheet__box"
        role="dialog"
        aria-modal="true"
        aria-label={t("상대방 프로필")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grab" aria-hidden="true" />
        <div className="profile">
          <div className="profile__avatar" aria-hidden="true">
            {partner.nickname.charAt(0)}
          </div>
          <h2 className="profile__name">{partner.nickname}</h2>
          <dl className="profile__meta">
            <div>
              <dt>{t("유형")}</dt>
              <dd>{t(partner.userLocal ? "현지인" : "여행객")}</dd>
            </div>
            <div>
              <dt>{t("나이")}</dt>
              <dd>{partner.age}{t("세")}</dd>
            </div>
            {!partner.userLocal && partner.country && (
              <div>
                <dt>{t("국가")}</dt>
                <dd>
                  {{
                    KR: t("대한민국"),
                    JP: t("일본"),
                    CN: t("중국"),
                    US: t("미국"),
                  }[partner.country] ?? partner.country}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <button
          type="button"
          className="sheet__btn sheet__btn--ghost"
          onClick={onClose}
        >
          {t("닫기")}
        </button>
      </div>
    </div>
  );
}

/* ───────── 약속 설정 (바텀시트) ───────── */
function AppointmentSheet({ initial, onSave, onClose, error, saving }) {
  const { t } = useI18n();
  useEscape(onClose);
  const [place, setPlace] = useState(initial?.place ?? "");
  const [at, setAt] = useState(initial?.at ?? "");
  const valid = place.trim() !== "" && at !== "" && new Date(at) > new Date();

  return (
    <div className="sheet" onClick={onClose}>
      <form
        className="sheet__box"
        role="dialog"
        aria-modal="true"
        aria-label={t("약속 설정")}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave({ place: place.trim(), at });
        }}
      >
        <div className="sheet__grab" aria-hidden="true" />
        <h2 className="sheet__title">{t("약속 설정")}</h2>
        <p className="sheet__desc">
          {t("채팅으로 정한 식사 장소와 시간을 등록해주세요.")}
        </p>
        {error && (
          <p className="sheet__error" role="alert">
            {error}
          </p>
        )}

        <div className="sheet__field">
          <label htmlFor="appt-place">{t("약속 장소")}</label>
          <input
            id="appt-place"
            type="text"
            maxLength={50}
            placeholder={t("예: 도톤보리 타코야키 가게")}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>
        <div className="sheet__field">
          <label htmlFor="appt-at">{t("약속 시간")}
          </label>
          <input
            id="appt-at"
            type="datetime-local"
            min={nowForInput()}
            value={at}
            onChange={(e) => setAt(e.target.value)}
          />
        </div>

        <div className="sheet__actions">
          <button
            type="button"
            className="sheet__btn sheet__btn--ghost"
            onClick={onClose}
            disabled={saving}
          >
            {t("취소")}
          </button>
          <button
            type="submit"
            className="sheet__btn"
            disabled={!valid || saving}
          >
            {saving ? t("저장 중...") : t("등록하기")}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────── 확인 / 안내 모달 ───────── */
function Dialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  error,
  loading = false,
  onConfirm,
  onClose,
}) {
  const { t } = useI18n();
  useEscape(onClose);
  return (
    <div className="dialog" onClick={onClose}>
      <div
        className="dialog__box"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog__title">{t(title)}</h2>
        <p className="dialog__msg">{t(message)}</p>
        {error && (
          <p className="dialog__error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog__actions">
          {cancelLabel && (
            <button
              type="button"
              className="dialog__btn dialog__btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              {t(cancelLabel)}
            </button>
          )}
          <button
            type="button"
            className="dialog__btn"
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

const css = `
.chat {
  --primary: #ee6c26;
  --primary-soft: #fdeadd;
  --gray-100: #ededed;
  --gray-300: #d4d4d4;
  --gray-500: #949494;
  --gray-600: #777777;
  --text: #1f1d1b;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
  -webkit-tap-highlight-color: transparent;
}
.chat *, .chat *::before, .chat *::after,
.sheet *, .sheet *::before, .sheet *::after,
.dialog *, .dialog *::before, .dialog *::after { box-sizing: border-box; }

/* 상단 */
.chat__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  height: calc(env(safe-area-inset-top, 0px) + 56px);
  padding: env(safe-area-inset-top, 0px) 8px 0;
  border-bottom: 1px solid var(--gray-100);
  background: #ffffff;
}
.chat__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  background: none;
  color: var(--text);
  cursor: pointer;
}
.chat__name {
  flex: 1;
  margin: 0;
  overflow: hidden;
  font-size: 17px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat__profile-btn {
  height: 36px;
  margin-right: 8px;
  padding: 0 14px;
  border: 1px solid var(--gray-300);
  border-radius: 999px;
  background: #ffffff;
  color: var(--gray-600);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* 배너 / 약속 */
.chat__banner {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--primary-soft);
}
.chat__banner--off {
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: 13px;
  line-height: 1.5;
}
.chat__banner-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  font-size: 12px;
  color: var(--gray-600);
  line-height: 1.4;
}
.chat__banner-text strong { color: var(--text); font-size: 14px; }
.chat__banner-btn {
  flex-shrink: 0;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.chat__appt {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-100);
  background: var(--primary-soft);
}
.chat__appt-info { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.chat__appt-label { color: var(--primary); font-size: 12px; font-weight: 700; }
.chat__appt-main { font-size: 15px; font-weight: 700; }
.chat__appt-sub {
  overflow: hidden;
  color: var(--gray-600);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat__appt-actions { display: flex; flex-shrink: 0; gap: 6px; }
.chat__chip {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--primary);
  border-radius: 999px;
  background: #ffffff;
  color: var(--primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.chat__chip--danger { border-color: var(--gray-300); color: var(--gray-600); }

/* 메시지 */
.chat__list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  overflow-y: auto;
}
.chat__system {
  align-self: center;
  max-width: 90%;
  margin: 4px 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
}
.chat__row { display: flex; align-items: flex-end; gap: 6px; }
.chat__row--me { flex-direction: row-reverse; }
.chat__bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 18px 18px 18px 6px;
  background: var(--gray-100);
  font-size: 15px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
.chat__row--me .chat__bubble {
  border-radius: 18px 18px 6px 18px;
  background: var(--primary);
  color: #ffffff;
}
.chat__time { flex-shrink: 0; color: var(--gray-500); font-size: 11px; }

/* 불러오기 상태 / 전송 오류 */
.chat__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: auto;
  color: var(--gray-500);
  font-size: 14px;
  text-align: center;
}
.chat__state p { margin: 0; }
.chat__retry {
  height: 44px;
  padding: 0 20px;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.chat__send-error {
  flex-shrink: 0;
  margin: 0;
  padding: 6px 16px;
  background: #ffffff;
  color: var(--primary);
  font-size: 12px;
}

/* 입력창 */
.chat__input {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px calc(env(safe-area-inset-bottom, 0px) + 12px);
  border-top: 1px solid var(--gray-100);
  background: #ffffff;
}
.chat__field {
  flex: 1;
  max-height: 120px;
  min-height: 44px;
  padding: 11px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 22px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.4;
  outline: none;
  resize: none;
}
.chat__field::placeholder { color: var(--gray-500); }
.chat__field:focus { border-color: var(--primary); }
.chat__send {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  cursor: pointer;
}
.chat__send:disabled { background: #dadada; cursor: default; }
.chat__off {
  flex: 1;
  margin: 0;
  padding: 12px 0;
  color: var(--gray-500);
  font-size: 13px;
  text-align: center;
}

/* 바텀시트 */
.sheet {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(20, 20, 20, 0.5);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
  color: #1f1d1b;
}
.sheet__box {
  width: 100%;
  max-width: 430px;
  padding: 10px 20px calc(env(safe-area-inset-bottom, 0px) + 24px);
  border-radius: 24px 24px 0 0;
  background: #ffffff;
}
.sheet__grab {
  width: 40px;
  height: 4px;
  margin: 0 auto 16px;
  border-radius: 2px;
  background: #d9d9d9;
}
.sheet__title { margin: 0; font-size: 18px; font-weight: 700; }
.sheet__desc { margin: 6px 0 20px; color: #777777; font-size: 14px; }
.sheet__error {
  margin: -10px 0 16px;
  color: #d33a2c;
  font-size: 13px;
}
.sheet__field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.sheet__field label { color: #ee6c26; font-size: 14px; font-weight: 700; }
.sheet__field input {
  width: 100%;
  height: 52px;
  padding: 0 18px;
  border: 1px solid #d4d4d4;
  border-radius: 16px;
  background: #ffffff;
  color: #1f1d1b;
  font-family: inherit;
  font-size: 16px;
  outline: none;
}
.sheet__field input:focus { border-color: #ee6c26; }
.sheet__actions { display: flex; gap: 10px; margin-top: 8px; }
.sheet__btn {
  flex: 1;
  height: 52px;
  border: 0;
  border-radius: 16px;
  background: #ee6c26;
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.sheet__btn:disabled { background: #dadada; cursor: default; }
.sheet__btn--ghost {
  border: 1px solid #ededed;
  background: #ffffff;
  color: #777777;
  font-weight: 500;
}

/* 프로필 */
.profile { display: flex; flex-direction: column; align-items: center; padding: 8px 0 24px; }
.profile__avatar {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: #fdeadd;
  color: #ee6c26;
  font-size: 32px;
  font-weight: 700;
}
.profile__name { margin: 14px 0 0; font-size: 20px; font-weight: 700; }
.profile__meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin: 20px 0 0;
  padding: 16px;
  border: 1px solid #ededed;
  border-radius: 16px;
}
.profile__meta > div { display: flex; justify-content: space-between; font-size: 15px; }
.profile__meta dt { color: #777777; }
.profile__meta dd { margin: 0; font-weight: 700; }

/* 확인 / 안내 모달 */
.dialog {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(20, 20, 20, 0.5);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
  color: #1f1d1b;
}
.dialog__box {
  width: 100%;
  max-width: 342px;
  padding: 28px 24px 20px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}
.dialog__title { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.4; }
.dialog__msg {
  margin: 12px 0 0;
  color: #555555;
  font-size: 15px;
  line-height: 1.65;
  word-break: keep-all;
}
.dialog__error {
  margin: 10px 0 0;
  color: #d33a2c;
  font-size: 13px;
  line-height: 1.5;
}
.dialog__actions { display: flex; gap: 10px; margin-top: 24px; }
.dialog__btn {
  flex: 1;
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: #ee6c26;
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.dialog__btn--ghost { border: 1px solid #ededed; background: #ffffff; color: #555555; }

.chat__icon:focus-visible,
.chat__profile-btn:focus-visible,
.chat__banner-btn:focus-visible,
.chat__chip:focus-visible,
.chat__send:focus-visible,
.chat__retry:focus-visible,
.sheet__btn:focus-visible,
.dialog__btn:focus-visible {
  outline: 2px solid #ee6c26;
  outline-offset: 2px;
}
`;
