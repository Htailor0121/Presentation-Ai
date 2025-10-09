// src/components/ThemeSelector.jsx
import React, { useState } from "react";

const themes = {
  // Basic Color Themes
  "classic-light": { 
    bg: "from-white to-gray-50", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-blue-600",
    border: "border-gray-200",
    category: "light",
    name: "Classic Light",
    font: "'Courier New', monospace"
  },
  "classic-dark": { 
    bg: "from-gray-900 to-gray-800", 
    cardBg: "bg-gray-800",
    text: "text-white", 
    accent: "bg-blue-500",
    border: "border-gray-700",
    category: "dark",
    name: "Classic Dark",
    font: "Georgia', serif"
  },
  "sunset-glow": { 
    bg: "from-orange-500 to-pink-500", 
    cardBg: "bg-orange-50",
    text: "text-gray-900", 
    accent: "bg-orange-600",
    border: "border-orange-300",
    category: "colorful",
    name: "Sunset Glow",
    font: "'Poppins', sans-serif"
  },
  "aqua-blue": { 
    bg: "from-cyan-400 to-blue-500", 
    cardBg: "bg-cyan-50",
    text: "text-gray-900", 
    accent: "bg-cyan-600",
    border: "border-cyan-300",
    category: "colorful",
    name: "Aqua Blue",
    font: "'Roboto', sans-serif"
  },
  "cyber-purple": { 
    bg: "from-purple-600 to-pink-600", 
    cardBg: "bg-purple-950",
    text: "text-white", 
    accent: "bg-purple-500",
    border: "border-purple-700",
    category: "dark",
    name: "Cyber Purple",
    font: "'Courier New', monospace"
  },
  "mint-green": { 
    bg: "from-emerald-400 to-teal-500", 
    cardBg: "bg-emerald-50",
    text: "text-gray-900", 
    accent: "bg-emerald-600",
    border: "border-emerald-300",
    category: "colorful",
    name: "Mint Green",
    font: "'Inter', sans-serif"
  },
  "peach-cream": { 
    bg: "from-yellow-200 to-orange-200", 
    cardBg: "bg-yellow-50",
    text: "text-gray-900", 
    accent: "bg-yellow-600",
    border: "border-yellow-300",
    category: "light",
    name: "Peach Cream",
    font: "'Georgia', serif"
  },
  "galaxy": { 
    bg: "from-indigo-900 to-purple-900", 
    cardBg: "bg-indigo-950",
    text: "text-white", 
    accent: "bg-indigo-500",
    border: "border-indigo-700",
    category: "dark",
    name: "Galaxy",
    font: "'Roboto', sans-serif"
  },
  "matrix-neon": { 
    bg: "from-green-400 to-emerald-500", 
    cardBg: "bg-green-950",
    text: "text-white", 
    accent: "bg-green-400",
    border: "border-green-600",
    category: "colorful",
    name: "Matrix Neon",
    font: "'Courier New', monospace"
  },
  "lavender-sky": { 
    bg: "from-purple-200 to-pink-200", 
    cardBg: "bg-purple-50",
    text: "text-gray-900", 
    accent: "bg-purple-600",
    border: "border-purple-300",
    category: "light",
    name: "Lavender Sky",
    font: "'Garamond', serif"
  },

  // Dark Elaborate Themes
  "nebulae": { 
    bg: "from-purple-900 via-pink-800 to-blue-900", 
    cardBg: "bg-purple-950",
    text: "text-white", 
    accent: "bg-purple-500",
    border: "border-purple-700",
    category: "dark",
    name: "Nebulae",
    font: "'Segoe UI', sans-serif"
  },
  "lux": { 
    bg: "from-teal-900 to-emerald-900", 
    cardBg: "bg-teal-950",
    text: "text-white", 
    accent: "bg-teal-500",
    border: "border-teal-700",
    category: "dark",
    name: "Lux",
    font: "'Helvetica Neue', sans-serif"
  },
  "gamma-dark": { 
    bg: "from-indigo-900 to-purple-900", 
    cardBg: "bg-indigo-950",
    text: "text-white", 
    accent: "bg-indigo-400",
    border: "border-indigo-700",
    category: "dark",
    name: "Gamma Dark",
    font: "'Inter', sans-serif"
  },
  "indigo": { 
    bg: "from-indigo-950 to-blue-950", 
    cardBg: "bg-indigo-950",
    text: "text-white", 
    accent: "bg-indigo-500",
    border: "border-indigo-800",
    category: "dark",
    name: "Indigo",
    font: "'Roboto', sans-serif"
  },
  "blueberry": { 
    bg: "from-indigo-900 to-blue-900", 
    cardBg: "bg-indigo-950",
    text: "text-white", 
    accent: "bg-blue-500",
    border: "border-blue-700",
    category: "dark",
    name: "Blueberry",
    font: "'Open Sans', sans-serif"
  },
  "incandescent": { 
    bg: "from-pink-900 to-rose-900", 
    cardBg: "bg-pink-950",
    text: "text-white", 
    accent: "bg-pink-500",
    border: "border-pink-700",
    category: "dark",
    name: "Incandescent",
    font: "'Palatino', serif"
  },
  "verdigris": { 
    bg: "from-teal-900 to-cyan-900", 
    cardBg: "bg-teal-950",
    text: "text-white", 
    accent: "bg-cyan-500",
    border: "border-cyan-700",
    category: "dark",
    name: "Verdigris",
    font: "'Lato', sans-serif"
  },
  "canaveral": { 
    bg: "from-gray-900 to-slate-900", 
    cardBg: "bg-gray-950",
    text: "text-white", 
    accent: "bg-gray-500",
    border: "border-gray-700",
    category: "dark",
    name: "Canaveral",
    font: "'Consolas', monospace"
  },
  "electric": { 
    bg: "from-violet-900 to-fuchsia-900", 
    cardBg: "bg-violet-950",
    text: "text-white", 
    accent: "bg-violet-500",
    border: "border-violet-700",
    category: "dark",
    name: "Electric",
    font: "'Poppins', sans-serif"
  },
  "orbit": { 
    bg: "from-blue-900 to-indigo-900", 
    cardBg: "bg-blue-950",
    text: "text-white", 
    accent: "bg-blue-400",
    border: "border-blue-700",
    category: "dark",
    name: "Orbit",
    font: "'Roboto', sans-serif"
  },
  "alien": { 
    bg: "from-green-900 to-lime-900", 
    cardBg: "bg-green-950",
    text: "text-white", 
    accent: "bg-lime-400",
    border: "border-lime-700",
    category: "dark",
    name: "Alien",
    font: "'Courier New', monospace"
  },
  "aurora": { 
    bg: "from-purple-900 via-blue-900 to-cyan-900", 
    cardBg: "bg-purple-950",
    text: "text-white", 
    accent: "bg-cyan-400",
    border: "border-purple-700",
    category: "dark",
    name: "Aurora",
    font: "'Montserrat', sans-serif"
  },
  "borealis": { 
    bg: "from-blue-900 to-cyan-900", 
    cardBg: "bg-blue-950",
    text: "text-white", 
    accent: "bg-cyan-400",
    border: "border-blue-700",
    category: "dark",
    name: "Borealis",
    font: "'Inter', sans-serif"
  },
  "vortex": { 
    bg: "from-slate-900 to-gray-900", 
    cardBg: "bg-slate-950",
    text: "text-white", 
    accent: "bg-slate-400",
    border: "border-slate-700",
    category: "dark",
    name: "Vortex",
    font: "'Arial', sans-serif"
  },
  "stratos": { 
    bg: "from-indigo-950 via-purple-900 to-blue-900", 
    cardBg: "bg-indigo-950",
    text: "text-white", 
    accent: "bg-purple-400",
    border: "border-purple-700",
    category: "dark",
    isNew: true,
    name: "Stratos",
    font: "'Segoe UI', sans-serif"
  },
  "stardust": { 
    bg: "from-gray-900 to-zinc-900", 
    cardBg: "bg-gray-950",
    text: "text-white", 
    accent: "bg-amber-400",
    border: "border-gray-700",
    category: "dark",
    name: "Stardust",
    font: "'Georgia', serif"
  },
  "night-sky": { 
    bg: "from-slate-900 to-blue-950", 
    cardBg: "bg-slate-950",
    text: "text-white", 
    accent: "bg-blue-400",
    border: "border-slate-700",
    category: "dark",
    name: "Night Sky",
    font: "'Courier New', monospace"
  },
  "bonan-hale": { 
    bg: "from-zinc-900 to-stone-900", 
    cardBg: "bg-zinc-950",
    text: "text-white", 
    accent: "bg-yellow-500",
    border: "border-zinc-700",
    category: "dark",
    name: "Bonan Hale",
    font: "'Verdana', sans-serif"
  },
  "founder": { 
    bg: "from-neutral-900 to-stone-900", 
    cardBg: "bg-neutral-950",
    text: "text-white", 
    accent: "bg-neutral-400",
    border: "border-neutral-700",
    category: "dark",
    name: "Founder",
    font: "'Baskerville', serif"
  },
  "onyx": { 
    bg: "from-black to-gray-900", 
    cardBg: "bg-black",
    text: "text-white", 
    accent: "bg-gray-400",
    border: "border-gray-800",
    category: "dark",
    name: "Onyx",
    font: "'Garamond', serif"
  },
  "mystique": { 
    bg: "from-violet-950 to-purple-950", 
    cardBg: "bg-violet-950",
    text: "text-white", 
    accent: "bg-violet-400",
    border: "border-violet-800",
    category: "dark",
    name: "Mystique",
    font: "'Palatino', serif"
  },
  "blues": { 
    bg: "from-blue-900 to-sky-900", 
    cardBg: "bg-blue-950",
    text: "text-white", 
    accent: "bg-sky-400",
    border: "border-blue-700",
    category: "dark",
    name: "Blues",
    font: "'Georgia', serif"
  },
  "coal": { 
    bg: "from-stone-900 to-neutral-900", 
    cardBg: "bg-stone-950",
    text: "text-white", 
    accent: "bg-stone-400",
    border: "border-stone-700",
    category: "dark",
    name: "Coal",
    font: "'Trebuchet MS', sans-serif"
  },
  "fluo": { 
    bg: "from-gray-900 to-zinc-900", 
    cardBg: "bg-gray-950",
    text: "text-white", 
    accent: "bg-lime-400",
    border: "border-gray-700",
    category: "dark",
    name: "Fluo",
    font: "'Monaco', monospace"
  },
  "blue-steel": { 
    bg: "from-slate-800 to-gray-800", 
    cardBg: "bg-slate-900",
    text: "text-white", 
    accent: "bg-blue-400",
    border: "border-slate-600",
    category: "dark",
    name: "Blue Steel",
    font: "'Arial', sans-serif"
  },
  "mocha": { 
    bg: "from-stone-800 to-neutral-800", 
    cardBg: "bg-stone-900",
    text: "text-white", 
    accent: "bg-amber-400",
    border: "border-stone-600",
    category: "dark",
    name: "Mocha",
    font: "'Georgia', serif"
  },
  "velvet-tides": { 
    bg: "from-fuchsia-900 to-pink-900", 
    cardBg: "bg-fuchsia-950",
    text: "text-white", 
    accent: "bg-fuchsia-400",
    border: "border-fuchsia-700",
    category: "dark",
    name: "Velvet Tides",
    font: "'Didot', serif"
  },

  // Light & Colorful Themes
  "seafoam": { 
    bg: "from-teal-100 to-emerald-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-teal-600",
    border: "border-teal-200",
    category: "light",
    name: "Seafoam",
    font: "'Lato', sans-serif"
  },
  "marine": { 
    bg: "from-blue-900 to-indigo-900", 
    cardBg: "bg-blue-950",
    text: "text-white", 
    accent: "bg-blue-400",
    border: "border-blue-700",
    category: "dark",
    name: "Marine",
    font: "'Roboto', sans-serif"
  },
  "elysia": { 
    bg: "from-blue-100 via-purple-100 to-pink-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-purple-600",
    border: "border-purple-200",
    category: "colorful",
    name: "Elysia",
    font: "'Quicksand', sans-serif"
  },
  "prism": { 
    bg: "from-pink-100 to-purple-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-pink-600",
    border: "border-pink-200",
    category: "light",
    name: "Prism",
    font: "'Raleway', sans-serif"
  },
  "lunaria": { 
    bg: "from-purple-900 via-pink-800 to-indigo-900", 
    cardBg: "bg-purple-950",
    text: "text-white", 
    accent: "bg-pink-400",
    border: "border-purple-700",
    category: "dark",
    name: "Lunaria",
    font: "'Cambria', serif"
  },
  "gamma": { 
    bg: "from-pink-50 to-rose-50", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-pink-600",
    border: "border-pink-200",
    category: "light",
    name: "Gamma",
    font: "'Nunito', sans-serif"
  },
  "lavender": { 
    bg: "from-purple-100 to-violet-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-purple-600",
    border: "border-purple-200",
    category: "light",
    name: "Lavender",
    font: "'Book Antiqua', serif"
  },
  "atmosphere": { 
    bg: "from-orange-100 to-pink-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-orange-600",
    border: "border-orange-200",
    category: "colorful",
    name: "Atmosphere",
    font: "'Poppins', sans-serif"
  },
  "peach": { 
    bg: "from-orange-100 to-amber-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-orange-600",
    border: "border-orange-200",
    category: "light",
    name: "Peach",
    font: "'Georgia', serif"
  },
  "sanguine": { 
    bg: "from-red-900 to-rose-900", 
    cardBg: "bg-red-950",
    text: "text-white", 
    accent: "bg-red-400",
    border: "border-red-700",
    category: "dark",
    name: "Sanguine",
    font: "'Crimson Text', serif"
  },
  "flamingo": { 
    bg: "from-rose-200 to-pink-200", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-rose-600",
    border: "border-rose-200",
    category: "light",
    name: "Flamingo",
    font: "'Comfortaa', sans-serif"
  },
  "zephyr": { 
    bg: "from-sky-100 to-blue-100", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-sky-600",
    border: "border-sky-200",
    category: "light",
    name: "Zephyr",
    font: "'Source Sans Pro', sans-serif"
  },
  "chimney-dust": { 
    bg: "from-gray-300 to-slate-300", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-gray-600",
    border: "border-gray-300",
    category: "light",
    name: "Chimney Dust",
    font: "'Tahoma', sans-serif"
  },
  "daydream": { 
    bg: "from-blue-50 to-indigo-50", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-blue-600",
    border: "border-blue-200",
    category: "light",
    name: "Daydream",
    font: "'Optima', sans-serif"
  },
  "cornflower": { 
    bg: "from-blue-200 to-indigo-200", 
    cardBg: "bg-white",
    text: "text-gray-900", 
    accent: "bg-blue-600",
    border: "border-blue-300",
    category: "light",
    name: "Cornflower",
    font: "'Calibri', sans-serif"
  },
};

