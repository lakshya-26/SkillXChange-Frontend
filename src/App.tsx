import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";

function App() {
  return (
    <>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Add other routes for login, signup, etc. here later */}
      </Routes>
    </>
  );
}

export default App;
