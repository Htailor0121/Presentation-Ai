// src/components/ThemeSelector.jsx
import React from "react";

const themes = [
  { id: "classic-light", name: "Classic Light", bg: "#ffffff", text: "#1f2937" },
  { id: "classic-dark", name: "Classic Dark", bg: "#1e293b", text: "#ffffff" },
  { id: "sunset", name: "Sunset Glow", bg: "#ff6a00", text: "#ffffff" },
  { id: "aqua", name: "Aqua Blue", bg: "#00c6ff", text: "#ffffff" },
  { id: "cyber", name: "Cyber Purple", bg: "#8e2de2", text: "#ffffff" },
  { id: "mint", name: "Mint Green", bg: "#00b09b", text: "#ffffff" },
  { id: "peach", name: "Peach Cream", bg: "#ffe259", text: "#000000" },
  { id: "galaxy", name: "Galaxy", bg: "#302b63", text: "#ffffff" },
  { id: "matrix", name: "Matrix Neon", bg: "#00ff88", text: "#000000" },
  { id: "lavender", name: "Lavender Sky", bg: "#a18cd1", text: "#1f2937" },
];

const ThemeSelector = ({ selected, onChange }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-3">Theme</h3>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`p-3 rounded-lg border transition-colors ${
              selected === theme.id
                ? "border-blue-500 ring-2 ring-blue-400"
                : "border-gray-600 hover:border-gray-400"
            }`}
          >
            <div
              className="w-full h-10 rounded mb-2 flex items-center justify-center text-sm font-semibold"
              style={{ backgroundColor: theme.bg, color: theme.text }}
            >
              Aa
            </div>
            <div className="text-xs text-gray-300">{theme.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
