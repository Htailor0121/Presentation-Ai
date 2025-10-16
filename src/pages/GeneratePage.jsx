import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Upload, Cloud, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("Presentation");
  const [theme, setTheme] = useState("Default");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim() && uploadedFiles.length === 0) {
      toast.error("Please enter a topic or upload a file!");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("🧠 Analyzing your content...");

    try {
      let outlineData = null;

      // ============================================================
      // 🧠 Case 1: User uploaded files (with or without prompt)
      // ============================================================
      if (uploadedFiles.length > 0) {
        console.log(`📂 Processing ${uploadedFiles.length} uploaded file(s)...`);

        // Upload and extract text from all files
        const uploadResponses = await Promise.all(
          uploadedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post(`${API_BASE}/upload-document`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
          })
        );

        // Combine all extracted text
        const combinedContent = uploadResponses
          .map((res) => res.content)
          .join("\n\n");

        console.log(` Extracted ${combinedContent.length} characters from files`);

        // 🧩 Combine file content + optional user prompt
        const fullPrompt = prompt.trim()
          ? `${prompt}\n\n--- Document Content ---\n${combinedContent}`
          : combinedContent;

        // 📍 Generate outline from document (8-15 sections, no images yet)
        const outlineRes = await axios.post(`${API_BASE}/summarize-document`, {
          content: fullPrompt,
          filename: uploadedFiles.map((f) => f.name).join(", "),
          outline_only: true, //  Fast mode: text-only outline
        });

        // Extract sections
        outlineData = outlineRes.data.outline || outlineRes.data.sections || [];

        console.log(` Generated ${outlineData.length} outline sections from files`);
      }
      // ============================================================
      // 🧠 Case 2: User typed prompt only (no files)
      // ============================================================
      else {
        console.log(`💭 Generating outline from text prompt...`);

        const res = await axios.post(`${API_BASE}/generate-outline`, {
          content: prompt,
        });

        // Extract sections
        outlineData = res.data.sections || res.data.outline || [];

        console.log(` Generated ${outlineData.length} outline sections from prompt`);
      }

      toast.dismiss(loadingToast);

      //  Validate outline count (should be 8-15)
      if (outlineData.length < 8) {
        toast.error(
          ` Only ${outlineData.length} sections generated. Expected at least 8.`,
          { duration: 4000 }
        );
        console.warn(` Warning: Got ${outlineData.length} sections (expected min 8)`);
      } else if (outlineData.length > 15) {
        toast.error(
          ` Generated ${outlineData.length} sections. Expected max 15.`,
          { duration: 4000 }
        );
        console.warn(` Warning: Got ${outlineData.length} sections (expected max 15)`);
      } else {
        toast.success(` Generated ${outlineData.length} outline sections!`);
      }

      //  Navigate to OutlinePage with outline data
      navigate("/outline", {
        state: {
          prompt: prompt || uploadedFiles.map((f) => f.name).join(", "),
          type,
          theme,
          uploadedFiles,
          outline: outlineData, // 8-15 text-only sections
        },
      });
    } catch (error) {
      console.error(" Error generating outline:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error.response?.data?.detail || "Failed to generate outline. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
    toast.success("File removed");
  };

  // Example prompts
  const examplePrompts = [
    "The best and worst slang Gen Z uses",
    "How to design user interfaces for mobile apps",
    "Pitch deck for a startup idea",
    "F1 Legends",
    "Physics of black holes",
    "How streaming changed the music industry",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9fafb] to-[#cfe8ff] flex flex-col items-center">
      {/* Back button */}
      <div className="w-full px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
      </div>

      {/* Title */}
      <div className="text-center mt-4">
        <h1 className="text-4xl font-bold text-gray-900">Generate</h1>
        <p className="text-gray-600 mt-2 text-lg">
          What would you like to create today?
        </p>
      </div>

      {/* Type selection */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {["Presentation", "Webpage", "Document", "Social"].map((item) => (
          <button
            key={item}
            onClick={() => setType(item)}
            className={`px-5 py-3 rounded-xl border text-sm font-medium shadow-sm transition ${
              type === item
                ? "bg-blue-50 text-blue-600 border-blue-300"
                : "bg-white text-gray-600 hover:text-blue-600 hover:border-blue-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Theme selection */}
      <div className="mt-6">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        >
          <option>Default</option>
          <option>Professional</option>
          <option>Minimal</option>
          <option>Creative</option>
        </select>
      </div>

      {/* Input + upload buttons */}
      <div className="mt-10 w-full max-w-3xl px-6 flex flex-col items-center">
        <div className="relative w-full">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading) {
                handleGenerate();
              }
            }}
            placeholder="Describe what you'd like to make..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-32 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
          />

          {/* File upload + Google Drive buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <label
              className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg border border-blue-200 text-sm font-medium transition flex items-center gap-1"
              title="Upload file (PDF, DOCX, PPT, TXT, CSV, XLSX)"
            >
              <Upload size={16} />
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.pptx,.xlsx,.csv,.png,.jpg,.jpeg,.bmp,.tiff"
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  setUploadedFiles((prev) => [...prev, ...newFiles]);
                  toast.success(`${newFiles.length} file(s) added`);
                }}
              />
            </label>

            <button
              onClick={() => toast("☁️ Google Drive integration coming soon!")}
              className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg border border-green-200 text-sm font-medium transition"
              title="Import from Google Drive (Coming Soon)"
            >
              <Cloud size={16} />
            </button>
          </div>
        </div>

        {/* Show uploaded files */}
        {uploadedFiles.length > 0 && (
          <div className="w-full mt-4 bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              📁 Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm border border-blue-200"
                >
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(i)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || (!prompt.trim() && uploadedFiles.length === 0)}
          className={`mt-6 flex items-center justify-center gap-2 ${
            loading || (!prompt.trim() && uploadedFiles.length === 0)
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
          } text-white font-medium py-3 px-8 rounded-full transition-all shadow-md`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating outline...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate outline
            </>
          )}
        </button>

        {/* Info text */}
        <p className="text-gray-500 text-sm mt-3 text-center">
          {uploadedFiles.length > 0
            ? "We'll analyze your files and create an outline"
            : "Press Enter or click the button to generate"}
        </p>
      </div>

      {/* Example prompts */}
      {prompt.length === 0 && uploadedFiles.length === 0 && (
        <div className="mt-12 w-full max-w-4xl px-6 text-center">
          <h3 className="text-gray-600 text-lg font-medium mb-4">
            💡 Example prompts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examplePrompts.map((text, i) => (
              <div
                key={i}
                onClick={() => setPrompt(text)}
                className="bg-white rounded-xl p-4 shadow-sm border hover:border-blue-300 cursor-pointer hover:shadow-md transition-all"
              >
                <p className="text-gray-800 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features info */}
      <div className="mt-16 w-full max-w-4xl px-6 mb-12">
        <div className="bg-white rounded-2xl shadow-md border p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            ✨ What happens next?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                1
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Outline Generation</h4>
              <p className="text-sm text-gray-600">
                AI creates 8-15 structured sections from your content
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                2
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Review & Customize</h4>
              <p className="text-sm text-gray-600">
                Preview outline, adjust theme and style preferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                3
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Generate Slides</h4>
              <p className="text-sm text-gray-600">
                AI creates complete slides with images and content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}