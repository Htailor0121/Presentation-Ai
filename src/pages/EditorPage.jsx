import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import presentationAPI from "../services/api";
import ThemeSelector from "../components/ThemeSelector";
import {
  Save,
  Eye,
  Download,
  Plus,
  Type,
  Image as ImageIcon,
  Search,
  BarChart2,
  Layout,
  Sparkles,
  HelpCircle,
  RefreshCcw,
} from "lucide-react";

// 🌈 Text & accent themes (no background change)
const gradientThemes = {
  "classic-light": { color: "#1f2937" },
  "classic-dark": { color: "#0f172a" },
  sunset: { color: "#d97706" },
  aqua: { color: "#0369a1" },
  cyber: { color: "#7c3aed" },
  mint: { color: "#047857" },
  peach: { color: "#b45309" },
  galaxy: { color: "#1e3a8a" },
  matrix: { color: "#059669" },
  lavender: { color: "#6d28d9" },
};

// 🎨 Fixed “Figma white” background
const figmaWhiteBackground = {
  background: `
    radial-gradient(circle at 15% 20%, rgba(236, 72, 153, 0.08), transparent 60%),
    radial-gradient(circle at 85% 70%, rgba(59, 130, 246, 0.08), transparent 60%),
    linear-gradient(135deg, #ffffff, #f7f8fa)
  `,
};

