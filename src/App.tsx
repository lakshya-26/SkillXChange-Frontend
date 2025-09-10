import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <>
      <PWAInstallPrompt />
      <Routes location={background || location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Fallback for direct access to signup URL to show homepage */}
        <Route path="/signup" element={<HomePage />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      )}
    </>
  );
}

export default App;
