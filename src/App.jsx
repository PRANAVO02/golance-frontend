import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PostTaskPage from "./pages/PostTask";
import MyTasksPage from "./pages/MyTasks";
import TasksPage from "./pages/TaskPage";
import TaskBidsPage from "./pages/TaskBids";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import MessagePage from "./pages/MessagePage";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    <Router>
      {/* Pass user and setUser so Header can update reactively */}
      <Header user={user} setUser={setUser} />
      
      <Routes>
        {/* Pass setUser to LoginPage so login updates the app state */}
        <Route path="/login" element={<LoginPage onLogin={(u) => setUser(u)} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/post-task" element={<PostTaskPage />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:taskId/bids" element={<TaskBidsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/messages" element={<MessagePage user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
