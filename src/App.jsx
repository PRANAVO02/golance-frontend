import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PostTask from "./pages/PostTask";
import MyTasks from "./pages/MyTasks";
import TaskPage from "./pages/TaskPage";
import TaskBids from "./pages/TaskBids";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";

import "./App.css"; // make sure App.css is imported

function App() {
  return (
    <Router>
      {/* Main Container with vibe-y background */}
      <div className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/post-task" element={<PostTask />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/tasks/:taskId/bids" element={<TaskBids />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/wallet" element={<WalletPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
