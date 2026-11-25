import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { clearAuth } from "../api/authApi";
import { fetchMatch, fetchMyMatches } from "../api/match";
import BottomNav from "../components/BottomNav";
import { useI18n } from "../i18n";

function formatMatchTime(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(lang === "ja" ? "ja-JP" : "ko-KR");
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [chats, setChats] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadChats() {
      setStatus("loading");
      setError("");
      try {
        const result = await fetchMyMatches(0, 20);
        if (!Array.isArray(result?.matches)) {
          throw new Error(t("채팅 목록을 불러오지 못했어요."));
        }

        const matches = await Promise.all(
          result.matches.map(async (item) => ({
            ...item,
            ...(await fetchMatch(item.matchLogId)),
          })),
        );
        if (!active) return;
        setChats(matches.filter((match) => match.chatRoomId != null));
        setStatus("ready");
      } catch (e) {
        if (!active) return;
        if (e.status === 401) {
          clearAuth();
          navigate("/", { replace: true });
          return;
        }
        setError(t(e.message || "채팅 목록을 불러오지 못했어요."));
        setStatus("error");
      }
    }

    loadChats();
    return () => {
      active = false;
    };
  }, [navigate, retry, t]);

  return (
    <div className="chat-list">
      <style>{css}</style>

      <main className="chat-list__main">
        <h1 className="chat-list__title">{t("채팅")}</h1>
        <p className="chat-list__description">
            {t("매칭된 메이트와의 대화를 확인해보세요.")}
        </p>

        {status === "loading" && (
          <p className="chat-list__state" role="status">
            {t("채팅 목록을 불러오는 중...")}
          </p>
        )}

        {status === "error" && (
          <div className="chat-list__state" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="chat-list__retry"
              onClick={() => setRetry((value) => value + 1)}
            >
              {t("다시 시도")}
            </button>
          </div>
        )}

        {status === "ready" &&
          (chats.length === 0 ? (
            <p className="chat-list__state">
              {t("아직 연결된 채팅방이 없어요.")}
              <br />
              {t("매칭이 완료되면 이곳에서 대화를 시작할 수 있어요.")}
            </p>
          ) : (
            <ul className="chat-list__items">
              {chats.map((chat) => (
                <li key={chat.matchLogId}>
                  <button
                    type="button"
                    className="chat-list__item"
                    onClick={() =>
                      navigate(`/chats/${chat.chatRoomId}`, {
                        state: { partner: chat.partner },
                      })
                    }
                  >
                    <span className="chat-list__avatar" aria-hidden="true">
                      {chat.partner?.userNickname?.charAt(0) ?? "?"}
                    </span>
                    <span className="chat-list__details">
                      <span className="chat-list__name">
                        {chat.partner?.userNickname ?? chat.partnerNickname}
                      </span>
                      <span className="chat-list__meta">
                        {t(chat.categoryName)} ·{" "}
                        {formatMatchTime(chat.matchLogTime, lang)}
                      </span>
                    </span>
                    <span className="chat-list__open">
                      {chat.status === "ACTIVE"
                        ? t("대화하기")
                        : chat.status === "CANCELED"
                          ? t("취소됨 · 기록")
                          : t("종료됨 · 기록")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </main>

      <BottomNav active="chat" />
    </div>
  );
}

const css = `
.chat-list {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --gray-500: #949494;
  --text: #1f1d1b;
  --nav-h: 64px;

  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.chat-list *, .chat-list *::before, .chat-list *::after { box-sizing: border-box; }
.chat-list__main {
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 32px) 20px
    calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 24px);
}
.chat-list__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}
.chat-list__description {
  margin: 8px 0 0;
  color: var(--gray-500);
  font-size: 14px;
}
.chat-list__state {
  margin: 48px 0 0;
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}
.chat-list__items {
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}
.chat-list__items li + li { border-top: 1px solid var(--gray-100); }
.chat-list__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 4px;
  border: 0;
  background: #ffffff;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.chat-list__item:active { background: #faf8f5; }
.chat-list__avatar {
  display: grid;
  flex: 0 0 48px;
  place-items: center;
  height: 48px;
  border-radius: 50%;
  background: #fdeadd;
  color: var(--primary);
  font-size: 18px;
  font-weight: 700;
}
.chat-list__details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.chat-list__name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-list__meta {
  overflow: hidden;
  color: var(--gray-500);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-list__open {
  flex-shrink: 0;
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
}
.chat-list__retry {
  margin-top: 12px;
  padding: 8px 14px;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}
.chat-list__item:focus-visible,
.chat-list__retry:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
