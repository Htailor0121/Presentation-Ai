import React from "react";
import { FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1117]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition">
            <FileText size={20} className="text-blue-400" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Presentation <span className="text-blue-500">AI</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8">
          {[
            { label: "Home", path: "/" },
            { label: "Editor", path: "/editor" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative text-sm font-medium transition ${
                location.pathname === item.path
                  ? "text-blue-400"
                  : "text-gray-400 hover:text-blue-400"
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
