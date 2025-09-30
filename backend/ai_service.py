"""
AI Service for generating presentations using OpenRouter API
"""
import os
import json
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

# Safely load .env even if saved with BOM or odd encoding
def _safe_load_env() -> None:
    try:
        load_dotenv(encoding="utf-8")
        return
    except Exception:
        pass
    try:
        # Handle UTF-8 with BOM
        load_dotenv(encoding="utf-8-sig")
    except Exception:
        # As a last resort, continue without .env; rely on real env vars
        pass

_safe_load_env()

class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        # Prefer env overrides; fall back to widely available free models
        self.default_model = os.getenv("DEFAULT_AI_MODEL")
        self.image_model = os.getenv("image_model")
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables")
    
    async def generate_presentation(self, prompt: str, model: str = None) -> Dict[str, Any]:
        """Generate a presentation using OpenRouter API"""
        model = model or self.default_model
        
        system_prompt = """You are an expert presentation designer. Generate a professional presentation based on the user's prompt.

Return a JSON response with this exact structure:
{
  "title": "Presentation Title",
  "description": "Brief description",
  "slides": [
    {
      "type": "title",
      "title": "Slide Title",
      "content": "Slide content with bullet points or text",
      "backgroundColor": "#3b82f6",
      "textColor": "#ffffff",
      "layout": "center",
      "imagePrompt": "Description for AI image generation"
    }
  ]
}

Slide types: title, content, image, chart, quote
Layouts: center, left, right, two-column
Use professional color schemes and ensure content is engaging and well-structured.

For image slides, include an "imagePrompt" field with a detailed description for AI image generation that matches the slide content."""

        user_prompt = f"""Create a professional presentation about: {prompt}

Make it engaging with:
- A compelling title slide
- 10 to 20 content slides with key points
- Include different diffrent  image in all slides with relevant visuals
- Use bullet points and clear structure
- Include a conclusion slide
- Use professional color schemes
- Make content informative and well-organized
- For image slides, provide detailed image prompts that match the content"""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                            headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                                "User-Agent": "PresentationAI/1.0",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Presentation AI"
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                    except Exception as e:
                        print(f"Text JSON parse error: {e}; body: {response.text}")
                        return self._create_fallback_presentation(prompt)
                    content = data["choices"][0]["message"]["content"]
                    
                    try:
                        start_idx = content.find('{')
                        end_idx = content.rfind('}') + 1
                        if start_idx != -1 and end_idx != -1:
                            json_content = content[start_idx:end_idx]
                            presentation_data = json.loads(json_content)
                            return presentation_data
                        else:
                            raise ValueError("No JSON found in response")
                    except (json.JSONDecodeError, ValueError) as e:
                        # Fallback to mock data if JSON parsing fails
                        print(f"JSON parsing failed: {e}")
                        return self._create_fallback_presentation(prompt)
                else:
                    print(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._create_fallback_presentation(prompt)
                    
        except Exception as e:
            print(f"Error calling OpenRouter API: {e}")
            return self._create_fallback_presentation(prompt)
    
    def _create_fallback_presentation(self, prompt: str) -> Dict[str, Any]:
        """Create a fallback presentation if AI service fails"""
        title = self._extract_title_from_prompt(prompt)
        
        return {
            "title": title,
            "description": prompt,
            "theme": "modern",
            "slides": [
                {
                    "type": "title",
                    "title": title,
                    "content": f"A presentation about {prompt.lower()}",
                    "backgroundColor": "#3b82f6",
                    "textColor": "#ffffff",
                    "layout": "center"
                },
                {
                    "type": "content",
                    "title": "Introduction",
                    "content": f"Welcome to our presentation about {prompt.lower()}.\n\nIn this presentation, we will explore the key concepts and important aspects of this topic.",
                    "backgroundColor": "#ffffff",
                    "textColor": "#1f2937",
                    "layout": "left"
                },
                {
                    "type": "content",
                    "title": "Key Points",
                    "content": "Here are the main points we'll cover:\n\n• Understanding the basics\n• Important considerations\n• Best practices\n• Future outlook",
                    "backgroundColor": "#f8fafc",
                    "textColor": "#1f2937",
                    "layout": "left"
                },
                {
                    "type": "content",
                    "title": "Conclusion",
                    "content": f"Thank you for your attention!\n\nWe hope this presentation has provided valuable insights about {prompt.lower()}.\n\nQuestions?",
                    "backgroundColor": "#1f2937",
                    "textColor": "#ffffff",
                    "layout": "center"
                }
            ]
        }
    
    def _extract_title_from_prompt(self, prompt: str) -> str:
        """Extract a clean title from the prompt"""
        words = prompt.split()
        title = " ".join(word.capitalize() for word in words)
        title = "".join(c for c in title if c.isalnum() or c.isspace()).strip()
        return title[:50]
    
    async def generate_image(self, image_prompt: str) -> str:
        """Generate an image using OpenRouter's image generation models"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/images",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "User-Agent": "PresentationAI/1.0",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Presentation AI"
                    },
                    json={
                        "model": self.image_model,
                        "prompt": f"Professional presentation slide image: {image_prompt}. Clean, modern, business-ready.",
                        "size": "1024x1024",
                        "num_images": 1
                    },
                    timeout=60.0
                )

                if response.status_code == 200:
                    try:
                        data = response.json()
                    except Exception as e:
                        print(f"Image JSON parse error: {e}; body: {response.text}")
                        return None
                    # OpenRouter may return either { data: [{ url }]} or { output: [url] }
                    if isinstance(data, dict):
                        if "data" in data and data["data"]:
                            first = data["data"][0]
                            if isinstance(first, dict) and "url" in first:
                                return first["url"]
                        if "output" in data and data["output"]:
                            return data["output"][0]
                    return None
                else:
                    print(f"Image generation failed: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            print(f"Error generating image: {e}")
            return None

    async def summarize_document(self, document_content: str, filename: str) -> Dict[str, Any]:
        """Summarize a document and create presentation outline"""
        system_prompt = """You are an expert presentation designer. Analyze the provided document and create a professional presentation outline.

Return a JSON response with this exact structure:
{
  "title": "Presentation Title based on document",
  "description": "Brief description of the document content",
  "theme": "modern",
  "slides": [
    {
      "type": "title",
      "title": "Slide Title",
      "content": "Slide content with bullet points or text",
      "backgroundColor": "#3b82f6",
      "textColor": "#ffffff",
      "layout": "center",
      "imagePrompt": "Description for AI image generation"
    }
  ]
}

Create a comprehensive presentation that covers:
- Title slide with document summary
- Key concepts and main points (3-5 slides)
- Important details and supporting information
- Conclusion slide
- Include 1-2 image slides with relevant visuals

Use professional color schemes and ensure content is well-structured and engaging."""

        user_prompt = f"""Document: {filename}

Content:
{document_content}

Please create a professional presentation outline from this document. Make it comprehensive and engaging, covering all the key points from the document."""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Presentation AI"
                    },
                    json={
                        "model": self.default_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 3000
                    },
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    
                    # Try to parse JSON from the response
                    try:
                        # Extract JSON from the response
                        start_idx = content.find('{')
                        end_idx = content.rfind('}') + 1
                        if start_idx != -1 and end_idx != -1:
                            json_content = content[start_idx:end_idx]
                            presentation_data = json.loads(json_content)
                            return presentation_data
                        else:
                            raise ValueError("No JSON found in response")
                    except (json.JSONDecodeError, ValueError) as e:
                        print(f"JSON parsing failed: {e}")
                        return self._create_document_fallback_presentation(document_content, filename)
                else:
                    print(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._create_document_fallback_presentation(document_content, filename)
                    
        except Exception as e:
            print(f"Error calling OpenRouter API: {e}")
            return self._create_document_fallback_presentation(document_content, filename)

    async def generate_outline(self, document_content: str) -> Dict[str, Any]:
        """Generate a slide outline (titles and bullets) from content"""
        system_prompt = (
            "You are a presentation expert. Create a concise slide outline from the provided content.\n"
            "Return JSON with: {\n  'title': str,\n  'sections': [ { 'title': str, 'bullets': [str, ...] } ]\n}\n"
            "Use 5-10 sections max, short bullet points, business-ready language."
        )
        user_prompt = f"Content for outline:\n\n{document_content[:15000]}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "User-Agent": "PresentationAI/1.0",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Presentation AI"
                    },
                    json={
                        "model": self.default_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.5,
                        "max_tokens": 1500
                    },
                    timeout=60.0
                )

                if response.status_code == 200:
                    try:
                        data = response.json()
                        content = data["choices"][0]["message"]["content"]
                        start_idx = content.find('{')
                        end_idx = content.rfind('}') + 1
                        if start_idx != -1 and end_idx != -1:
                            return json.loads(content[start_idx:end_idx])
                        else:
                            raise ValueError("No JSON in outline response")
                    except Exception as e:
                        print(f"Outline JSON parse error: {e}; body: {response.text}")
                        return {"title": "Outline", "sections": []}
                else:
                    print(f"Outline API error: {response.status_code} - {response.text}")
                    return {"title": "Outline", "sections": []}
        except Exception as e:
            print(f"Error generating outline: {e}")
            return {"title": "Outline", "sections": []}

    async def generate_slides_from_outline(self, outline: Dict[str, Any]) -> Dict[str, Any]:
        """Turn an outline into slide-level content with bullets, notes, and image prompts"""
        system_prompt = (
            "You are a presentation expert. Given an outline (title + sections with bullets),\n"
            "produce a JSON with: { 'title': str, 'description': str, 'theme': 'modern', 'slides': [\n"
            "{ 'type': 'content'|'image'|'title'|'quote', 'title': str, 'content': str,\n"
            "  'backgroundColor': '#ffffff', 'textColor': '#1f2937', 'layout': 'left',\n"
            "  'imagePrompt': str (optional) } ] }\n"
            "- Convert bullets into concise lines (max 6 per slide).\n"
            "- For at least 1-2 slides, add an 'image' slide with a detailed 'imagePrompt' that matches the section.\n"
            "- Keep content business-ready, clear, and short."
        )
        user_prompt = f"Outline to expand into slides:\n\n{json.dumps(outline)[:15000]}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "User-Agent": "PresentationAI/1.0",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Presentation AI"
                    },
                    json={
                        "model": self.default_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.6,
                        "max_tokens": 2200
                    },
                    timeout=60.0
                )

                if response.status_code == 200:
                    try:
                        data = response.json()
                        content = data["choices"][0]["message"]["content"]
                        start_idx = content.find('{')
                        end_idx = content.rfind('}') + 1
                        if start_idx != -1 and end_idx != -1:
                            return json.loads(content[start_idx:end_idx])
                        else:
                            raise ValueError("No JSON in slides response")
                    except Exception as e:
                        print(f"Slides JSON parse error: {e}; body: {response.text}")
                        # Minimal structure fallback
                        return {
                            "title": outline.get("title", "Presentation"),
                            "description": "Generated from outline",
                            "theme": "modern",
                            "slides": []
                        }
                else:
                    print(f"Slides API error: {response.status_code} - {response.text}")
                    return {
                        "title": outline.get("title", "Presentation"),
                        "description": "Generated from outline",
                        "theme": "modern",
                        "slides": []
                    }
        except Exception as e:
            print(f"Error generating slides: {e}")
            return {
                "title": outline.get("title", "Presentation"),
                "description": "Generated from outline",
                "theme": "modern",
                "slides": []
            }

    def _create_document_fallback_presentation(self, document_content: str, filename: str) -> Dict[str, Any]:
        """Create a fallback presentation from document content"""
        # Extract title from filename
        title = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ').title()
        
        # Create basic slides from document content
        content_words = document_content.split()
        chunk_size = 200
        chunks = [' '.join(content_words[i:i + chunk_size]) for i in range(0, len(content_words), chunk_size)]
        
        slides = [
            {
                "type": "title",
                "title": f"Summary of {title}",
                "content": f"Key insights from {filename}",
                "backgroundColor": "#3b82f6",
                "textColor": "#ffffff",
                "layout": "center"
            }
        ]
        
        # Add content slides
        for i, chunk in enumerate(chunks[:4]):  # Limit to 4 content slides
            slides.append({
                "type": "content",
                "title": f"Key Point {i + 1}",
                "content": chunk,
                "backgroundColor": "#ffffff",
                "textColor": "#1f2937",
                "layout": "left"
            })
        
        # Add conclusion
        slides.append({
            "type": "content",
            "title": "Conclusion",
            "content": f"Summary of {title}\n\nKey takeaways and insights from the document.",
            "backgroundColor": "#1f2937",
            "textColor": "#ffffff",
            "layout": "center"
        })
        
        return {
            "title": f"Document Summary: {title}",
            "description": f"Presentation created from {filename}",
            "theme": "modern",
            "slides": slides
        }

    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available FREE models from OpenRouter"""
        # Return curated list of best FREE models
        free_models = [
            {
                "id": "meta-llama/llama-3.1-8b-instruct:free",
                "name": "Llama 3.1 8B (FREE)",
                "description": "Best free model, excellent quality",
                "context_length": 8192,
                "pricing": {"prompt": "0", "completion": "0"}
            },
            {
                "id": "microsoft/phi-3-mini-4k-instruct:free",
                "name": "Phi-3 Mini (FREE)",
                "description": "Fastest free model",
                "context_length": 4096,
                "pricing": {"prompt": "0", "completion": "0"}
            },
            {
                "id": "google/gemini-flash-1.5:free",
                "name": "Gemini Flash (FREE)",
                "description": "Google's free model",
                "context_length": 1048576,
                "pricing": {"prompt": "0", "completion": "0"}
            },
            {
                "id": "mistralai/mistral-7b-instruct:free",
                "name": "Mistral 7B (FREE)",
                "description": "European alternative",
                "context_length": 32768,
                "pricing": {"prompt": "0", "completion": "0"}
            }
        ]
        
        return free_models

# Global instance
ai_service = OpenRouterService()
