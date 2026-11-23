import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MatchingWait from "./pages/MatchingWait.jsx";
import MatchingDone from "./pages/MatchingDone.jsx";
import Landing from "./pages/Landing.jsx";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/MatchingWait" element={<MatchingWait />} />
        <Route path="/MatchingDone" element={<MatchingDone />} />
      </Routes>
    </Router>
  );
}

export default App;
