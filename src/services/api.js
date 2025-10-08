import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const presentationAPI = {
  // Generate presentation from prompt
  generatePresentation: async (prompt, model) => {
    try {
      const response = await api.post("/generate-presentation", { prompt, model });
      return response.data;
    } catch (error) {
      console.error("Error generating presentation:", error);
      throw new Error("Failed to generate presentation");
    }
  },

  // Save presentation
  savePresentation: async (presentation) => {
    try {
      const response = await api.post("/save-presentation", presentation);
      return response.data;
    } catch (error) {
      console.error("Error saving presentation:", error);
      throw new Error("Failed to save presentation");
    }
  },

  // Get all presentations
  getPresentations: async () => {
    try {
      const response = await api.get("/presentations");
      return response.data;
    } catch (error) {
      console.error("Error fetching presentations:", error);
      throw new Error("Failed to fetch presentations");
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Error checking API health:", error);
      throw new Error("API is not responding");
    }
  },

  // Get available AI models
  getAvailableModels: async () => {
    try {
      const response = await api.get("/models");
      return response.data;
    } catch (error) {
      console.error("Error fetching models:", error);
      throw new Error("Failed to fetch AI models");
    }
  },

  // Generate image
  generateImage: async (prompt) => {
    try {
      const response = await api.post("/generate-image", { prompt });
      return response.data;
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error("Failed to generate image");
    }
  },

  // Upload document
  uploadDocument: async (formData) => {
    try {
      const response = await api.post("/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw new Error("Failed to upload document");
    }
  },

  // Ingest URL
  ingestUrl: async (url) => {
    try {
      const response = await api.post("/ingest-url", { url });
      return response.data;
    } catch (error) {
      console.error("Error ingesting URL:", error);
      throw new Error("Failed to ingest URL");
    }
  },

  // Ingest pasted text
  ingestText: async (text, name) => {
    try {
      const response = await api.post("/ingest-text", { text, name });
      return response.data;
    } catch (error) {
      console.error("Error ingesting text:", error);
      throw new Error("Failed to ingest text");
    }
  },

  // ✅ Summarize document (outline-only by default)
  summarizeDocument: async (content, filename, outlineOnly = true) => {
    try {
      if (Array.isArray(content)) {
        content = content.join(" ");
      }

      const response = await api.post("/summarize-document", {
        content,
        filename,
        outline_only: outlineOnly, // 👈 key part — outline-only flag
      });

      return response.data;
    } catch (error) {
      console.error("Error summarizing document:", error);
      throw new Error("Failed to summarize document");
    }
  },

  // Generate outline (for text input only)
  generateOutline: async (content) => {
    try {
      const response = await api.post("/generate-outline", { content });
      return response.data;
    } catch (error) {
      console.error("Error generating outline:", error);
      throw new Error("Failed to generate outline");
    }
  },
};

export default presentationAPI;