const EditorPage = () => {
  const location = useLocation();
  const outline = location.state?.outline || [];
  const presentationId = location.state?.id;

  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("classic-light");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 🧠 Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("presentationTheme");
    if (savedTheme && gradientThemes[savedTheme]) setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("presentationTheme", currentTheme);
  }, [currentTheme]);

  // 🔗 Load presentation or outline
  useEffect(() => {
    const loadPresentation = async () => {
      try {
        if (presentationId) {
          const data = await presentationAPI.getPresentations();
          const existing = data.find((p) => p.id === presentationId);
          if (existing) {
            setSlides(existing.slides || []);
            setSelectedSlide(existing.slides?.[0] || null);
          }
        } else if (outline.length > 0) {
          const formatted = outline.map((item, i) => ({
            id: i + 1,
            title: item.title || `Slide ${i + 1}`,
            content: item.content || "Generated AI Slide Content",
            imageUrl: item.imagePrompt?.startsWith("http")
              ? item.imagePrompt
              : `https://image.pollinations.ai/prompt/${encodeURIComponent(
                  item.imagePrompt || item.title
                )}`,
            layout: item.layout || "left",
          }));
          setSlides(formatted);
          setSelectedSlide(formatted[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load presentation");
      }
    };
    loadPresentation();
  }, [outline, presentationId]);

  // 💾 Save slides
  const handleSave = async () => {
    try {
      setSaving(true);
      toast.loading("Saving presentation...");

      const payload = { slides, theme: currentTheme };

      if (presentationId) {
        await presentationAPI.savePresentation({ id: presentationId, ...payload });
      } else {
        await presentationAPI.savePresentation(payload);
      }

      toast.dismiss();
      toast.success("✅ Presentation saved successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("❌ Failed to save presentation");
    } finally {
      setSaving(false);
    }
  };

  // 📦 Export slides
  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading("Exporting presentation...");

      const response = await presentationAPI.getPresentations();
      const pres = response.find((p) => p.id === presentationId);
      if (!pres) throw new Error("Presentation not found");

      const blob = new Blob([JSON.stringify(pres, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "presentation.json";
      link.click();

      toast.dismiss();
      toast.success("📄 Exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.dismiss();
      toast.error("❌ Export failed");
    } finally {
      setExporting(false);
    }
  };

  // ➕ Add slide
  const handleAddSlide = () => {
    const newSlide = {
      id: slides.length + 1,
      title: `New Slide ${slides.length + 1}`,
      content: "Add your content here...",
      imageUrl: "",
      layout: "left",
    };
    setSlides([...slides, newSlide]);
    setSelectedSlide(newSlide);
  };

  const handleChangeLayout = () => {
    if (!selectedSlide) return;
    const layouts = ["left", "right", "center"];
    const nextLayout = layouts[(layouts.indexOf(selectedSlide.layout) + 1) % layouts.length];
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, layout: nextLayout } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, layout: nextLayout });
  };

  const handleChangeImage = () => {
    if (!selectedSlide) return;
    const newUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      selectedSlide.title + " illustration"
    )}`;
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, imageUrl: newUrl } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, imageUrl: newUrl });
  };

  const handleEnhance = () => toast("✨ AI enhancement coming soon!");
  const handleAddChart = () => {
    if (!selectedSlide) return;
    const newContent =
      selectedSlide.content + "\n\n📊 [AI Chart Placeholder: Replace with chart data]";
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, content: newContent } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, content: newContent });
  };

  return (
    <div
      className="h-screen flex flex-col transition-all duration-700 overflow-hidden"
      style={{
        ...figmaWhiteBackground,
        color: gradientThemes[currentTheme].color,
      }}
    >
      {/* HEADER (Fixed) */}
      <header className="flex items-center justify-between px-8 py-3 bg-white/40 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <h1 className="text-lg font-semibold">{selectedSlide?.title || "Presentation"}</h1>
        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            🎨 Theme
          </button>
          {showThemeSelector && (
            <div className="absolute right-0 mt-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-4 shadow-2xl z-50 w-72">
              <ThemeSelector
                selected={currentTheme}
                onChange={(themeId) => {
                  setCurrentTheme(themeId);
                  setShowThemeSelector(false);
                }}
              />
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
            <Save size={16} /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => toast("👀 Preview coming soon!")} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
            <Eye size={16} /> Preview
          </button>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition">
            <Download size={16} /> {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 pt-[60px] overflow-hidden">
        {/* Sidebar (Fixed height, scrolls internally if needed) */}
        <aside className="w-64 bg-white/60 backdrop-blur-md border-r border-gray-200 overflow-y-auto fixed top-[60px] bottom-0 left-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold">Slides</h2>
            <button
              onClick={handleAddSlide}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
            >
              <Plus size={12} /> New
            </button>
          </div>
          {slides.map((slide) => (
            <div
              key={slide.id}
              onClick={() => setSelectedSlide(slide)}
              className={`px-4 py-3 text-sm cursor-pointer border-b border-gray-100 ${
                selectedSlide?.id === slide.id ? "bg-gray-200/80" : "hover:bg-gray-100"
              }`}
            >
              <h3 className="font-medium truncate">{slide.title}</h3>
              <p className="text-xs opacity-70 truncate">{slide.content}</p>
            </div>
          ))}
        </aside>

        {/* Center Scrollable Slides */}
        <main className="flex-1 ml-64 overflow-y-auto p-10 bg-[#f9fafb] relative">
          <div className="flex flex-col items-center gap-12 pb-24">
            {slides.map((slide) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-6xl aspect-video rounded-2xl shadow-xl flex overflow-hidden backdrop-blur-lg bg-white border border-gray-200"
                style={{
                  color: gradientThemes[currentTheme].color,
                }}
              >
                {/* Text Section */}
                <div
                  className={`flex-1 flex flex-col justify-center px-10 py-8 text-left ${
                    slide.layout === "right" ? "order-2" : "order-1"
                  }`}
                >
                  <input
                    value={slide.title}
                    onChange={(e) => {
                      const updated = slides.map((s) =>
                        s.id === slide.id ? { ...s, title: e.target.value } : s
                      );
                      setSlides(updated);
                    }}
                    className="text-4xl font-bold mb-4 bg-transparent border-b border-gray-300 focus:outline-none"
                  />
                  <textarea
                    value={slide.content}
                    onChange={(e) => {
                      const updated = slides.map((s) =>
                        s.id === slide.id ? { ...s, content: e.target.value } : s
                      );
                      setSlides(updated);
                    }}
                    className="text-lg text-gray-700 leading-relaxed bg-transparent focus:outline-none resize-none h-40"
                  />
                </div>

                {/* Image Section */}
                {slide.imageUrl && (
                  <div
                    className={`flex-1 flex items-center justify-center bg-gray-50 ${
                      slide.layout === "right" ? "order-1" : "order-2"
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt="Slide Visual"
                      className="w-full h-full object-cover rounded-r-2xl"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Floating Toolbar (Fixed) */}
          <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-gray-300 shadow-lg z-50 scale-75">

            {[ 
              { icon: <Search size={20} />, action: () => toast('🔍 Coming soon') },
              { icon: <Type size={20} />, action: () => setEditingTitle(true) },
              { icon: <ImageIcon size={20} />, action: handleChangeImage },
              { icon: <Plus size={20} />, action: handleAddSlide },
              { icon: <BarChart2 size={20} />, badge: "NEW", action: handleAddChart },
              { icon: <Layout size={20} />, action: handleChangeLayout },
              { icon: <Sparkles size={20} />, action: handleEnhance },
              { icon: <RefreshCcw size={20} />, action: () => window.location.reload() },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className="relative group p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110 text-gray-800"
              >
                {btn.icon}
                {btn.badge && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {btn.badge}
                  </span>
                )}
              </button>
            ))}
            <div className="mt-2 text-sm font-semibold text-gray-500">84%</div>
            <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
              <HelpCircle size={22} color="#fff" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );

};

export default EditorPage;
