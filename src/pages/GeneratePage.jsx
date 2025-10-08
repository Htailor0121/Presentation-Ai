import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
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
  
    try {
      let outlineData = null;
  
      // 🧠 Case 1: user uploaded files (with or without prompt)
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file) => formData.append("file", file));
  
        // Upload and process all files
        const uploadResponses = await Promise.all(
          uploadedFiles.map(async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const res = await axios.post(`${API_BASE}/upload-document`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
          })
        );
  
        // Combine all extracted contents
        const combinedContent = uploadResponses
          .map((res) => res.content)
          .join("\n\n");
  
        // 🧩 Combine uploaded file data + optional prompt
        const fullPrompt = prompt
          ? `${prompt}\n\n${combinedContent}`
          : combinedContent;
  
        // 🔹 Step 1: Summarize document → outline-only
        const outlineRes = await axios.post(`${API_BASE}/summarize-document`, {
          content: fullPrompt,
          filename: uploadedFiles.map((f) => f.name).join(", "),
          outline_only: true,
        });
  
        outlineData = outlineRes.data.outline || outlineRes.data.sections || [];
      } 
      // 🧠 Case 2: user typed prompt only
      else {
        const res = await axios.post(`${API_BASE}/generate-outline`, {
          content: prompt,
        });
        outlineData = res.data.sections || res.data.outline || [];
      }
  
      // ✅ Navigate to OutlinePage with generated outline
      navigate("/outline", {
        state: {
          prompt,
          type,
          theme,
          uploadedFiles,
          outline: outlineData,
        },
      });
    } catch (error) {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate outline. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

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
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mt-4">Generate</h1>
      <p className="text-gray-600 mt-2 text-lg">
        What would you like to create today?
      </p>

      {/* Type selection */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {["Presentation", "Webpage", "Document", "Social"].map((item) => (
          <button
            key={item}
            onClick={() => setType(item)}
            className={`px-5 py-3 rounded-xl border text-sm font-medium shadow-sm transition ${
              type === item
                ? "bg-blue-50 text-blue-600 border-blue-300"
                : "bg-white text-gray-600 hover:text-blue-600"
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
          className="px-4 py-2 rounded-lg border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
            placeholder="Describe what you'd like to make..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-28 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />

          {/* File upload + Google Drive buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg border border-blue-200 text-sm font-medium">
              📁
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  setUploadedFiles((prev) => [...prev, ...newFiles]);
                }}
              />
            </label>

            <button
              onClick={() => toast("Google Drive integration coming soon!")}
              className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg border border-green-200 text-sm font-medium"
            >
              ☁️
            </button>
          </div>
        </div>

        {/* Show uploaded files */}
        {uploadedFiles.length > 0 && (
          <div className="w-full mt-3 bg-white rounded-xl shadow-sm border p-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                <span>{file.name}</span>
                <button
                  onClick={() =>
                    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`mt-6 flex items-center justify-center gap-2 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white font-medium py-3 px-8 rounded-full transition-all`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate outline
            </>
          )}
        </button>
      </div>

      {/* Example prompts */}
      {prompt.length === 0 && (
        <div className="mt-12 w-full max-w-4xl px-6 text-center">
          <h3 className="text-gray-600 text-lg font-medium mb-4">
            Example prompts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examplePrompts.map((text, i) => (
              <div
                key={i}
                onClick={() => setPrompt(text)}
                className="bg-white rounded-xl p-4 shadow-sm border hover:border-blue-300 cursor-pointer hover:shadow-md transition-all"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
