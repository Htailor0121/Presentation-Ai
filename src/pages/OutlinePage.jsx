import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import presentationAPI from "../services/api";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const OutlinePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { prompt = "", uploadedFiles = [], theme, type } = location.state || {};

  const [outline, setOutline] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingSlides, setGeneratingSlides] = useState(false);

  // Customization options
  const [textLevel, setTextLevel] = useState("concise");
  const [selectedTheme, setSelectedTheme] = useState(theme || "Default");
  const [imageStyle, setImageStyle] = useState("Illustration");

  //  Fetch AI Outline from Backend
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

        // 📂 If user uploaded files
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

          // 🧠 Merge typed prompt + file content
          combinedContent = prompt.trim()
            ? `${prompt}\n\nHere is supporting content from uploaded file(s):\n${combinedFileText}`
            : combinedFileText;
        }

        // 🪄 Generate summary/outline (8-15 sections)
        const outlineRes = await axios.post(
          `${API_BASE}/summarize-document`,
          {
            content: combinedContent,
            filename,
            outline_only: true, //  This ensures 8-15 text-only sections
          }
        );

        toast.dismiss(loadingToast);
        toast.success("✨ Outline generated successfully!");

        const items =
          outlineRes.data?.outline ||
          outlineRes.data?.sections ||
          [];

        //  Validate outline count (8-15)
        if (items.length < 8 || items.length > 15) {
          console.warn(` Warning: Got ${items.length} sections (expected 8-15)`);
        }

        console.log(` Received ${items.length} outline sections`);

        setOutline(items);
        setLoading(false);

        // Progressive reveal animation
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setVisibleCount(i);
          if (i >= items.length) clearInterval(interval);
        }, 400);
      } catch (error) {
        console.error(" Error generating outline:", error);
        toast.dismiss();
        toast.error(
          error.response?.data?.detail || "Failed to generate outline. Try again."
        );
        setLoading(false);
      }
    };

    generateOutline();
  }, [location.state, navigate]);

  //  Generate Full Slides from Outline
  const handleGenerateSlides = async () => {
    try {
      setGeneratingSlides(true);
      const loadingToast = toast.loading("🎨 AI is generating your slides...");
  
      console.log(`🎯 Generating ${outline.length} slides from outline...`);
  
      //  Create a better prompt that includes outline context
      // but asks AI to create INDIVIDUAL slides (not dump everything)
      const outlineSummary = outline
        .map((item, idx) => `${idx + 1}. ${item.title}`)
        .join("\n");
  
      const fullPrompt = `Create a ${outline.length}-slide presentation based on this outline:
  
  ${outlineSummary}
  
  IMPORTANT: Create ${outline.length} separate slides. Each slide should have:
  - Its own specific title (from the outline)
  - Concise bullet points (3-5 points per slide)
  - Do NOT repeat content across slides
  
  Return EXACTLY ${outline.length} slides.`;
  
      //  Call backend to generate complete slides with AI
      const res = await axios.post(`${API_BASE}/generate-presentation`, {
        prompt: fullPrompt,
        model: "mistralai/mistral-7b-instruct:free",
        theme: selectedTheme,
        include_interactive: true,
        num_slides: outline.length, //  Force exact count
      });
  
      toast.dismiss(loadingToast);
  
      const slideCount = res.data?.slides?.length || 0;
  
      //  Validate slide count matches outline
      if (slideCount !== outline.length) {
        console.warn(
          ` Warning: Generated ${slideCount} slides but outline has ${outline.length} sections`
        );
      }
  
      //  Ensure all slides have images
      const slidesWithImages = res.data.slides.map((slide, idx) => {
        // If image is missing or broken, add fallback
        if (!slide.imageUrl || slide.imageUrl.includes('placeholder')) {
          const imagePrompt = slide.title || `Slide ${idx + 1}`;
          slide.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            `${imagePrompt}, professional presentation, modern, high quality, 4k`
          )}?width=1920&height=1080&nologo=true&enhance=true&seed=${Date.now() + idx}`;
        }
        return slide;
      });
  
      toast.success(` Generated ${slideCount} slides successfully!`);
  
      // Navigate to editor with AI-generated slides
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
      console.error(" Error generating slides:", err);
    } finally {
      setGeneratingSlides(false);
    }
  };

  return (
    <div
      className="relative min-h-screen text-gray-800 flex flex-col items-center py-16 px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #fdfdfd 0%, #eaf1ff 50%, #c8dbff 100%)",
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

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 mt-10"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Generated Outline
        </h1>
        <p className="text-gray-600 text-lg">
          {loading
            ? "Analyzing your content..."
            : `${outline.length} sections ready for review`}
        </p>
      </motion.div>

      {/* Outline display */}
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-lg animate-pulse">
            Generating outline...
          </p>
        </div>
      ) : (
        <div className="w-full max-w-3xl space-y-4 mb-12">
          {outline.slice(0, visibleCount).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title || `Section ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.content || "AI-generated section overview"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customization Panel */}
      {!loading && outline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full max-w-4xl mb-20"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">
            Customize Your Presentation
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-gray-700">
            {/* Text Level */}
            <div>
              <h3 className="font-medium mb-3 text-gray-800">Text Content</h3>
              <div className="flex flex-wrap gap-2">
                {["Minimal", "Concise", "Detailed", "Extensive"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setTextLevel(level.toLowerCase())}
                    className={`px-4 py-2 rounded-xl border transition-all ${
                      textLevel === level.toLowerCase()
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <h3 className="font-medium mb-3 text-gray-800">Visual Theme</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Default", "Professional", "Minimal", "Creative"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTheme(t)}
                    className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                      selectedTheme === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Style */}
            <div>
              <h3 className="font-medium mb-3 text-gray-800">Image Style</h3>
              <div className="flex flex-wrap gap-2">
                {["Illustration", "Photorealistic", "Abstract", "3D"].map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => setImageStyle(style)}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        imageStyle === style
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer with Generate Button */}
      {!loading && outline.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg flex justify-between items-center px-8 py-4 z-40">
          <div className="text-gray-600 text-sm font-medium">
             {outline.length} sections ready
            {outline.length < 8 && (
              <span className="text-orange-500 ml-2">
                ( Less than 8 sections)
              </span>
            )}
            {outline.length > 15 && (
              <span className="text-orange-500 ml-2">
                ( More than 15 sections)
              </span>
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
                Generating {outline.length} Slides...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {outline.length} Slides
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OutlinePage;