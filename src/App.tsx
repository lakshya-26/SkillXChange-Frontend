import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import { authService } from "./services/auth.service";
import ChatPage from "./pages/ChatPage";

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/messages" element={<ChatPage />} />
      </Routes>
    </>
  );
}

export default App;
