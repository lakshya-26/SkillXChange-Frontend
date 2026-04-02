import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { authService } from "./services/auth.service";
import ChatPage from "./pages/ChatPage";
import DiscoverPage from "./pages/DiscoverPage";
import MatchesPage from "./pages/MatchesPage";
import MySkillsPage from "./pages/MySkillsPage";
import SettingsPage from "./pages/SettingsPage";
import SessionsPage from "./pages/SessionsPage";

function App() {
  const hasToken = !!authService.getAccessToken();

  return (
    <>
      <PWAInstallPrompt />
      <Routes>
        <Route
          path="/"
          element={
            hasToken ? <Navigate to="/dashboard" replace /> : <HomePage />
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/messages" element={<ChatPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/myskills" element={<MySkillsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </>
  );
}

export default App;