const ThemeSelector = ({ selected, onChange }) => {
  const [activeCategory, setActiveCategory] = useState("dark");

  // Convert themes object to array and filter by category
  const themeArray = Object.entries(themes).map(([id, theme]) => ({
    id,
    ...theme
  }));

  const filteredThemes = themeArray.filter(theme => theme.category === activeCategory);

  return (
    <div className="max-h-[500px] flex flex-col">
      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveCategory("dark")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            activeCategory === "dark"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setActiveCategory("light")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            activeCategory === "light"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setActiveCategory("colorful")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            activeCategory === "colorful"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Colorful
        </button>
      </div>

      {/* Themes Grid */}
      <div className="overflow-y-auto flex-1 pr-2">
        <div className="grid grid-cols-2 gap-3">
          {filteredThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChange(theme.id)}
              className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                selected === theme.id
                  ? "border-blue-500 ring-2 ring-blue-400 shadow-md"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="relative">
                <div
                  className={`w-full h-16 rounded-lg mb-2 flex items-center justify-center text-lg font-bold bg-gradient-to-br ${theme.bg}`}
                >
                  <span className={theme.text}>Aa</span>
                </div>
                {theme.isNew && (
                  <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-gray-700 text-center truncate">
                {theme.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export { themes };
export default ThemeSelector;