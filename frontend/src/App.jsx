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

// 아직 만들지 않은 화면용 임시 자리 (화면을 만들면 교체하세요)
const Empty = ({ name }) => <p style={{ padding: 24 }}>{name} 화면 준비 중</p>;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/MatchingWait" element={<MatchingWait />} />
        <Route path="/MatchingDone" element={<MatchingDone />} />
        <Route path="/home" element={<Home />} />
        <Route path="/detail" element={<BoardDetailPage />} />
        <Route path="/writeBoard" element={<BoardWritePage />} />
        <Route path="/editBoard" element={<BoardEditPage />} />

        {/* 하단 네비 탭 */}
        <Route path="/matching" element={<Empty name="매칭" />} />
        <Route path="/chats" element={<Empty name="채팅" />} />
        <Route path="/mypage" element={<Empty name="마이페이지" />} />
      </Routes>
    </Router>
  );
}
