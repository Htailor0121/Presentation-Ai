import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Sparkles } from "lucide-react";
import presentationAPI from "../services/api";
import axios from "axios";

const Outline = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const prompt = location.state?.content || "";
  const model = location.state?.model || "gpt-4"; // fallback model

  const [outline, setOutline] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingSlides, setGeneratingSlides] = useState(false);

  // Customization options
  const [textLevel, setTextLevel] = useState("concise");
  const [theme, setTheme] = useState("Default");
  const [imageStyle, setImageStyle] = useState("Illustration");

  // 🧠 Fetch AI Outline from Backend using your API wrapper
  useEffect(() => {
    const generateOutline = async () => {
      try {
        if (!location.state) {
          toast.error("No data provided!");
          navigate("/");
          return;
        }
  
        const { prompt = "", uploadedFiles = [], theme, type } = location.state;
        setLoading(true);
        toast.loading("Analyzing your content with AI...");
  
        let combinedContent = prompt;
        let filename = "prompt";
  
        // 📂 If user uploaded files
        if (uploadedFiles.length > 0) {
          const allTexts = [];
  
          for (const file of uploadedFiles) {
            const formData = new FormData();
            formData.append("file", file);
  
            const uploadRes = await axios.post(
              "http://localhost:5000/api/upload-document",
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
  
        // 🪄 Generate summary/outline
        const outlineRes = await axios.post(
          "http://localhost:5000/api/summarize-document",
          {
            content: combinedContent,
            filename,
            outline_only: true, // this tells backend: "Don't generate images, just text outline"
          }
        );
        
        toast.dismiss();
        toast.success("✨ Outline generated successfully!");
  
        const items =
          outlineRes.data?.slides ||
          outlineRes.data?.sections ||
          outlineRes.data?.outline ||
          [];
  
        setOutline(items);
        setLoading(false);
  
        // Progressive reveal
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setVisibleCount(i);
          if (i >= items.length) clearInterval(interval);
        }, 600);
      } catch (error) {
        console.error("Error generating outline:", error);
        toast.dismiss();
        toast.error(
          error.response?.data?.detail || "Failed to generate outline. Try again."
        );
        setLoading(false);
      }
    };
  
    generateOutline();
  }, [location.state, navigate]);
  

  // 🪄 Generate Slides from Outline
  const handleGenerateSlides = async () => {
    try {
      setGeneratingSlides(true);
      toast.loading("✨ AI is generating your slides...");

      // You can either use a dedicated API or reuse generatePresentation
      const res = await presentationAPI.generatePresentation(
        JSON.stringify(outline),
        model
      );

      toast.dismiss();
      toast.success("Slides generated successfully!");

      navigate("/editor", {
        state: {
          outline: res.slides || outline,
          theme,
        },
      });
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate slides.");
      console.error(err);
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
        <span className="text-lg">←</span>
        <span>Back</span>
      </button>

      {/* Loader overlay */}
      {generatingSlides && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-700 font-medium text-lg">
            AI is crafting your slides...
          </p>
        </div>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-gray-800 mb-10 mt-10"
      >
        Generated Outline
      </motion.h1>

      {/* Outline display */}
      {loading ? (
        <p className="text-gray-500 text-lg animate-pulse">
          Generating outline...
        </p>
      ) : (
        <div className="w-full max-w-3xl space-y-4 mb-12">
          {outline.slice(0, visibleCount).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-blue-600 font-bold text-lg">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title || `Section ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                    {item.content || "AI-generated section overview"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customization Panel */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full max-w-4xl"
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
              <div className="grid grid-cols-3 gap-2">
                {["Default", "Professional", "Minimal", "Creative"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                      theme === t
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

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-sm flex justify-between items-center px-8 py-4">
        <div className="text-gray-600 text-sm">{outline.length} slides total</div>

        <button
          onClick={handleGenerateSlides}
          disabled={generatingSlides}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold text-white text-base transition-all shadow-md ${
            generatingSlides
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {generatingSlides ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Slides
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Outline;
