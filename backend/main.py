from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import uuid
import tempfile
from datetime import datetime
from ai_service import PresentaionAi
import document_processor
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class UrlIngestRequest(BaseModel):
    url: str

class TextIngestRequest(BaseModel):
    text: str
    name: str | None = None

class OutlineRequest(BaseModel):
    content: str

class OutlineToSlidesRequest(BaseModel):
    outline: dict

app = FastAPI(
    title="Presentation AI API",
    description="AI-powered presentation generator API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SlideRequest(BaseModel):
    type: str
    title: str
    content: str
    backgroundColor: str = "#ffffff"
    textColor: str = "#1f2937"
    layout: str = "left"
    imageUrl: Optional[str] = None

class PresentationRequest(BaseModel):
    title: str
    description: str
    slides: List[SlideRequest]
    theme: str = "modern"

class GeneratePresentationRequest(BaseModel):
    prompt: str
    model: Optional[str] = None
    theme: Optional[str] = None
    include_interactive: bool = True

class GenerateSlideRequest(BaseModel):
    prompt: str
    model: Optional[str] = None
    theme: Optional[str] = None

class EnhanceSlideRequest(BaseModel):
    slide: dict
    enhancement_type: str = "content"  # content, layout, or overall
    model: Optional[str] = None

class CreateThemeRequest(BaseModel):
    name: str
    primary_color: str
    secondary_color: str
    accent_color: str
    background_color: str
    text_color: str
    font_family: str = "Inter, sans-serif"
    image_style_keywords: List[str] = []

class PresentationResponse(BaseModel):
    title: str
    description: str
    slides: List[SlideRequest]
    theme: str

# AI service instance
ai_service = PresentaionAi()

# AI service for generating presentations
async def generate_presentation_from_prompt(prompt: str, model: str = None, theme: str = None, include_interactive: bool = True) -> PresentationResponse:
    """Generate presentation content using OpenRouter AI"""
    try:
        # Use OpenRouter AI service
        ai_response = await ai_service.generate_presentation(prompt, model, theme, include_interactive)
        
        # Convert AI response to our format and generate images
        slides = []
        for slide_data in ai_response.get("slides", []):
            if "id" not in slide_data or not slide_data["id"]:
                slide_data["id"] = f"slide_{uuid.uuid4()}"
            image_url = slide_data.get("imageUrl")

            # Always ensure an image: build a prompt from title/content if none provided
            if not image_url:
                image_prompt = slide_data.get("imagePrompt")
                if not image_prompt:
                    title = slide_data.get("title", "")
                    content = slide_data.get("content", "")
                    image_prompt = f"Create a presentation-ready visual for: {title}. {content}. Clean, modern, professional, high-contrast."
                try:
                    gen = await ai_service.generate_image(image_prompt)
                    image_url = gen or "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop"
                except Exception:
                    image_url = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop"
            
            slide = SlideRequest(
                type=slide_data.get("type", "content"),
                title=slide_data.get("title", ""),
                content=slide_data.get("content", ""),
                backgroundColor=slide_data.get("backgroundColor", "#ffffff"),
                textColor=slide_data.get("textColor", "#1f2937"),
                layout=slide_data.get("layout", "left"),
                imageUrl=image_url
            )
            slides.append(slide)
        
        return PresentationResponse(
            title=ai_response.get("title", "Untitled Presentation"),
            description=ai_response.get("description", prompt),
            slides=slides,
            theme=ai_response.get("theme", "modern")
        )
        
    except Exception as e:
        print(f"Error generating presentation: {e}")
        # Fallback to basic presentation
        return create_fallback_presentation(prompt)

def create_fallback_presentation(prompt: str) -> PresentationResponse:
    """Create a fallback presentation if AI service fails"""
    title = extract_title_from_prompt(prompt)
    
    slides = [
        SlideRequest(
            type="title",
            title=title,
            content=f"A presentation about {prompt.lower()}",
            backgroundColor="#3b82f6",
            textColor="#ffffff",
            layout="center"
        ),
        SlideRequest(
            type="content",
            title="Introduction",
            content=f"Welcome to our presentation about {prompt.lower()}.\n\nIn this presentation, we will explore the key concepts and important aspects of this topic.",
            backgroundColor="#ffffff",
            textColor="#1f2937",
            layout="left"
        ),
        SlideRequest(
            type="image",
            title="Visual Overview",
            content="Key concepts and important aspects visualized",
            backgroundColor="#f0f9ff",
            textColor="#1e40af",
            layout="two-column",
            imageUrl="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop"
        ),
        SlideRequest(
            type="content",
            title="Key Points",
            content="Here are the main points we'll cover:\n\n• Understanding the basics\n• Important considerations\n• Best practices\n• Future outlook",
            backgroundColor="#f8fafc",
            textColor="#1f2937",
            layout="left"
        ),
        SlideRequest(
            type="content",
            title="Conclusion",
            content=f"Thank you for your attention!\n\nWe hope this presentation has provided valuable insights about {prompt.lower()}.\n\nQuestions?",
            backgroundColor="#1f2937",
            textColor="#ffffff",
            layout="center"
        )
    ]

    return PresentationResponse(
        title=title,
        description=prompt,
        slides=slides,
        theme="modern"
    )

def extract_title_from_prompt(prompt: str) -> str:
    """Extract a clean title from the prompt"""
    # Simple title extraction - capitalize first letter and clean up
    words = prompt.split()
    title = " ".join(word.capitalize() for word in words)
    # Remove special characters and limit length
    title = "".join(c for c in title if c.isalnum() or c.isspace()).strip()
    return title[:50]  # Limit length

# API Routes
@app.get("/")
async def root():
    return {"message": "Presentation AI API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "OK", 
        "timestamp": datetime.now().isoformat(),
        "service": "Presentation AI API"
    }

@app.post("/api/generate-presentation", response_model=PresentationResponse)
async def generate_presentation(request: GeneratePresentationRequest):
    """Generate a presentation from a text prompt using OpenRouter AI"""
    try:
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Generate presentation using OpenRouter AI
        presentation = await generate_presentation_from_prompt(
            request.prompt, 
            request.model, 
            request.theme, 
            request.include_interactive
        )
        return presentation
        
    except Exception as e:
        print(f"Error in generate_presentation endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate presentation: {str(e)}")

@app.post("/api/save-presentation")
async def save_presentation(presentation: PresentationRequest):
    """Save a presentation (placeholder for future database integration)"""
    try:
        # In a real application, you would save to a database here
        return {
            "message": "Presentation saved successfully",
            "id": f"pres_{datetime.now().timestamp()}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save presentation: {str(e)}")

@app.get("/api/presentations")
async def get_presentations():
    """Get all presentations (placeholder for future database integration)"""
    # In a real application, you would fetch from a database here
    return {
        "presentations": [],
        "message": "No presentations found (database not implemented yet)"
    }

@app.get("/api/models")
async def get_available_models():
    """Get available AI models from OpenRouter"""
    try:
        models = await ai_service.get_available_models()
        return {
            "models": models,
            "default_model": ai_service.default_model
        }
    except Exception as e:
        print(f"Error fetching models: {e}")
        return {
            "models": [],
            "default_model": ai_service.default_model,
            "error": "Failed to fetch models"
        }

@app.post("/api/generate-image")
async def generate_image(request: dict):
    """Generate an image using AI"""
    try:
        image_prompt = request.get("prompt")
        if not image_prompt:
            raise HTTPException(status_code=400, detail="Image prompt is required")
        
        image_url = await ai_service.generate_image(image_prompt)
        if not image_url:
            raise HTTPException(status_code=500, detail="Failed to generate image")
        
        return {
            "image_url": image_url,
            "prompt": image_prompt
        }
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document (PDF, PPT, TXT)"""
    try:
        # Validate file type
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in document_processor.supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported formats: {', '.join(document_processor.supported_formats)}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Process the document
            result = await document_processor.process_document(tmp_file_path, file.filename)
            
            if not result["success"]:
                raise HTTPException(status_code=500, detail=result["error"])
            
            return {
                "filename": result["filename"],
                "content": result["content"],
                "word_count": result["word_count"],
                "char_count": result["char_count"]
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
                
    except Exception as e:
        print(f"Error processing document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.post("/api/ingest-url")
async def ingest_url(req: UrlIngestRequest):
    try:
        if not req.url:
            raise HTTPException(status_code=400, detail="URL is required")
        result = await document_processor.fetch_url_content(req.url)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to fetch URL"))
        return result
    except Exception as e:
        print(f"Error ingesting URL: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to ingest URL: {str(e)}")

@app.post("/api/ingest-text")
async def ingest_text(req: TextIngestRequest):
    try:
        if not req.text:
            raise HTTPException(status_code=400, detail="Text is required")
        result = await document_processor.ingest_plain_text(req.text, req.name or "pasted_text")
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to ingest text"))
        return result
    except Exception as e:
        print(f"Error ingesting text: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to ingest text: {str(e)}")

@app.post("/api/generate-outline")
async def generate_outline(req: OutlineRequest):
    try:
        print(f"🧠 Received content from frontend: {req.content}")  # ✅ log incoming prompt

        if not req.content:
            raise HTTPException(status_code=400, detail="Content is required")

        outline = await ai_service.generate_outline(req.content)

        print(f"✅ AI service returned outline: {outline}")  # ✅ log response

        if not outline:
            print("⚠️ Warning: outline is empty or None")
        return outline
    except Exception as e:
        print(f"❌ Error generating outline: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate outline: {str(e)}")


@app.post("/api/generate-slides")
async def generate_slides(req: OutlineToSlidesRequest):
    try:
        if not req.outline:
            raise HTTPException(status_code=400, detail="Outline is required")
        slides_payload = await ai_service.generate_slides_from_outline(req.outline)

        # Ensure images for each slide as in other flows
        enriched_slides = []
        for slide in slides_payload.get("slides", []):
            image_url = slide.get("imageUrl")
            if not image_url:
                prompt = slide.get("imagePrompt") or f"Create a presentation-ready visual for: {slide.get('title','')}. {slide.get('content','')}"
                try:
                    gen = await ai_service.generate_image(prompt)
                    image_url = gen or "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop"
                except Exception:
                    image_url = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop"
            slide["imageUrl"] = image_url
            enriched_slides.append(slide)

        slides_payload["slides"] = enriched_slides
        return slides_payload
    except Exception as e:
        print(f"Error generating slides from outline: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate slides: {str(e)}")

@app.post("/api/summarize-document")
async def summarize_document(request: dict):
    """
    Create a presentation from document content or generate an outline only.
    Use `outline_only: true` to skip slide image generation for faster outline preview.
    """
    try:
        document_content = request.get("content")
        filename = request.get("filename", "document")
        outline_only = request.get("outline_only", False)

        if not document_content:
            raise HTTPException(status_code=400, detail="Document content is required")

        ai_response = await ai_service.summarize_document(document_content, filename, outline_only)

        # ✅ Outline-only mode: no image generation
        if outline_only:
            return {
                "title": ai_response.get("title", "Document Summary"),
                "description": ai_response.get("description", f"Outline from {filename}"),
                "outline": ai_response.get("slides", []),
            }

        # 🖼️ Full mode (for later: when user clicks Generate Slides)
        slides = []
        for slide_data in ai_response.get("slides", []):
            image_url = slide_data.get("imageUrl")

            if not image_url:
                image_prompt = slide_data.get("imagePrompt")
                if not image_prompt:
                    title = slide_data.get("title", "")
                    content = slide_data.get("content", "")
                    image_prompt = f"Create a presentation-ready visual for: {title}. {content}. Clean, modern, professional."
                try:
                    gen = await ai_service.generate_image(image_prompt)
                    image_url = gen or "https://images.unsplash.com/photo-1557804506-669a67965ba0"
                except Exception:
                    image_url = "https://images.unsplash.com/photo-1557804506-669a67965ba0"

            slide = {
                "type": slide_data.get("type", "content"),
                "title": slide_data.get("title", ""),
                "content": slide_data.get("content", ""),
                "imageUrl": image_url,
            }
            slides.append(slide)

        return {
            "title": ai_response.get("title", "Document Summary"),
            "description": ai_response.get("description", f"Presentation created from {filename}"),
            "slides": slides,
            "theme": ai_response.get("theme", "modern"),
        }

    except Exception as e:
        print(f"Error in summarize_document endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to summarize document: {str(e)}")

# New Gamma-style endpoints
@app.post("/api/generate-slide")
async def generate_slide(request: GenerateSlideRequest):
    """Generate a single slide from a prompt (Gamma-style)"""
    try:
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        slide = await ai_service.generate_slide_from_prompt(
            request.prompt, 
            request.model, 
            request.theme
        )
        return slide
        
    except Exception as e:
        print(f"Error in generate_slide endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate slide: {str(e)}")

@app.post("/api/enhance-slide")
async def enhance_slide(request: EnhanceSlideRequest):
    """Enhance an existing slide with AI (Gamma-style sparkle feature)"""
    try:
        if not request.slide:
            raise HTTPException(status_code=400, detail="Slide data is required")
        
        enhanced_slide = await ai_service.enhance_slide_with_ai(
            request.slide, 
            request.enhancement_type, 
            request.model
        )
        return enhanced_slide
        
    except Exception as e:
        print(f"Error in enhance_slide endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to enhance slide: {str(e)}")

@app.get("/api/themes")
async def get_themes():
    """Get available themes"""
    try:
        themes = ai_service.get_available_themes()
        return {
            "themes": themes,
            "message": "Available themes retrieved successfully"
        }
    except Exception as e:
        print(f"Error fetching themes: {e}")
        return {
            "themes": [],
            "error": "Failed to fetch themes"
        }

@app.post("/api/create-theme")
async def create_theme(request: CreateThemeRequest):
    """Create a custom theme"""
    try:
        if not request.name.strip():
            raise HTTPException(status_code=400, detail="Theme name is required")
        
        theme_name = ai_service.create_custom_theme(
            request.name,
            primary_color=request.primary_color,
            secondary_color=request.secondary_color,
            accent_color=request.accent_color,
            background_color=request.background_color,
            text_color=request.text_color,
            font_family=request.font_family,
            image_style_keywords=request.image_style_keywords
        )
        
        return {
            "theme_name": theme_name,
            "message": "Custom theme created successfully"
        }
        
    except Exception as e:
        print(f"Error creating theme: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create theme: {str(e)}")

# Serve static files in production
if os.path.exists("dist"):
    app.mount("/static", StaticFiles(directory="dist"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React app for any non-API routes"""
        if full_path.startswith("api/"):
            return {"error": "API endpoint not found"}
        return FileResponse("dist/index.html")

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=5000, 
        reload=True,
        log_level="info"
    )
