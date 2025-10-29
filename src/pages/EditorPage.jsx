import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import presentationAPI from "../services/api";
import ThemeSelector, { themes as gradientThemes } from "../components/ThemeSelector";
import ExportModal from '../components/ExportModal';
import {
  MoreVertical,
  Palette,
  Sparkles,
  RefreshCw,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Save,
  Eye,
  Plus,
  Type,
  Image as ImageIcon,
  Search,
  BarChart2,
  Layout,
  RefreshCcw,
  ChevronDown,
  Grid,
  List,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Trash2,
  Copy,
  Share2,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const outline = location.state?.outline || [];
  const presentationId = location.state?.id;
  const fileInputRef = useRef(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
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
  const [slideMenuOpen, setSlideMenuOpen] = useState(null);
  const [showCardStyling, setShowCardStyling] = useState(null); //  ADD THIS LINE

  const theme = gradientThemes[currentTheme] || gradientThemes["classic-light"];

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("presentationTheme");
    if (savedTheme && gradientThemes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
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
          const formatted = outline.map((item, i) => {
            // Handle if the entire item is a JSON string
            let slideData = item;
            if (typeof item === 'string') {
              try {
                slideData = JSON.parse(item);
              } catch (e) {
                console.warn('Failed to parse slide item as JSON:', e);
                slideData = { content: item };
              }
            }
            
            //  DEBUG: Log what we received from backend
            console.log(`🔍 Slide ${i+1} received from backend:`, {
              title: slideData.title,
              hasChartUrl: !!slideData.chartUrl,
              chartUrlLength: slideData.chartUrl?.length || 0,
              chartUrlPreview: slideData.chartUrl?.substring(0, 50) || 'none',
              hasImageUrl: !!slideData.imageUrl,
              imageUrlPreview: slideData.imageUrl?.substring(0, 50) || 'none',
              layout: slideData.layout,
              type: slideData.type
            });
            
            // Extract content properly
            let cleanContent = slideData.content || "Generated AI Slide Content";
            
            // If content is still a JSON string, parse it
            if (typeof cleanContent === 'string' && (cleanContent.includes('"type"') || cleanContent.includes('"content"'))) {
              try {
                const parsed = JSON.parse(cleanContent);
                cleanContent = parsed.content || cleanContent;
              } catch {
                // Try regex extraction as fallback
                const contentMatch = cleanContent.match(/"content"\s*:\s*"([^"]+)"/);
                if (contentMatch) {
                  cleanContent = contentMatch[1];
                }
              }
            }
            
            // Clean escape sequences
            if (typeof cleanContent === 'string') {
              cleanContent = cleanContent
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\t/g, '\t')
                .replace(/\\/g, '')
                .trim();
            }
            
            // Extract title properly
            let cleanTitle = slideData.title || `Slide ${i + 1}`;
            if (typeof cleanTitle === 'string') {
              cleanTitle = cleanTitle
                .replace(/\\n/g, ' ')
                .replace(/\\"/g, '"')
                .replace(/\\/g, '')
                .trim();
            }
            
            //  IMPORTANT: Preserve chartUrl and imageUrl from backend
            const finalSlide = {
              id: slideData.id || `slide_${i + 1}_${Date.now()}`,
              title: cleanTitle,
              content: cleanContent,
              imageUrl: slideData.imageUrl || "",  //  Keep as-is from backend
              chartUrl: slideData.chartUrl || "",  //  Keep as-is from backend
              layout: slideData.layout || "split",
              textAlign: slideData.textAlign || "left",
              type: slideData.type || "content",
              height: slideData.height || 800,
              chartData: slideData.chartData || { needed: false }  //  Preserve chart metadata
            };
            
            //  DEBUG: Log final processed slide
            console.log(` Slide ${i+1} processed:`, {
              title: finalSlide.title,
              hasChart: !!finalSlide.chartUrl,
              hasImage: !!finalSlide.imageUrl,
              layout: finalSlide.layout
            });
            
            return finalSlide;
          });

          //  DEBUG: Summary of all slides
          console.log("📊 SLIDE SUMMARY:", formatted.map((s, idx) => ({
            slide: idx + 1,
            title: s.title,
            hasChart: !!s.chartUrl,
            hasImage: !!s.imageUrl,
            layout: s.layout
          })));
          
          setSlides(formatted);
          if (formatted.length > 0) {
            setSelectedSlide(formatted[0]);
          }
        }
      } catch (err) {
        console.error("Error loading presentation:", err);
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

  // Auto-save functionality
  useEffect(() => {
    if (slides.length === 0) return;
    
    const autoSaveTimeout = setTimeout(async () => {
      try {
        await handleSave();
        console.log(" Auto-saved");
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 30000);
    
    return () => clearTimeout(autoSaveTimeout);
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
      toast.success(" Presentation saved successfully!");
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
  const handleDuplicateSlide = (slideId = null) => {
    const slideToDuplicate = slideId 
      ? slides.find(s => s.id === slideId)
      : selectedSlide;
    
    if (!slideToDuplicate) return;
    
    const duplicatedSlide = {
      ...slideToDuplicate,
      id: Date.now(),
      title: `${slideToDuplicate.title} (Copy)`,
    };
    
    const slideIndex = slides.findIndex(s => s.id === slideToDuplicate.id);
    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide);
    setSlides(newSlides);
    setSelectedSlide(duplicatedSlide);
    setSelectedSlideIndex(slideIndex + 1);
    toast.success("📋 Slide duplicated!");
  };

  // Delete slide
  const handleDeleteSlide = (slideId = null) => {
    if (slides.length === 1) {
      toast.error("Cannot delete the last slide!");
      return;
    }
    
    const slideToDelete = slideId 
      ? slides.find(s => s.id === slideId)
      : selectedSlide;
    
    if (!slideToDelete) return;
    
    const newSlides = slides.filter(s => s.id !== slideToDelete.id);
    setSlides(newSlides);
    const slideIndex = slides.findIndex(s => s.id === slideToDelete.id);
    const newIndex = Math.min(slideIndex, newSlides.length - 1);
    setSelectedSlide(newSlides[newIndex]);
    setSelectedSlideIndex(newIndex);
    toast.success("🗑️ Slide deleted!");
  };

  // Change layout
  const handleChangeLayout = (slideId = null) => {
    const slideToChange = slideId 
      ? slides.find(s => s.id === slideId)
      : selectedSlide;
    
    if (!slideToChange) return;
    
    const layouts = ["split", "full-image", "full-text", "centered"];
    const currentIndex = layouts.indexOf(slideToChange.layout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    
    const updatedSlides = slides.map((s) =>
      s.id === slideToChange.id ? { ...s, layout: nextLayout } : s
    );
    setSlides(updatedSlides);
    
    if (slideToChange.id === selectedSlide?.id) {
      setSelectedSlide({ ...slideToChange, layout: nextLayout });
    }
    
    toast.success(`📐 Layout changed to ${nextLayout}`);
  };

  // Smart Image Generation
  const handleChangeImage = () => {
    if (!selectedSlide) return;
    
    const loadingToast = toast.loading("🎨 Generating contextual image...");
    
    try {
      const title = selectedSlide.title || "Presentation slide";
      const content = selectedSlide.content?.substring(0, 100) || "";
      
      let style = "professional photography, clean composition, high detail, 4k";
      
      if (content.includes("data") || content.includes("statistics")) {
        style = "data visualization, modern analytics, professional";
      } else if (content.includes("future") || content.includes("innovation")) {
        style = "futuristic, technology concept, modern";
      } else if (content.includes("team") || content.includes("people")) {
        style = "collaborative workspace, professional team, modern office";
      }
      
      const smartPrompt = `${title}, ${style}, studio lighting, sharp focus`;
      const newUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(smartPrompt)}?width=1920&height=1080&nologo=true&enhance=true`;
      
      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, imageUrl: newUrl } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, imageUrl: newUrl });
      
      toast.dismiss(loadingToast);
      toast.success("🎨 Smart image generated!");
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("❌ Image generation failed");
    }
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

    try {
      let attempts = 0;
      let result = null;
      
      while (attempts < 3 && !result) {
        try {
          result = await presentationAPI.enhanceSlide(selectedSlide.content);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const enhancedContent = result.enhanced || selectedSlide.content;

      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, content: enhancedContent } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, content: enhancedContent });

      toast.success("✨ Content enhanced!");
    } catch (error) {
      console.error("Enhancement failed:", error);
      toast.error("❌ Failed to enhance content. Please try again.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Rewrite Slide
  const handleRewrite = async () => {
    if (!selectedSlide) return;
    const loadingToast = toast.loading("✏️ Rewriting slide with AI...");
    try {
      const result = await presentationAPI.rewriteSlide(selectedSlide.content);
      const rewritten = result.rewritten || selectedSlide.content;

      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, content: rewritten } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, content: rewritten });
      toast.success("✏️ Slide rewritten!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Rewrite failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Expand Content
  const handleExpand = async () => {
    if (!selectedSlide) return;
    const loadingToast = toast.loading("📈 Expanding content with AI...");
    try {
      const result = await presentationAPI.expandSlide(selectedSlide.content);
      const expanded = result.expanded || selectedSlide.content;
      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, content: expanded } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, content: expanded });
      toast.success("📈 Content expanded!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Expansion failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Summarize Slide
  const handleSummarize = async () => {
    if (!selectedSlide) return;
    const loadingToast = toast.loading("🪄 Summarizing slide...");
    try {
      const result = await presentationAPI.summarizeSlide(selectedSlide.content);
      const summary = result.summary || selectedSlide.content;

      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, content: summary } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, content: summary });
      toast.success("🪄 Summary generated!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Summarization failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Change Tone
  const handleChangeTone = async () => {
    if (!selectedSlide) return;
    const loadingToast = toast.loading("🎨 Adjusting tone...");
    try {
      const result = await presentationAPI.changeTone(selectedSlide.content);
      const newContent = result.tone_changed || selectedSlide.content;

      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? { ...s, content: newContent } : s
      );
      setSlides(updatedSlides);
      setSelectedSlide({ ...selectedSlide, content: newContent });
      toast.success("🎨 Tone changed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to change tone");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Add Chart
  const handleAddChart = async () => {
    if (!selectedSlide) return;
    
    const loadingToast = toast.loading(" Generating chart...");
    
    try {
      // Extract numbers from content
      const numbers = selectedSlide.content.match(/\d+/g);
      
      let chartData;
      if (numbers && numbers.length >= 3) {
        chartData = numbers.slice(0, 5).map((n, i) => ({
          label: `Item ${i + 1}`,
          value: parseInt(n)
        }));
      } else {
        // Default sample data
        chartData = [
          { label: 'Q1', value: 25 },
          { label: 'Q2', value: 35 },
          { label: 'Q3', value: 45 },
          { label: 'Q4', value: 60 }
        ];
      }
      
      //  Generate chart using QuickChart.io API
      const chartConfig = {
        type: 'bar',
        data: {
          labels: chartData.map(d => d.label),
          datasets: [{
            label: 'Data',
            data: chartData.map(d => d.value),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: selectedSlide.title || 'Chart Data'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
      
      // Create chart URL using QuickChart
      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=800&height=400&backgroundColor=white`;
      
      //  Update slide with chartUrl property
      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id 
          ? { 
              ...s, 
              chartUrl: chartUrl,  // Store chart URL
              hasChart: true       // Flag to indicate chart exists
            } 
          : s
      );
      
      setSlides(updatedSlides);
      setSelectedSlide({ 
        ...selectedSlide, 
        chartUrl: chartUrl,
        hasChart: true 
      });
      
      toast.dismiss(loadingToast);
      toast.success(" Chart generated successfully!");
      
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error(" Failed to generate chart");
    }
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

  // Smart Layout Suggestions
  const suggestLayoutForSlide = (slide) => {
    const content = slide.content?.toLowerCase() || "";
    const title = slide.title?.toLowerCase() || "";
    
    if (content.includes("vs") || content.includes("compare") || content.includes("difference")) {
      return "split";
    } else if (content.includes("step") || content.includes("process") || content.includes("timeline")) {
      return "split";
    } else if (content.includes("data") || content.includes("statistics") || content.match(/\d+%/)) {
      return "split";
    } else if (title.includes("introduction") || title.includes("conclusion")) {
      return "centered";
    } else if (!slide.imageUrl || slide.imageUrl.includes("placeholder")) {
      return "full-text";
    } else {
      return "split";
    }
  };

  // Auto-optimize slide
  const handleAutoOptimizeSlide = async () => {
    if (!selectedSlide) return;
    
    const loadingToast = toast.loading("🎯 Auto-optimizing slide...");
    
    try {
      const suggestedLayout = suggestLayoutForSlide(selectedSlide);
      
      let enhancedContent = selectedSlide.content;
      if (selectedSlide.content.length < 50) {
        const result = await presentationAPI.expandSlide(selectedSlide.content);
        enhancedContent = result.expanded || selectedSlide.content;
      } else if (selectedSlide.content.length > 500) {
        const result = await presentationAPI.summarizeSlide(selectedSlide.content);
        enhancedContent = result.summary || selectedSlide.content;
      }
      
      let imageUrl = selectedSlide.imageUrl;
      if (!imageUrl || imageUrl.includes("placeholder")) {
        const smartPrompt = `${selectedSlide.title}, professional concept illustration, modern design, clean`;
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(smartPrompt)}?width=1920&height=1080&nologo=true&enhance=true`;
      }
      
      const optimizedSlide = {
        ...selectedSlide,
        layout: suggestedLayout,
        content: enhancedContent,
        imageUrl: imageUrl,
        textAlign: suggestedLayout === "centered" ? "center" : "left"
      };
      
      const updatedSlides = slides.map((s) =>
        s.id === selectedSlide.id ? optimizedSlide : s
      );
      setSlides(updatedSlides);
      setSelectedSlide(optimizedSlide);
      
      toast.success("🎯 Slide optimized with best layout, content, and image!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Auto-optimization failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Batch optimize all slides
  const handleOptimizeAllSlides = async () => {
    const loadingToast = toast.loading("🎨 Optimizing all slides...");
    
    try {
      const optimizedSlides = [];
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        toast.loading(`Optimizing slide ${i + 1}/${slides.length}...`);
        
        const layout = suggestLayoutForSlide(slide);
        
        optimizedSlides.push({
          ...slide,
          layout: layout,
          textAlign: layout === "centered" ? "center" : "left"
        });
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setSlides(optimizedSlides);
      if (selectedSlide) {
        const updatedSelected = optimizedSlides.find(s => s.id === selectedSlide.id);
        setSelectedSlide(updatedSelected);
      }
      
      toast.success(` All ${slides.length} slides optimized!`);
    } catch (error) {
      console.error(error);
      toast.error("❌ Batch optimization failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Quality score checker
  const calculateSlideQuality = (slide) => {
    let score = 0;
    const feedback = [];
    
    const titleWords = (slide.title || "").split(" ").length;
    if (titleWords >= 5 && titleWords <= 10) {
      score += 20;
    } else {
      feedback.push("Title should be 5-10 words");
    }
    
    const contentLength = (slide.content || "").length;
    if (contentLength >= 100 && contentLength <= 300) {
      score += 20;
    } else if (contentLength < 100) {
      feedback.push("Content too short, consider expanding");
    } else {
      feedback.push("Content too long, consider summarizing");
    }
    
    const bullets = (slide.content || "").split("•").length - 1;
    if (bullets >= 3 && bullets <= 5) {
      score += 20;
    } else {
      feedback.push("Aim for 3-5 bullet points");
    }
    
    if (slide.imageUrl && !slide.imageUrl.includes("placeholder")) {
      score += 20;
    } else {
      feedback.push("Add a relevant image");
    }
    
    if (slide.layout && slide.layout !== "split") {
      score += 20;
    } else {
      feedback.push("Consider a more specific layout");
    }
    
    return { score, feedback };
  };

  // Show quality tooltip
  const showSlideQualityFeedback = () => {
    if (!selectedSlide) return;
    
    const { score, feedback } = calculateSlideQuality(selectedSlide);
    
    let message = `Slide Quality: ${score}/100\n`;
    if (feedback.length > 0) {
      message += "\nSuggestions:\n• " + feedback.join("\n• ");
    } else {
      message = "✨ Perfect slide quality!";
    }
    
    toast(message, {
      icon: score >= 80 ? "" : "💡",
      duration: 5000
    });
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
    const slideHeight = slide.height || 800;
    const size = isPresent ? "text-5xl" : "text-4xl";
    const contentSize = isPresent ? "text-2xl" : "text-lg";
    const padding = isPresent ? "p-16" : "p-10";
    const fontFamily = theme.font;
  
    //  CHECK: Does this slide have a chart?
    const hasChart = slide.chartUrl && slide.chartUrl.trim() !== "";
    
    //  CHECK: Does this slide have a valid image?
    const hasValidImage = slide.imageUrl && 
                          slide.imageUrl.trim() !== "" && 
                          !slide.imageUrl.includes("placeholder");
  
    console.log(`🔍 Slide: ${slide.title}`);
    console.log(`   hasChart: ${hasChart}`);
    console.log(`   hasValidImage: ${hasValidImage}`);
    console.log(`   chartUrl: ${slide.chartUrl}`);
  
    switch (slide.layout) {
      case "full-image":
        return (
          <div className="relative w-full h-full" style={{ fontFamily }}>
            {!hasChart && hasValidImage && (
              isPresent ? (
                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <ImageWithOptions src={slide.imageUrl} alt={slide.title} />
              )
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-12">
              <h2 className={`${size} font-bold text-white mb-4`}>{slide.title}</h2>
              <p className={`${contentSize} text-white/90 leading-relaxed`}>{slide.content}</p>
              
              {hasChart && (
                <div className="mt-6 bg-white/95 rounded-xl p-4">
                  <img 
                    src={slide.chartUrl} 
                    alt="Chart" 
                    className="w-full h-auto rounded-lg max-h-96 object-contain" 
                    onError={(e) => {
                      console.error("❌ Chart failed to load:", slide.chartUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
  
      case "full-text":
        return (
          <div className={`w-full h-full flex flex-col justify-center ${padding} ${theme.text}`} style={{ fontFamily }}>
            <h2 className={`${size} font-bold mb-6 leading-tight`} style={{ textAlign: slide.textAlign }}>
              {slide.title}
            </h2>
            <div className={`${contentSize} leading-relaxed whitespace-pre-wrap space-y-3`} style={{ textAlign: slide.textAlign }}>
              {slide.content.split('\n').map((line, idx) => (
                <p key={idx} className="mb-2">{line}</p>
              ))}
            </div>
            
            {hasChart && (
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <img 
                  src={slide.chartUrl} 
                  alt="Chart" 
                  className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain" 
                  onError={(e) => {
                    console.error("❌ Chart failed to load:", slide.chartUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
  
      case "centered":
        return (
          <div className={`w-full h-full flex flex-col items-center justify-center text-center ${padding} ${theme.text}`} style={{ fontFamily }}>
            <h2 className={`${size} font-bold mb-6 max-w-4xl leading-tight`}>{slide.title}</h2>
            <div className={`${contentSize} leading-relaxed max-w-3xl whitespace-pre-wrap space-y-3`}>
              {slide.content.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            
            {hasChart && (
              <div className="mt-8 w-full max-w-4xl bg-white rounded-xl p-6 shadow-lg">
                <img 
                  src={slide.chartUrl} 
                  alt="Chart" 
                  className="w-full h-auto rounded-lg max-h-96 object-contain" 
                  onError={(e) => {
                    console.error("❌ Chart failed to load:", slide.chartUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
  
      case "stats-grid":
        const stats = slide.content.split('\n\n').filter(s => s.trim());
        return (
          <div className={`w-full h-full flex flex-col ${padding} ${theme.text}`} style={{ fontFamily }}>
            <h2 className={`${size} font-bold mb-8`}>{slide.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1">
              {stats.map((stat, idx) => {
                const lines = stat.split('\n');
                const metric = lines[0] || '';
                const description = lines.slice(1).join(' ') || '';
                
                return (
                  <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex flex-col justify-center items-center text-center border-2 border-blue-200 hover:shadow-lg transition">
                    <div className={`${isPresent ? 'text-5xl' : 'text-4xl'} font-bold text-blue-600 mb-3`}>
                      {metric}
                    </div>
                    <p className="text-base text-gray-700 leading-snug">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {hasChart && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
                <img 
                  src={slide.chartUrl} 
                  alt="Statistics Chart" 
                  className="w-full h-auto rounded-lg max-h-80 object-contain" 
                  onError={(e) => {
                    console.error("❌ Chart failed to load:", slide.chartUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
  
      case "two-column":
        const columns = slide.content.split('\n\n').filter(s => s.trim());
        const leftContent = columns[0] || '';
        const rightContent = columns[1] || '';
        
        return (
          <div className={`w-full h-full flex flex-col ${padding} ${theme.text}`} style={{ fontFamily }}>
            <h2 className={`${size} font-bold mb-6 text-center`}>{slide.title}</h2>
            <div className="flex-1 grid grid-cols-2 gap-8">
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 flex flex-col justify-center">
                <div className={`${contentSize} whitespace-pre-wrap leading-relaxed`}>
                  {leftContent.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 flex flex-col justify-center">
                <div className={`${contentSize} whitespace-pre-wrap leading-relaxed`}>
                  {rightContent.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
            
            {hasChart && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
                <img 
                  src={slide.chartUrl} 
                  alt="Comparison Chart" 
                  className="w-full h-auto rounded-lg max-h-80 object-contain" 
                  onError={(e) => {
                    console.error("❌ Chart failed to load:", slide.chartUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
  
      default: // split layout
        return (
          <div className="w-full h-full flex flex-col" style={{ fontFamily }}>
            {/* Top Section: Image + Content OR Just Content */}
            <div className="flex flex-1">
              {/*  Image Section - ONLY if NO CHART AND valid imageUrl */}
              {!hasChart && hasValidImage && (
              <div className="flex-1 relative">
                {isPresent ? (
                <img 
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover" 
                onError={(e) => {
                  console.error("❌ Image failed to load:", slide.imageUrl);
                  e.target.style.display = 'none';
                }}
                />
                ) : (
                <ImageWithOptions src={slide.imageUrl} alt={slide.title} />
                )}
                </div>
                )}
          
              
              {/* Content Section - Full width if chart exists or no image */}
              <div className={`${hasChart || !hasValidImage ? 'w-full' : 'flex-1'} flex flex-col justify-center ${padding}`}>
                <h2 
                  className={`${size} font-bold mb-6 leading-tight`} 
                  style={{ textAlign: slide.textAlign }}
                >
                  {slide.title}
                </h2>
                <div 
                  className={`${contentSize} leading-relaxed whitespace-pre-wrap space-y-2`}
                  style={{ textAlign: slide.textAlign }}
                >
                  {slide.content.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
            
            {/*  CHART DISPLAY - Full width at bottom */}
            {hasChart && (
              <div className="w-full bg-white border-t-2 border-gray-200 p-6 flex items-center justify-center">
                <img 
                  src={slide.chartUrl} 
                  alt="Chart" 
                  className="w-full h-auto max-h-80 object-contain rounded-lg shadow-md" 
                  onError={(e) => {
                    console.error("❌ Chart failed to load:", slide.chartUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
    }
  };
  // Image with hover options component
  const ImageWithOptions = ({ src, alt }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showAIMenu, setShowAIMenu] = useState(false);
  
    return (
      <div 
        className="relative w-full h-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowAIMenu(false);
         }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        {isHovered && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg z-50 animate-in fade-in duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Upload image"
            >
              <Download size={16} className="text-gray-700" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChangeImage();
              }}

              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Refresh image"
            >
              <RotateCw size={16} className="text-gray-700" />
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Zoom in"
            >
              <ZoomIn size={16} className="text-gray-700" />
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Zoom out"
            >
              <ZoomOut size={16} className="text-gray-700" />
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Fit to view"
            >
              <Maximize2 size={16} className="text-gray-700" />
            </button>
  
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAIMenu(!showAIMenu);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Ask AI"
              >
                <Sparkles size={16} className="text-purple-600" />
              </button>

  
              {showAIMenu && (
                <div 
                className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-2 w-56"
                onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      handleEnhance();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-purple-600" /> Enhance Content
                  </button>

                  <button
                    onClick={() => {
                      handleRewrite();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Type size={14} className="text-gray-700" /> Rewrite Text
                  </button>

                  <button
                    onClick={() => {
                      handleExpand();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BarChart2 size={14} className="text-green-600" /> Expand Content
                  </button>

                  <button
                    onClick={() => {
                      handleSummarize();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <AlignCenter size={14} className="text-orange-500" /> Summarize Slide
                  </button>

                  <button
                    onClick={() => {
                      handleChangeTone();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Palette size={14} className="text-pink-500" /> Change Tone
                  </button>

                  <div className="w-full h-px bg-gray-200 my-1" />

                  <button
                    onClick={() => {
                      handleAutoOptimizeSlide();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 flex items-center gap-2 text-purple-600 font-medium"
                  >
                    <Sparkles size={14} /> Auto-Optimize Slide
                  </button>

                  <button
                    onClick={() => {
                      showSlideQualityFeedback();
                      setShowAIMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-600"
                  >
                    <BarChart2 size={14} /> Check Quality Score
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
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
    <div className="h-screen flex flex-col bg-gray-100 text-gray-800 overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 h-[56px] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-md flex items-center justify-center font-bold text-white text-sm">
            P
          </div>
          <ChevronDown size={14} className="text-gray-400" />
          <input
            value={selectedSlide?.title || "Untitled Presentation"}
            onChange={(e) => updateSlideContent("title", e.target.value)}
            className="text-sm text-gray-700 bg-transparent border-none focus:outline-none max-w-md"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition text-sm"
          >
            <Palette size={14} /> Theme
          </button>

          <button
            onClick={handleOptimizeAllSlides}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-purple-600 transition text-sm"
            title="Auto-optimize all slides"
          >
            <Sparkles size={14} /> Optimize All
          </button>
          
          {showThemeSelector && (
            <div className="absolute right-6 top-14 bg-white border border-gray-200 rounded-lg p-4 shadow-2xl z-50 w-72">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Choose Theme</h3>
                <button onClick={() => setShowThemeSelector(false)}>
                  <X size={16} className="text-gray-500" />
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 transition text-sm"
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
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Share2 size={14} /> Share Link
                </button>
                
               {/* ✅ NEW: Export Modal Trigger */}
                <button
                  onClick={() => {
                    setShowExportModal(true);
                    setShowShareMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 transition text-sm disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>

          <button 
            onClick={() => {
              setPresentMode(true);
              setCurrentPresentSlide(selectedSlideIndex);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition text-sm font-medium"
          >
            <Eye size={14} /> Present
          </button>

          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-semibold text-white text-xs">
            HT
          </div>
        </div>
      </header>

      <div
        className="flex flex-1 overflow-hidden px-4 pt-0 pb-0 gap-4 transition-all duration-500 bg-gray-100"
      >
        {/* FILMSTRIP SIDEBAR - Google Slides Style */}
        {sidebarOpen && (
        <aside
        className="w-32 bg-white border border-gray-200 flex flex-col shadow-md
                   rounded-xl mt-3 mb-3 ml-1 overflow-hidden"
        style={{ height: "calc(100vh - 90px)" }}
      >
      
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded transition ${
            viewMode === "grid" 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
          title="Grid view"
        >
          <Grid size={18} />
        </button>
        <button 
          onClick={() => setViewMode("list")}
          className={`p-2 rounded transition ${
            viewMode === "list" 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
          title="List view"
        >
          <List size={18} />
        </button>
      </div>
      <button 
        onClick={() => setSidebarOpen(false)} 
        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
        title="Close sidebar"
      >
        <X size={18} />
      </button>
    </div>

    {/* New Button - Cleaner style */}
    <div className="px-3 py-3 pb-3">
      <button
        onClick={() => setShowNewMenu(!showNewMenu)}
        className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 transition shadow-sm"
      >
        <Plus size={16} /> New
        <ChevronDown size={14} className={`ml-auto transition-transform ${showNewMenu ? "rotate-180" : ""}`} />
      </button>
      
      {showNewMenu && (
        <div className="absolute left-3 right-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
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

    {/* Slides List - Filmstrip style with exact mini replicas */}
    <div className="flex-1 overflow-y-auto px-2 pt-4 pb-3 space-y-2">
      {slides.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-sm font-medium text-gray-600">No slides yet</p>
          <p className="text-xs mt-1 text-gray-500">Click "New" to create your first slide</p>
        </div>
      ) : (
        slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => {
              setSelectedSlide(slide);
              setSelectedSlideIndex(index);
            }}
            className={`relative rounded overflow-hidden cursor-pointer transition-all group w-full aspect-[4/3] ${
              selectedSlide?.id === slide.id
                ? "ring-2 ring-blue-500 shadow-md scale-[1.02]"
                : "ring-1 ring-gray-300 hover:ring-blue-400 hover:shadow-sm"
            }`}
          >
            {viewMode === "grid" ? (
              <>
                {/* Filmstrip thumbnail - Exact mini replica */}
                <div 
                  className={`w-full aspect-[4/3] relative overflow-hidden bg-gradient-to-br ${theme.bg}`}
                >
                  {/* Slide number badge */}
                  <span className="absolute top-2 left-2 bg-gray-900/90 text-white text-xs font-bold rounded px-2 py-1 z-10 shadow-sm">
                    {index + 1}
                  </span>
                  
                  {/* Render exact slide miniature based on layout */}
                  {slide.layout === "full-image" && slide.imageUrl ? (
                    <div className="relative w-full h-full">
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                        <h3 className="text-[9px] font-bold text-white line-clamp-1 leading-tight mb-1" style={{ fontFamily: theme.font }}>
                          {slide.title}
                        </h3>
                        <p className="text-[7px] text-white/90 line-clamp-2 leading-tight" style={{ fontFamily: theme.font }}>
                          {slide.content}
                        </p>
                      </div>
                    </div>
                  ) : slide.layout === "full-text" ? (
                    <div 
                      className={`w-full h-full p-3 flex flex-col justify-center ${theme.text}`}
                      style={{ fontFamily: theme.font }}
                    >
                      <h3 
                        className="text-[9px] font-bold mb-1 leading-tight line-clamp-2" 
                        style={{ textAlign: slide.textAlign || 'left' }}
                      >
                        {slide.title}
                      </h3>
                      <p 
                        className="text-[7px] line-clamp-4 leading-tight opacity-80" 
                        style={{ textAlign: slide.textAlign || 'left' }}
                      >
                        {slide.content}
                      </p>
                    </div>
                  ) : slide.layout === "centered" ? (
                    <div 
                      className={`w-full h-full flex flex-col items-center justify-center text-center p-3 ${theme.text}`}
                      style={{ fontFamily: theme.font }}
                    >
                      <h3 className="text-[9px] font-bold mb-1 leading-tight max-w-[90%] line-clamp-2">
                        {slide.title}
                      </h3>
                      <p className="text-[7px] line-clamp-3 leading-tight opacity-80 max-w-[90%]">
                        {slide.content}
                      </p>
                    </div>
                  ) : (
                    // Split layout - most common
                    <div className="w-full h-full flex">
                      {slide.imageUrl ? (
                        <div className="flex-1 h-full">
                          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex-1 h-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div 
                        className={`flex-1 h-full flex flex-col justify-center p-3 ${theme.text}`}
                        style={{ fontFamily: theme.font }}
                      >
                        <h3 
                          className="text-[6px] font-bold mb-1 leading-tight line-clamp-2" 
                          style={{ textAlign: slide.textAlign || 'left' }}
                        >
                          {slide.title}
                        </h3>
                        <p 
                          className="text-[4px] line-clamp-4 leading-[1.3] opacity-80" 
                          style={{ textAlign: slide.textAlign || 'left' }}
                        >
                          {slide.content}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover actions menu */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSlideMenuOpen(slideMenuOpen === slide.id ? null : slide.id);
                      }}
                      className="p-1 bg-white/95 hover:bg-white rounded shadow-sm transition"
                      title="More options"
                    >
                      <MoreVertical size={12} className="text-gray-700" />
                    </button>
                    
                    {slideMenuOpen === slide.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-40 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateSlide(slide.id);
                            setSlideMenuOpen(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        >
                          <Copy size={12} /> Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeLayout(slide.id);
                            setSlideMenuOpen(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        >
                          <Layout size={12} /> Change Layout
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(slide.id);
                            setSlideMenuOpen(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // List view - Simple text only like Google Slides
              <div className="w-full px-3 py-3 bg-white hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm font-medium min-w-[24px] text-left flex-shrink-0">
                  {index + 1}
                </span>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-800 truncate font-normal">
                    {slide.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSlide(slide.id);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition"
                    title="Duplicate"
                  >
                    <Copy size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlide(slide.id);
                    }}
                    className="p-1.5 hover:bg-red-100 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
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
            className="absolute left-3 top-16 p-2 bg-white border border-gray-300 rounded-md shadow-lg hover:bg-gray-50 hover:border-blue-500 transition-all z-50"
            title="Open Sidebar"
          >
            <Grid size={18} className="text-gray-700" />
          </button>
        )}

        {/* MAIN CANVAS */}
        <main 
className="flex-1 bg-transparent overflow-y-scroll overflow-x-hidden flex justify-center items-start py-0 pr-8 relative"
style={{
  scrollbarWidth: 'none',
  msOverflowStyle: 'none'
}}
>
<style>{`
  main::-webkit-scrollbar {
    display: none;
  }
`}</style>

<div className="flex flex-col items-center gap-8 py-6 px-4 w-full max-w-[1000px]">
  {slides.length === 0 ? (
    <div 
      className="w-full max-w-6xl rounded-xl shadow-lg flex items-center justify-center bg-white border-2 border-dashed border-gray-300"
      style={{ height: "600px" }}
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-400 mb-2">No slides yet</h3>
        <p className="text-gray-500 mb-4">Create your first slide to get started</p>
        
        {/* Canva-style Search / Insert menu */}
        <div className="relative group inline-block">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            title="Search or Insert"
            className="p-3 text-gray-600 hover:text-blue-600 hover:scale-105 transition-transform"
          >
            <Search size={20} strokeWidth={1.75} />
          </button>
                      
          {showAddMenu && (
            <div
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200
                         rounded-lg shadow-xl w-60 py-2 z-[10000]"
            >
              <div className="px-3 pb-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search elements..."
                  className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
          
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                🖼️ Image
              </button>
          
              <button
                onClick={() => handleAddSlide()}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                ✏️ Text Box
              </button>
          
              <button
                onClick={() => handleAddChart()}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                📊 Chart
              </button>
          
              <button
                onClick={() => toast.success('Coming soon: Stickers!')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                🎨 Sticker
              </button>
          
              <button
                onClick={() => toast.success('Coming soon: Shapes!')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                💠 Shape
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    slides.map((slide, index) => {
      //  CALCULATE DYNAMIC HEIGHT
      const slideHeight = slide.height || 800;
      const scaledHeight = Math.floor(slideHeight * 0.65); // Scale down 65% for editor
      const minHeight = 500;
      const maxHeight = 900;
      const finalHeight = Math.max(minHeight, Math.min(maxHeight, scaledHeight));

      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          onClick={() => {
            setSelectedSlide(slide);
            setSelectedSlideIndex(index);
          }}
          className={`w-full max-w-5xl rounded-xl shadow-lg overflow-hidden 
          bg-gradient-to-br ${theme.bg}
          ${selectedSlide?.id === slide.id ? "ring-4 ring-blue-500 shadow-2xl" : "hover:shadow-xl"} 
          cursor-pointer transition-all group relative`}
          style={{
            height: `${finalHeight}px`, //  DYNAMIC HEIGHT
          }}
        >
          {/* Top-left slide controls - visible on hover for ALL slides */}
          <div className="absolute top-4 left-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-2 py-2">
              {/* Button 1: Drag to move / Click to open menu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Menu functionality will be added
                }}
                className="p-2 hover:bg-gray-100 rounded transition cursor-move"
                title="Drag to move / Click to open menu"
              >
                <MoreVertical size={18} className="text-gray-700" />
              </button>
              
              {/* Button 2: Card styling */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardStyling(showCardStyling === slide.id ? null : slide.id);
                }}
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Card styling"
              >
                <Palette size={18} className="text-gray-700" />
              </button>
              
              {/* Button 3: Edit with AI */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // AI edit functionality will be added
                }}
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Edit with AI"
              >
                <Sparkles size={18} className="text-gray-700" />
              </button>
            </div>

            {/* Card Styling Panel */}
            {showCardStyling === slide.id && (
              <div 
                className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 w-80 z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Card styling</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCardStyling(null);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>

                {/* Accent Image */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <ImageIcon size={16} /> Accent image
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedSlides = slides.map((s) =>
                            s.id === slide.id ? { ...s, imageUrl: "" } : s
                          );
                          setSlides(updatedSlides);
                          if (selectedSlide?.id === slide.id) {
                            setSelectedSlide({ ...slide, imageUrl: "" });
                          }
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {slide.imageUrl && (
                    <img src={slide.imageUrl} alt="Accent" className="w-full h-20 object-cover rounded border" />
                  )}
                </div>

                {/* Card Color */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Palette size={16} /> Card color
                  </label>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex-1">
                      Default
                    </button>
                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {/* Full-bleed card */}
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Maximize2 size={16} /> Full-bleed card
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newLayout = slide.layout === "full-image" ? "split" : "full-image";
                      const updatedSlides = slides.map((s) =>
                        s.id === slide.id ? { ...s, layout: newLayout } : s
                      );
                      setSlides(updatedSlides);
                      if (selectedSlide?.id === slide.id) {
                        setSelectedSlide({ ...slide, layout: newLayout });
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition ${
                      slide.layout === "full-image" ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                        slide.layout === "full-image" ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Content Alignment */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <AlignCenter size={16} /> Content alignment
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSlides = slides.map((s) =>
                          s.id === slide.id ? { ...s, textAlign: "left" } : s
                        );
                        setSlides(updatedSlides);
                        if (selectedSlide?.id === slide.id) {
                          setSelectedSlide({ ...slide, textAlign: "left" });
                        }
                      }}
                      className={`p-2 rounded ${slide.textAlign === "left" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                      title="Align top"
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSlides = slides.map((s) =>
                          s.id === slide.id ? { ...s, textAlign: "center" } : s
                        );
                        setSlides(updatedSlides);
                        if (selectedSlide?.id === slide.id) {
                          setSelectedSlide({ ...slide, textAlign: "center" });
                        }
                      }}
                      className={`p-2 rounded ${slide.textAlign === "center" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                      title="Align center"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSlides = slides.map((s) =>
                          s.id === slide.id ? { ...s, textAlign: "right" } : s
                        );
                        setSlides(updatedSlides);
                        if (selectedSlide?.id === slide.id) {
                          setSelectedSlide({ ...slide, textAlign: "right" });
                        }
                      }}
                      className={`p-2 rounded ${slide.textAlign === "right" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                      title="Align bottom"
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Width */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Layout size={16} /> Card width
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSlides = slides.map((s) =>
                          s.id === slide.id ? { ...s, width: "medium" } : s
                        );
                        setSlides(updatedSlides);
                      }}
                      className={`px-3 py-1.5 text-sm border rounded flex-1 ${
                        slide.width !== "large" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSlides = slides.map((s) =>
                          s.id === slide.id ? { ...s, width: "large" } : s
                        );
                        setSlides(updatedSlides);
                      }}
                      className={`px-3 py-1.5 text-sm border rounded flex-1 ${
                        slide.width === "large" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      L
                    </button>
                  </div>
                </div>

                {/* Backdrop */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <ImageIcon size={16} /> Backdrop
                    </label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add backdrop functionality
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Reset Styling */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedSlides = slides.map((s) =>
                      s.id === slide.id 
                        ? { 
                            ...s, 
                            layout: "split", 
                            textAlign: "left",
                            width: "medium"
                          } 
                        : s
                    );
                    setSlides(updatedSlides);
                    if (selectedSlide?.id === slide.id) {
                      setSelectedSlide({ ...slide, layout: "split", textAlign: "left", width: "medium" });
                    }
                    toast.success("Card styling reset!");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-300"
                >
                  <RefreshCw size={14} /> Reset styling
                </button>
              </div>
            )}
          </div>

          {slide.id === selectedSlide?.id ? (
            //  EDITABLE VIEW WITH CHART SUPPORT - NO IMAGE IF CHART
            <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ fontFamily: theme.font }}>
              {/* Top-left slide controls - fixed position, always visible */}
              
              {/* Top Section: Image + Content Side by Side */}
              <div className="flex flex-1 overflow-hidden">
                {/* Image Section - ONLY if NO CHART */}
                {!slide.chartUrl &&
                  slide.layout !== "full-text" &&
                  slide.layout !== "centered" &&
                  slide.imageUrl && (
                  <div className={`${
                    slide.layout === "full-image" ? "absolute inset-0" : "flex-1"
                  } relative overflow-hidden group`}>
                    {/* Image controls at bottom - visible on hover */}
                    <div className="absolute bottom-4 left-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    </div>
                    
                    <ImageWithOptions src={slide.imageUrl} alt={slide.title} />
                    {slide.layout === "full-image" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                    )}
                  </div>
                )}
                
                {/* Content Section - Full width if chart exists */}
                <div className={`${
                  slide.chartUrl ? "w-full" :
                  slide.layout === "full-image"
                    ? "absolute inset-0 flex flex-col justify-end" :
                  slide.layout === "full-text" || slide.layout === "centered"
                    ? "w-full" :
                  "flex-1"
                  } flex flex-col justify-center px-12 py-10 overflow-y-auto`}>
                  <input
                    value={slide.title}
                    onChange={(e) => updateSlideContent("title", e.target.value)}
                    className={`text-4xl font-bold mb-6 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1 ${
                      slide.layout === "full-image" ? "text-white" : theme.text
                    }`}
                    style={{ textAlign: slide.textAlign }}
                    placeholder="Slide title..."
                  />
                  <textarea
                    value={slide.content}  
                    onChange={(e) => updateSlideContent("content", e.target.value)}
                    className={`text-lg leading-relaxed bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1 resize-none scrollbar-thin ${
                      slide.layout === "full-image" ? "text-white/90" : "text-gray-600"
                    }`}
                    style={{
                      textAlign: slide.textAlign,
                      minHeight: "150px",
                      maxHeight: "300px"
                    }}
                    placeholder="Add your content here..."
                  />
                </div>
              </div>
              {/*  CHART DISPLAY SECTION - FIXED POSITION */}
              {slide.chartUrl && (
                <div className="w-full bg-white/95 border-t-2 border-gray-200 p-4 flex items-center justify-center flex-shrink-0">
                  <img
                    src={slide.chartUrl}
                    alt="Chart"
                    className="w-full h-auto max-h-64 object-contain rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          ) : (
            //  PREVIEW VIEW
            renderSlideContent(slide, false)
          )}
        </motion.div>
      );
    })
  )}
</div>

{/* Hidden file input */}
<inputs
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
  className="hidden"
/>

{/* Floating Toolbar - Vertical right sidebar */}
{selectedSlide && (
  <div
    className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-0
               bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl
               z-[9999] transition-all duration-300"
    style={{ maxHeight: "80vh", overflow: "visible" }}
  >
    {/* Canva-style Add Menu */}
    <div className="relative group">
      <button
        onClick={() => setShowAddMenu(!showAddMenu)}
        title="Search or Insert"
        className="p-3 text-gray-600 hover:text-blue-600 hover:scale-105 transition-transform"
      >
        <Search size={20} strokeWidth={1.75} />
      </button>

      {showAddMenu && (
        <div
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200
                     rounded-lg shadow-xl w-44 py-2 z-50"
        >
          <button
            onClick={() => {
              fileInputRef.current?.click();
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            🖼️ Image
          </button>

          <button
            onClick={() => {
              handleAddSlide();
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            ➕ Add Slide
          </button>

          <button
            onClick={() => {
              handleAddChart();
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            📊 Chart
          </button>

          <button
            onClick={() => {
              toast.success("Coming soon: Stickers!");
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            🎨 Sticker
          </button>

          <button
            onClick={() => {
              toast.success("Coming soon: Shapes!");
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            💠 Shape
          </button>

          <button
            onClick={() => {
              fileInputRef.current?.click();
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            ⬆️ Upload
          </button>
        </div>
      )}
    </div>

    <button 
      onClick={() => handleChangeLayout()} 
      title="Change Layout" 
      className="p-3 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all border-t border-gray-100"
    >
      <Layout size={20} />
    </button>

    <div className="w-full h-px bg-gray-200" />

    <button 
      onClick={handleEnhance} 
      title="AI Enhance" 
      className="p-3 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all border-b border-gray-100"
    >
      <Sparkles size={20} />
    </button>

    <button 
      onClick={() => handleDuplicateSlide()} 
      title="Duplicate Slide" 
      className="p-3 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all border-b border-gray-100"
    >
      <Copy size={20} />
    </button>

    <button 
      onClick={() => handleDeleteSlide()} 
      title="Delete Slide" 
      className="p-3 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all"
    >
      <Trash2 size={20} />
    </button>
  </div>
)}
</main>
      </div>
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        presentation={{
          title: slides[0]?.title || "Untitled Presentation",
          description: "AI-generated presentation",
          slides: slides,
          theme: currentTheme
        }}
      />
    </div>
  );
};

export default EditorPage;