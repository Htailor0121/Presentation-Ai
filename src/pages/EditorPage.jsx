import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import presentationAPI from "../services/api";
import ThemeSelector, { themes as gradientThemes } from "../components/ThemeSelector";
import {
  Save,
  Eye,
  Plus,
  Type,
  Image as ImageIcon,
  Search,
  BarChart2,
  Layout,
  Sparkles,
  RefreshCcw,
  ChevronDown,
  Grid,
  List,
  X,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Trash2,
  Copy,
  Download,
  Share2,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import themes from ThemeSelector to keep them in sync

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const outline = location.state?.outline || [];
  const presentationId = location.state?.id;
  const fileInputRef = useRef(null);

  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("classic-light");
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [presentMode, setPresentMode] = useState(false);
  const [currentPresentSlide, setCurrentPresentSlide] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: "left"
  });

  const theme = gradientThemes[currentTheme] || gradientThemes["classic-light"];
  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("presentationTheme");
    if (savedTheme && gradientThemes[savedTheme]) setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("presentationTheme", currentTheme);
  }, [currentTheme]);

  // Load presentation
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
            layout: item.layout || "split",
            textAlign: "left",
          }));
          setSlides(formatted);
        }
      
      } catch (err) {
        console.error(err);
        toast.error("Failed to load presentation");
      }
    };
    loadPresentation();
  }, [outline, presentationId]);
  useEffect(() => {
    if (slides.length > 0 && !selectedSlide) {
      setSelectedSlide(slides[0]);
    }
  }, [slides]);

  // Keyboard navigation for present mode
  useEffect(() => {
    if (!presentMode) return;
    
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === "Escape") {
        setPresentMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [presentMode, currentPresentSlide, slides.length]);

  // Save presentation
  const handleSave = async () => {
    try {
      setSaving(true);
      const loadingToast = toast.loading("Saving presentation...");

      const payload = { 
        slides, 
        theme: currentTheme,
        title: slides[0]?.title || "Untitled Presentation",
        updatedAt: new Date().toISOString()
      };

      if (presentationId) {
        await presentationAPI.savePresentation({ id: presentationId, ...payload });
      } else {
        await presentationAPI.savePresentation(payload);
      }

      toast.dismiss(loadingToast);
      toast.success("✅ Presentation saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save presentation");
    } finally {
      setSaving(false);
    }
  };

  // Export presentation
  const handleExport = async () => {
    try {
      const loadingToast = toast.loading("Exporting presentation...");

      const exportData = {
        title: slides[0]?.title || "Untitled Presentation",
        theme: currentTheme,
        slides: slides,
        createdAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: "application/json" 
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${exportData.title.replace(/\s+/g, "-")}.json`;
      link.click();

      toast.dismiss(loadingToast);
      toast.success("📄 Exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("❌ Export failed");
    }
  };

  // Share functionality
  const handleShare = () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: slides[0]?.title || "Presentation",
        text: "Check out my presentation!",
        url: shareUrl,
      }).then(() => {
        toast.success("Shared successfully!");
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("🔗 Link copied to clipboard!");
    });
  };

  // Add slide
  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: `New Slide ${slides.length + 1}`,
      content: "Add your content here...",
      imageUrl: "",
      layout: "split",
      textAlign: "left",
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setSelectedSlide(newSlide);
    setSelectedSlideIndex(newSlides.length - 1);
    toast.success("➕ New slide added!");
  };

  // Duplicate slide
  const handleDuplicateSlide = () => {
    if (!selectedSlide) return;
    
    const duplicatedSlide = {
      ...selectedSlide,
      id: Date.now(),
      title: `${selectedSlide.title} (Copy)`,
    };
    const newSlides = [...slides];
    newSlides.splice(selectedSlideIndex + 1, 0, duplicatedSlide);
    setSlides(newSlides);
    setSelectedSlide(duplicatedSlide);
    setSelectedSlideIndex(selectedSlideIndex + 1);
    toast.success("📋 Slide duplicated!");
  };

  // Delete slide
  const handleDeleteSlide = () => {
    if (!selectedSlide || slides.length === 1) {
      toast.error("Cannot delete the last slide!");
      return;
    }
    
    const newSlides = slides.filter(s => s.id !== selectedSlide.id);
    setSlides(newSlides);
    const newIndex = Math.min(selectedSlideIndex, newSlides.length - 1);
    setSelectedSlide(newSlides[newIndex]);
    setSelectedSlideIndex(newIndex);
    toast.success("🗑️ Slide deleted!");
  };

  // Change layout
  const handleChangeLayout = () => {
    if (!selectedSlide) return;
    const layouts = ["split", "full-image", "full-text", "centered"];
    const currentIndex = layouts.indexOf(selectedSlide.layout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, layout: nextLayout } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, layout: nextLayout });
    toast.success(`📐 Layout changed to ${nextLayout}`);
  };

  // Change image
  const handleChangeImage = () => {
    if (!selectedSlide) return;
    const newUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      selectedSlide.title + " professional illustration " + Date.now()
    )}`;
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, imageUrl: newUrl } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, imageUrl: newUrl });
    toast.success("🖼️ Image refreshed!");
  };

  // Upload custom image
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result;
      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, imageUrl } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, imageUrl });
      toast.success("📷 Image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  // AI Enhancement
  const handleEnhance = async () => {
    if (!selectedSlide) return;
    
    const loadingToast = toast.loading("✨ Enhancing content with AI...");
    
    // Simulate AI enhancement
    setTimeout(() => {
      const enhancedContent = selectedSlide.content + "\n\n✨ Enhanced with AI insights and professional formatting.";
      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, content: enhancedContent } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, content: enhancedContent });
      toast.dismiss(loadingToast);
      toast.success("✨ Content enhanced!");
    }, 1500);
  };

  // Add chart
  const handleAddChart = () => {
    if (!selectedSlide) return;
    const chartPlaceholder = "\n\n📊 [Chart: Sales Growth 2025]\n• Q1: 25%\n• Q2: 35%\n• Q3: 45%\n• Q4: 60%";
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, content: s.content + chartPlaceholder } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, content: selectedSlide.content + chartPlaceholder });
    toast.success("📊 Chart added!");
  };

  // Text alignment
  const handleTextAlign = (align) => {
    if (!selectedSlide) return;
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, textAlign: align } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, textAlign: align });
    setTextFormatting({ ...textFormatting, align });
  };

  // Present mode navigation
  const handleNextSlide = () => {
    if (currentPresentSlide < slides.length - 1) {
      setCurrentPresentSlide(currentPresentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentPresentSlide > 0) {
      setCurrentPresentSlide(currentPresentSlide - 1);
    }
  };

  // Update slide content
  const updateSlideContent = (field, value) => {
    if (!selectedSlide) return;
    const updatedSlides = slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, [field]: value } : s
    );
    setSlides(updatedSlides);
    setSelectedSlide({ ...selectedSlide, [field]: value });
  };

  // Render slide based on layout
  const renderSlideContent = (slide, isPresent = false) => {
    const size = isPresent ? "text-5xl" : "text-3xl";
    const contentSize = isPresent ? "text-2xl" : "text-base";
    const padding = isPresent ? "p-16" : "p-8";
    const fontFamily = theme.font; // Get font from theme
  
    switch (slide.layout) {
      case "full-image":
        return (
          <div className="relative w-full h-full" style={{ fontFamily }}>
            {slide.imageUrl && (
              <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-12">
              <h2 className={`${size} font-bold text-white mb-4`}>{slide.title}</h2>
              <p className={`${contentSize} text-white/90`}>{slide.content}</p>
            </div>
          </div>
        );
  
      case "full-text":
        return (
          <div className={`w-full h-full flex flex-col justify-center ${padding} ${theme.text}`} style={{ fontFamily }}>
            <h2 className={`${size} font-bold mb-6`} style={{ textAlign: slide.textAlign }}>
              {slide.title}
            </h2>
            <p className={`${contentSize} leading-relaxed whitespace-pre-wrap`} style={{ textAlign: slide.textAlign }}>
              {slide.content}
            </p>
          </div>
        );
  
      case "centered":
        return (
          <div className={`w-full h-full flex flex-col items-center justify-center text-center ${padding} ${theme.text}`} style={{ fontFamily }}>
            <h2 className={`${size} font-bold mb-6 max-w-4xl`}>{slide.title}</h2>
            <p className={`${contentSize} leading-relaxed max-w-3xl`}>{slide.content}</p>
          </div>
        );
  
      default: // split
        return (
          <div className="w-full h-full flex" style={{ fontFamily }}>
            {slide.imageUrl && (
              <div className="flex-1">
                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`flex-1 flex flex-col justify-center ${padding} ${theme.text}`}>
              <h2 className={`${size} font-bold mb-4`} style={{ textAlign: slide.textAlign }}>
                {slide.title}
              </h2>
              <p className={`${contentSize} leading-relaxed whitespace-pre-wrap`} style={{ textAlign: slide.textAlign }}>
                {slide.content}
              </p>
            </div>
          </div>
        );
    }
  };

  // Present Mode Component
  if (presentMode) {
    const currentSlide = slides[currentPresentSlide];
    return (
      <div className={`h-screen w-screen bg-gradient-to-br ${theme.bg} ${theme.text} relative`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPresentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            {renderSlideContent(currentSlide, true)}
          </motion.div>
        </AnimatePresence>

        {/* Present Mode Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
          <button
            onClick={handlePrevSlide}
            disabled={currentPresentSlide === 0}
            className="p-2 text-white hover:bg-white/20 rounded-full transition disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>
          
          <span className="text-white font-medium">
            {currentPresentSlide + 1} / {slides.length}
          </span>
          
          <button
            onClick={handleNextSlide}
            disabled={currentPresentSlide === slides.length - 1}
            className="p-2 text-white hover:bg-white/20 rounded-full transition disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-2" />

          <button
            onClick={() => setPresentMode(false)}
            className="p-2 text-white hover:bg-white/20 rounded-full transition"
            title="Exit (ESC)"
          >
            <X size={24} />
          </button>
        </div>

        {/* Slide thumbnails */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentPresentSlide(index)}
              className={`w-16 h-12 rounded overflow-hidden border-2 transition ${
                index === currentPresentSlide ? "border-white scale-110" : "border-white/30 opacity-50 hover:opacity-100"
              }`}
            >
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main Editor View
  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800 overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-600 rounded flex items-center justify-center font-bold text-white text-sm">
            G
          </div>
          <ChevronDown size={16} className="text-gray-500" />
          <input
            value={selectedSlide?.title || "Untitled Presentation"}
            onChange={(e) => updateSlideContent("title", e.target.value)}
            className="text-sm text-gray-700 font-medium bg-transparent border-none focus:outline-none max-w-md"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 transition text-sm font-medium"
          >
            🎨 Theme
          </button>
          
          {showThemeSelector && (
            <div className="absolute right-6 top-14 bg-white border border-gray-200 rounded-xl p-4 shadow-2xl z-50 w-72">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">Choose Theme</h3>
                <button onClick={() => setShowThemeSelector(false)}>
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <ThemeSelector
                selected={currentTheme}
                onChange={(themeId) => {
                  setCurrentTheme(themeId);
                  setShowThemeSelector(false);
                  toast.success(`Theme changed to ${themeId}!`);
                }}
              />
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 transition text-sm font-medium"
            >
              <Share2 size={14} /> Share
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-48 overflow-hidden">
                <button
                  onClick={() => {
                    handleShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Share2 size={14} /> Share Link
                </button>
                <button
                  onClick={() => {
                    handleExport();
                    setShowShareMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={14} /> Export JSON
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 transition text-sm font-medium disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>

          <button 
            onClick={() => {
              setPresentMode(true);
              setCurrentPresentSlide(selectedSlideIndex);
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition text-sm font-medium"
          >
            <Eye size={14} /> Present
          </button>

          <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
            HT
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${
                    viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition ${
                    viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="mx-3 my-3 relative">
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-700 font-medium transition shadow-sm"
              >
                <Plus size={16} /> New
                <ChevronDown size={14} className={`transition-transform ${showNewMenu ? "rotate-180" : ""}`} />
              </button>
              
              {showNewMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      handleAddSlide();
                      setShowNewMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <Plus size={14} /> Blank Slide
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicateSlide();
                      setShowNewMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <Copy size={14} /> Duplicate Current
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
              {slides.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No slides yet</p>
                  <p className="text-xs mt-1">Click "New" to create</p>
                </div>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setSelectedSlide(slide);
                      setSelectedSlideIndex(index);
                    }}
                    className={`rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedSlide?.id === slide.id
                        ? "ring-2 ring-blue-500 shadow-md"
                        : "ring-1 ring-gray-200 hover:ring-gray-400 hover:shadow-sm"
                    }`}
                  >
                    {viewMode === "grid" ? (
                      <>
                        <div className="relative bg-gray-100">
                          <span className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-bold rounded w-6 h-6 flex items-center justify-center z-10 shadow">
                            {index + 1}
                          </span>
                          {slide.imageUrl ? (
                            <img src={slide.imageUrl} alt={slide.title} className="w-full h-32 object-cover" />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-2 bg-white border-t border-gray-100">
                          <h3 className="text-xs font-medium text-gray-800 truncate mb-0.5">{slide.title}</h3>
                          <p className="text-[10px] text-gray-500 truncate">{slide.content}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50">
                        <span className="bg-gray-700 text-white text-xs font-bold rounded w-7 h-7 flex items-center justify-center flex-shrink-0 shadow-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-gray-800 truncate">{slide.title}</h3>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{slide.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-20 p-2.5 bg-white border-2 border-gray-300 rounded-lg shadow-xl hover:bg-gray-50 hover:border-blue-500 transition-all z-50"
            title="Open Sidebar"
          >
            <Grid size={20} className="text-gray-700" />
          </button>
        )}

        {/* MAIN CANVAS */}
        <main className="flex-1 bg-white overflow-y-auto transition-colors duration-500">
          <div className="flex flex-col items-center gap-8 p-8">
            {slides.length === 0 ? (
              <div className="w-full max-w-5xl aspect-video rounded-xl shadow-lg flex items-center justify-center bg-white border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">No slides yet</h3>
                  <p className="text-gray-500 mb-4">Create your first slide to get started</p>
                  <button
                    onClick={handleAddSlide}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} /> Create Slide
                  </button>
                </div>
              </div>
            ) : (
              slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedSlide(slide);
                    setSelectedSlideIndex(index);
                  }}
                  className={`w-full max-w-5xl aspect-video rounded-xl shadow-lg overflow-hidden 
                    bg-gradient-to-br ${theme.bg} border 
                    ${selectedSlide?.id === slide.id ? "ring-4 ring-blue-500" : theme.border} 
                  cursor-pointer transition-all hover:shadow-xl`}
                >
                  {slide.id === selectedSlide?.id ? (
                    <div className="w-full h-full flex" style={{ fontFamily: theme.font }}>
                      {slide.layout !== "full-text" && slide.imageUrl && (
                        <div className={`${slide.layout === "full-image" ? "w-full" : "flex-1"} relative`}>
                          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`${slide.layout === "full-image" ? "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" : "flex-1"} flex flex-col justify-center px-12 py-10`}>
                        <input
                          value={slide.title}
                          onChange={(e) => updateSlideContent("title", e.target.value)}
                          className={`text-3xl font-bold mb-4 bg-transparent focus:outline-none ${
                            slide.layout === "full-image" ? "text-white" : theme.text
                          }`}
                          style={{ textAlign: slide.textAlign }}
                          placeholder="Slide title..."
                        />
                        <textarea
                          value={slide.content}
                          onChange={(e) => updateSlideContent("content", e.target.value)}
                          className={`text-base leading-relaxed bg-transparent focus:outline-none resize-none h-32 overflow-y-auto 
                            scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent
                            [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0
                            ${slide.layout === "full-image" ? "text-white/90" : "text-gray-600"}`}
                          style={{ textAlign: slide.textAlign }}
                          placeholder="Add your content here..."
                        />
                      </div>
                    </div>
                  ) : (
                    renderSlideContent(slide, false)
                  )}

                  {/* Slide number indicator */}
                  {/* <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </div> */}
                </motion.div>
              ))
            )}
          </div>

          {/* Floating Toolbar */}
          {selectedSlide && (
            <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white border border-gray-200 p-2 rounded-xl shadow-lg z-50">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <ImageIcon size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                onClick={handleChangeImage}
                title="Generate New Image"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <RefreshCcw size={18} />
              </button>

              <button
                onClick={handleAddSlide}
                title="Add Slide"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <Plus size={18} />
              </button>

              <button
                onClick={handleAddChart}
                title="Add Chart"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <BarChart2 size={18} />
              </button>

              <button
                onClick={handleChangeLayout}
                title="Change Layout"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <Layout size={18} />
              </button>

              <div className="w-full h-px bg-gray-200 my-1" />

              <button
                onClick={() => handleTextAlign("left")}
                title="Align Left"
                className={`p-2.5 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all ${
                  selectedSlide.textAlign === "left" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-600"
                }`}
              >
                <AlignLeft size={18} />
              </button>

              <button
                onClick={() => handleTextAlign("center")}
                title="Align Center"
                className={`p-2.5 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all ${
                  selectedSlide.textAlign === "center" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-600"
                }`}
              >
                <AlignCenter size={18} />
              </button>

              <button
                onClick={() => handleTextAlign("right")}
                title="Align Right"
                className={`p-2.5 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all ${
                  selectedSlide.textAlign === "right" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-600"
                }`}
              >
                <AlignRight size={18} />
              </button>

              <div className="w-full h-px bg-gray-200 my-1" />

              <button
                onClick={handleEnhance}
                title="AI Enhance"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <Sparkles size={18} />
              </button>

              <button
                onClick={handleDuplicateSlide}
                title="Duplicate Slide"
                className="p-2.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all"
              >
                <Copy size={18} />
              </button>

              <button
                onClick={handleDeleteSlide}
                title="Delete Slide"
                className="p-2.5 rounded-lg bg-white hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditorPage;