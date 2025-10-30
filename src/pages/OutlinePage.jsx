import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react";
import presentationAPI from "../services/api";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const OutlinePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { prompt = "", uploadedFiles = [], theme, type } = location.state || {};

  const [outline, setOutline] = useState([]);
  const [expandedCards, setExpandedCards] = useState({}); // Track which cards are expanded
  const [loading, setLoading] = useState(true);
  const [generatingSlides, setGeneratingSlides] = useState(false);

  // Customization options
  const [textLevel, setTextLevel] = useState("concise");
  const [selectedTheme, setSelectedTheme] = useState(theme || "Default");
  const [imageStyle, setImageStyle] = useState("Illustration");

  // Character count
  const [charCount, setCharCount] = useState(0);
  const maxChars = 50000;

  // Calculate total character count
  useEffect(() => {
    const total = outline.reduce((sum, item) => {
      return sum + (item.title?.length || 0) + (item.content?.length || 0);
    }, 0);
    setCharCount(total);
  }, [outline]);

  // Fetch AI Outline from Backend
  useEffect(() => {
    const generateOutline = async () => {
      try {
        if (!location.state) {
          toast.error("No data provided!");
          navigate("/");
          return;
        }

        setLoading(true);
        const loadingToast = toast.loading("🧠 Analyzing your content with AI...");

        let combinedContent = prompt;
        let filename = "prompt";

        // If user uploaded files
        if (uploadedFiles.length > 0) {
          const allTexts = [];

          for (const file of uploadedFiles) {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await axios.post(
              `${API_BASE}/upload-document`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (uploadRes.data.content) {
              allTexts.push(uploadRes.data.content);
            }

            filename = file.name;
          }

          const combinedFileText = allTexts.join("\n\n");
          combinedContent = prompt.trim()
            ? `${prompt}\n\nHere is supporting content from uploaded file(s):\n${combinedFileText}`
            : combinedFileText;
        }

        // Generate outline (8-15 sections)
        const outlineRes = await axios.post(
          `${API_BASE}/summarize-document`,
          {
            content: combinedContent,
            filename,
            outline_only: true,
          }
        );

        toast.dismiss(loadingToast);
        toast.success("✨ Outline generated successfully!");

        const items =
          outlineRes.data?.outline ||
          outlineRes.data?.sections ||
          [];

        if (items.length < 8 || items.length > 15) {
          console.warn(`⚠️ Warning: Got ${items.length} sections (expected 8-15)`);
        }

        console.log(`📋 Received ${items.length} outline sections`);

        setOutline(items);
        
        // Auto-expand first 3 cards
        const initialExpanded = {};
        items.slice(0, 3).forEach((_, idx) => {
          initialExpanded[idx] = true;
        });
        setExpandedCards(initialExpanded);
        
        setLoading(false);
      } catch (error) {
        console.error("❌ Error generating outline:", error);
        toast.dismiss();
        toast.error(
          error.response?.data?.detail || "Failed to generate outline. Try again."
        );
        setLoading(false);
      }
    };

    generateOutline();
  }, [location.state, navigate]);

  // Toggle card expansion
  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Add new card
  const handleAddCard = () => {
    const newCard = {
      title: `New Section ${outline.length + 1}`,
      content: "Add your content here..."
    };
    setOutline([...outline, newCard]);
    setExpandedCards(prev => ({ ...prev, [outline.length]: true }));
    toast.success("➕ New card added!");
  };

  // Delete card
  const handleDeleteCard = (index) => {
    if (outline.length <= 8) {
      toast.error("Cannot delete! Minimum 8 sections required.");
      return;
    }
    const newOutline = outline.filter((_, idx) => idx !== index);
    setOutline(newOutline);
    toast.success("🗑️ Card deleted!");
  };

  // Update card content
  const updateCard = (index, field, value) => {
    const newOutline = [...outline];
    newOutline[index] = {
      ...newOutline[index],
      [field]: value
    };
    setOutline(newOutline);
  };

  // Generate Full Slides
  const handleGenerateSlides = async () => {
    try {
      setGeneratingSlides(true);
      const loadingToast = toast.loading("🎨 AI is generating your slides...");

      console.log(`🎯 Generating ${outline.length} slides from outline...`);

      const res = await axios.post(`${API_BASE}/generate-presentation`, {
        prompt: prompt || "Create professional presentation",
        model: "mistralai/mistral-7b-instruct:free",
        theme: selectedTheme,
        include_interactive: true,
        num_slides: outline.length,
        outline_sections: outline.map((item, idx) => ({
          title: item.title || `Section ${idx + 1}`,
          content: item.content || ""
        })),
        audience: "professionals",
        purpose: "inform",
        text_level: textLevel,
        image_style: imageStyle
      });

      toast.dismiss(loadingToast);

      const slideCount = res.data?.slides?.length || 0;

      if (slideCount !== outline.length) {
        console.warn(
          `⚠️ Warning: Generated ${slideCount} slides but outline has ${outline.length} sections`
        );
      }

      const slidesWithImages = res.data.slides.map((slide, idx) => {
        if (!slide.imageUrl || slide.imageUrl.includes('placeholder')) {
          const imagePrompt = slide.title || `Slide ${idx + 1}`;
          slide.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            `${imagePrompt}, ${imageStyle} style, professional, high quality, 4k`
          )}?width=1920&height=1080&nologo=true&enhance=true&seed=${Date.now() + idx}`;
        }
        return slide;
      });

      toast.success(`✅ Generated ${slideCount} slides successfully!`);

      navigate("/editor", {
        state: {
          outline: slidesWithImages,
          theme: selectedTheme,
        },
      });
    } catch (err) {
      toast.dismiss();
      toast.error(
        err.response?.data?.detail || "Failed to generate slides. Please try again."
      );
      console.error("❌ Error generating slides:", err);
    } finally {
      setGeneratingSlides(false);
    }
  };

  return (
    <div
      className="relative min-h-screen text-gray-800 flex flex-col items-center py-8 px-4 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #fdfdfd 0%, #eaf1ff 50%, #c8dbff 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-all"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      {/* Loader overlay */}
      {generatingSlides && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-700 font-medium text-lg">
            🎨 AI is crafting your {outline.length} slides...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This may take a minute. Hang tight!
          </p>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6 mt-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Generate</h1>
      </motion.div>

      {/* Top Controls */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <span className="text-sm text-gray-600">Prompt</span>
        </div>
        
        <select 
          value={outline.length}
          disabled
          className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm"
        >
          <option>{outline.length} cards</option>
        </select>

        <select 
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm"
        >
          <option>Default</option>
          <option>Professional</option>
          <option>Minimal</option>
          <option>Creative</option>
        </select>

        <select 
          className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm"
        >
          <option>🌐 English (US)</option>
        </select>
      </div>

      {/* Prompt Display */}
      <div className="w-full max-w-4xl mb-4">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-700 leading-relaxed">
            {prompt || "Offering advice and guidance on legal, financial, or technical matters to help clients make informed decisions"}
          </p>
        </div>
      </div>

      {/* Outline Label */}
      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Outline</h2>
      </div>

      {/* Outline Cards */}
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-lg animate-pulse">
            Generating outline...
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-3 mb-8">
          <AnimatePresence>
            {outline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Card Header */}
                <div 
                  className="flex items-start gap-4 p-5 cursor-pointer"
                  onClick={() => toggleCard(idx)}
                >
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 leading-snug">
                      {item.title || `Section ${idx + 1}`}
                    </h3>
                    
                    {/* Collapsed: Show preview */}
                    {!expandedCards[idx] && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {item.content || "AI-generated section overview"}
                      </p>
                    )}

                    {/* Expanded: Show full content with bullets */}
                    {expandedCards[idx] && (
                      <div className="mt-3 space-y-2">
                        {item.content?.split('\n').filter(line => line.trim()).map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <p className="text-sm text-gray-700 leading-relaxed flex-1">
                              {line.replace(/^[•\-]\s*/, '')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Icon */}
                  <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition">
                    {expandedCards[idx] ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </button>

                  {/* Delete Button (shown on hover) */}
                  {outline.length > 8 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(idx);
                      }}
                      className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition"
                      title="Delete card"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Card Button */}
          {outline.length < 15 && (
            <button
              onClick={handleAddCard}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium"
            >
              <Plus size={20} />
              <span>Add card</span>
            </button>
          )}

          {/* Card Break Info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>{outline.length} cards total</p>
            <p className="text-xs mt-1">Type <code className="bg-gray-100 px-2 py-0.5 rounded">---</code> for card breaks</p>
          </div>

          {/* Character Count */}
          <div className="text-right text-sm text-gray-500">
            {charCount}/{maxChars}
          </div>
        </div>
      )}

      {/* Customization Panel */}
      {!loading && outline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl border shadow-lg p-8 w-full max-w-4xl mb-20"
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            Customize your gamma
          </h2>

          {/* Text Content */}
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-blue-600">≡</span> Text Content
            </h3>
            <p className="text-sm text-gray-600 mb-4">Amount of text per card</p>
            <div className="flex gap-3">
              {["Minimal", "Concise", "Detailed", "Extensive"].map((level) => (
                <button
                  key={level}
                  onClick={() => setTextLevel(level.toLowerCase())}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium ${
                    textLevel === level.toLowerCase()
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
                >
                  <div className="mb-2">
                    {level === "Minimal" && <div className="h-1 w-12 bg-current mx-auto"></div>}
                    {level === "Concise" && <div className="space-y-1"><div className="h-1 w-16 bg-current mx-auto"></div><div className="h-1 w-12 bg-current mx-auto"></div></div>}
                    {level === "Detailed" && <div className="space-y-1"><div className="h-1 w-20 bg-current mx-auto"></div><div className="h-1 w-16 bg-current mx-auto"></div><div className="h-1 w-12 bg-current mx-auto"></div></div>}
                    {level === "Extensive" && <div className="space-y-1"><div className="h-1 w-24 bg-current mx-auto"></div><div className="h-1 w-20 bg-current mx-auto"></div><div className="h-1 w-16 bg-current mx-auto"></div><div className="h-1 w-12 bg-current mx-auto"></div></div>}
                  </div>
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Visuals Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-4 text-gray-700 flex items-center gap-2">
              <span className="text-blue-600">🖼️</span> Visuals
            </h3>

            {/* Theme */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Theme</p>
                <button className="text-sm text-blue-600 hover:underline">
                  View more
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Stardust", bg: "bg-black", text: "text-white" },
                  { name: "Finesse", bg: "bg-amber-50", text: "text-gray-800" },
                  { name: "Prism", bg: "bg-purple-50", text: "text-gray-800" }
                ].map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme.name)}
                    className={`aspect-video rounded-lg border-2 ${theme.bg} ${theme.text} flex flex-col items-center justify-center transition-all ${
                      selectedTheme === theme.name
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">Title</div>
                    <div className="text-[10px]">Body & link</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Style */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Image art style</p>
              <div className="flex gap-2 flex-wrap">
                {["Illustration", "Photorealistic", "Abstract", "3D", "Line Art"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setImageStyle(style)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      imageStyle === style
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer with Generate Button */}
      {!loading && outline.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg flex justify-between items-center px-8 py-4 z-40">
          <div className="text-gray-600 text-sm font-medium flex items-center gap-4">
            <span>✨ {outline.length} cards total</span>
            {outline.length < 8 && (
              <span className="text-orange-500">⚠️ Less than 8 sections</span>
            )}
            {outline.length > 15 && (
              <span className="text-orange-500">⚠️ More than 15 sections</span>
            )}
          </div>

          <button
            onClick={handleGenerateSlides}
            disabled={generatingSlides || outline.length === 0}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-white text-base transition-all shadow-md ${
              generatingSlides || outline.length === 0
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            {generatingSlides ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OutlinePage;