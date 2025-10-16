import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Enhanced axios instance with NO timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 0, // 🔥 NO TIMEOUT - will wait indefinitely
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Retry helper
const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      const isLastRetry = i === retries - 1;
      const isServerError = error.response?.status >= 500;
      const isTimeout = error.code === 'ECONNABORTED';
      
      if (isLastRetry || (!isServerError && !isTimeout)) {
        throw error;
      }
      
      console.log(`Retry ${i + 1}/${retries} after error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
};

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error(" Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(` API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(` API Error: ${error.response.status} - ${error.response.data?.detail || error.message}`);
    } else if (error.request) {
      console.error(" No response from server");
    } else {
      console.error(" Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const presentationAPI = {
  // 🎨 Generate presentation with retry
  generatePresentation: async (prompt, model) => {
    return retryRequest(async () => {
      const response = await api.post("/generate-presentation", { prompt, model });
      return response.data;
    });
  },

  // 💾 Save presentation
  savePresentation: async (presentation) => {
    return retryRequest(async () => {
      const response = await api.post("/save-presentation", presentation);
      return response.data;
    });
  },

  // 📂 Get all presentations
  getPresentations: async () => {
    return retryRequest(async () => {
      const response = await api.get("/presentations");
      return response.data;
    });
  },

  // 🏥 Health check
  healthCheck: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      return { status: "ERROR", error: error.message };
    }
  },

  // 🤖 Get available AI models
  getAvailableModels: async () => {
    return retryRequest(async () => {
      const response = await api.get("/models");
      return response.data;
    });
  },

  // 🖼️ Generate image with retry and fallback
  generateImage: async (prompt) => {
    return retryRequest(async () => {
      const response = await api.post("/generate-image", { prompt });
      return response.data;
    }, 2); // Fewer retries for images
  },

  // 📄 Upload document - NO TIMEOUT
  uploadDocument: async (formData) => {
    return retryRequest(async () => {
      const response = await api.post("/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // 🔥 NO timeout specified - uses global setting (0)
      });
      return response.data;
    });
  },

  // 🌐 Ingest URL
  ingestUrl: async (url) => {
    return retryRequest(async () => {
      const response = await api.post("/ingest-url", { url });
      return response.data;
    });
  },

  // 📝 Ingest pasted text
  ingestText: async (text, name) => {
    return retryRequest(async () => {
      const response = await api.post("/ingest-text", { text, name });
      return response.data;
    });
  },

  // 📋 Summarize document (outline-only by default)
  summarizeDocument: async (content, filename, outlineOnly = true) => {
    return retryRequest(async () => {
      if (Array.isArray(content)) {
        content = content.join(" ");
      }

      const response = await api.post("/summarize-document", {
        content,
        filename,
        outline_only: outlineOnly,
      });

      return response.data;
    });
  },

  // 🧭 Generate outline (for text input only)
  generateOutline: async (content) => {
    return retryRequest(async () => {
      const response = await api.post("/generate-outline", { content });
      return response.data;
    });
  },

  // ✨ AI - Enhance Slide
  enhanceSlide: async (prompt) => {
    return retryRequest(async () => {
      const response = await api.post("/enhance-slide", { prompt });
      return response.data;
    });
  },

  // 📝 AI - Rewrite Slide
  rewriteSlide: async (prompt) => {
    return retryRequest(async () => {
      const response = await api.post("/rewrite-slide", { prompt });
      return response.data;
    });
  },

  // 📈 AI - Expand Slide
  expandSlide: async (prompt) => {
    return retryRequest(async () => {
      const response = await api.post("/expand-slide", { prompt });
      return response.data;
    });
  },

  // 🪄 AI - Summarize Slide
  summarizeSlide: async (prompt) => {
    return retryRequest(async () => {
      const response = await api.post("/summarize-slide", { prompt });
      return response.data;
    });
  },

  // 🎨 AI - Change Tone
  changeTone: async (prompt) => {
    return retryRequest(async () => {
      const response = await api.post("/change-tone", { prompt });
      return response.data;
    });
  },

  // 🎯 Batch operations with progress tracking
  batchEnhanceSlides: async (slides, onProgress) => {
    const results = [];
    for (let i = 0; i < slides.length; i++) {
      try {
        const result = await presentationAPI.enhanceSlide(slides[i].content);
        results.push({ ...slides[i], content: result.enhanced });
        if (onProgress) onProgress(i + 1, slides.length);
      } catch (error) {
        console.error(`Failed to enhance slide ${i + 1}:`, error);
        results.push(slides[i]); // Keep original on failure
      }
    }
    return results;
  },

  // 📊 Get presentation analytics (placeholder for future)
  getPresentationAnalytics: async (presentationId) => {
    try {
      const response = await api.get(`/analytics/${presentationId}`);
      return response.data;
    } catch (error) {
      console.warn("Analytics not available");
      return null;
    }
  },

  // 🔍 Search presentations (placeholder for future)
  searchPresentations: async (query) => {
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.warn("Search not available");
      return [];
    }
  },

  // 🎨 Get themes
  getThemes: async () => {
    return retryRequest(async () => {
      const response = await api.get("/themes");
      return response.data;
    });
  },

  // 🎨 Create custom theme
  createTheme: async (themeData) => {
    return retryRequest(async () => {
      const response = await api.post("/create-theme", themeData);
      return response.data;
    });
  },

  // 📊 Recent prompts (if backend supports it)
  getRecentPrompts: async () => {
    try {
      const response = await api.get("/recent-prompts");
      return response.data;
    } catch (error) {
      console.warn("Recent prompts not available");
      return [];
    }
  },
};

// Export helper for direct API calls
export const directAPICall = async (endpoint, method = "GET", data = null) => {
  return retryRequest(async () => {
    const config = {
      method,
      url: endpoint,
      ...(data && { data }),
    };
    const response = await api(config);
    return response.data;
  });
};

export default presentationAPI;