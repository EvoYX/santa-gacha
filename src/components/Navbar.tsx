import React from "react";
import { NavLink } from "react-router-dom";
import {
  UsersIcon,
  GiftIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium ${
      isActive
        ? "bg-white text-primary shadow-sm"
        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
    }`;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-100/80 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-lg flex gap-2">
      <NavLink to="/join" className={navClass}>
        <PlusCircleIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Join</span>
      </NavLink>

      <NavLink to="/gacha" className={navClass}>
        <GiftIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Gacha Draw</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
