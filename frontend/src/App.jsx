import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MatchingWait from "./pages/MatchingWait.jsx";
import MatchingDone from "./pages/MatchingDone.jsx";
import Landing from "./pages/Landing.jsx";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Home from "./pages/Home";
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardWritePage from "./pages/BoardWritePage";
import BoardEditPage from "./pages/BoardEditPage";
import QuickMatchPage from "./pages/QuickMatchPage.jsx";
import ChatListPage from "./pages/ChatListPage.jsx";
import ChatRoomPage from "./pages/ChatRoomPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import MatchNotifications from "./components/MatchNotifications.jsx";
import { LanguageProvider } from "./i18n";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <MatchNotifications />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/matchWaiting" element={<MatchingWait />} />
          <Route path="/matchDoing" element={<MatchingDone />} />
          <Route path="/home" element={<Home />} />
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
          <Route path="/detail/:boardId" element={<BoardDetailPage />} />
          <Route path="/writeBoard" element={<BoardWritePage />} />
          <Route path="/editBoard/:boardId" element={<BoardEditPage />} />

          {/* 하단 네비 탭 */}
          <Route path="/matching" element={<QuickMatchPage />} />
          <Route path="/chats" element={<ChatListPage />} />
          <Route path="/chats/:id" element={<ChatRoomPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
