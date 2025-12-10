import React, { createContext, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ParticipantsPage from "./pages/ParticipantsPage";
import GachaPage from "./pages/GachaPage";
import JoinPage from "./pages/JoinPage";

import "./App.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide navbar on the Join page to keep it simple for guests
  const showNavbar = location.pathname !== "/join";
  return (
    <div className="min-h-screen font-sans selection:bg-primary/20 pb-32 flex flex-col items-center">
      {/* 
                Fixed Alignment: 
                1. 'flex flex-col items-center' on parent centers the child.
                2. 'w-full max-w-6xl' ensures it doesn't stretch too wide on huge monitors but takes full width on small ones.
            */}
      <div className="w-full max-w-6xl px-4 pt-8">{children}</div>
      {showNavbar && <Navbar />}
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/gacha" replace />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="/join" element={<JoinPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
