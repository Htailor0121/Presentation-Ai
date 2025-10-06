import os
import json
import httpx
import re
from typing import Dict, Any, List
from dotenv import load_dotenv
from theme_manager import theme_manager
from interactive_features import interactive_manager
import matplotlib.pyplot as plt
import io, base64
from datetime import datetime

load_dotenv()

class AIHeavyPresentationService:
    """
    Maximizes AI usage - single comprehensive prompt generates everything
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.default_model = os.getenv("DEFAULT_AI_MODEL", "mistralai/mistral-7b-instruct:free")
        self.image_model = os.getenv("IMAGE_MODEL", "google/gemini-2.0-flash-exp:free")
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found")
    
    async def generate_presentation(
        self,
        topic: str,
        model: str = None,
        theme_name: str = "modern",
        include_interactive: bool = True,
        num_slides: int = 8
    ) -> Dict[str, Any]:
        """
        Generate complete presentation with ONE AI call
        Compatible with existing API
        """
        
        print(f"🎨 Generating presentation with AI-heavy approach...")
        
        # Step 1: Single comprehensive AI call
        presentation_data = await self._generate_with_comprehensive_prompt(
            topic, 
            theme_name, 
            num_slides,
            model or self.default_model
        )
        
        # Step 2: Only generate images and charts (technical tasks)
        enhanced_slides = await self._add_media_assets(
            presentation_data.get("slides", [])
        )
        
        # Step 3: Apply theme and interactive features
        theme = theme_manager.get_theme(theme_name)
        final_slides = []
        
        for i, slide in enumerate(enhanced_slides):
            slide = self._apply_theme_colors(slide, theme)
            
            if include_interactive:
                slide = interactive_manager.enhance_slide_with_interactivity(slide)
            
            slide["id"] = slide.get("id") or f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}"
            final_slides.append(slide)
        
        return {
            "title": presentation_data.get("title", topic.title()),
            "description": presentation_data.get("description", f"AI-generated presentation about {topic}"),
            "theme": theme.name,
            "themeData": self._get_theme_data(theme),
            "slides": final_slides,
            "metadata": {
                "totalSlides": len(final_slides),
                "hasInteractiveFeatures": include_interactive,
                "hasCharts": any("chartUrl" in s for s in final_slides),
                "hasImages": all("imageUrl" in s for s in final_slides),
                "generatedAt": datetime.now().isoformat()
            }
        }
    
    async def _generate_with_comprehensive_prompt(
        self,
        topic: str,
        theme: str,
        num_slides: int,
        model: str
    ) -> Dict[str, Any]:
        """ONE comprehensive prompt that asks AI to do EVERYTHING"""
        
        prompt = f"""Create a complete {num_slides}-slide presentation about: {topic}

YOU MUST:
1. Design the entire presentation flow and structure
2. Write detailed, engaging content for each slide
3. Decide optimal slide types and layouts
4. Create descriptive image prompts for AI image generation
5. Identify slides that need data visualizations and specify chart data
6. Ensure logical flow and narrative coherence

RETURN ONLY THIS EXACT JSON STRUCTURE:
{{
  "title": "Engaging Presentation Title",
  "description": "Brief compelling description",
  "slides": [
    {{
      "type": "title|content|comparison|timeline|data",
      "title": "Compelling Slide Title",
      "content": "Detailed, well-written content (3-5 bullet points or 2-3 paragraphs)",
      "imagePrompt": "Detailed description for AI image generation (be specific: style, mood, elements, colors)",
      "layout": "center|left|right|two-column|full-image",
      "chartData": {{
        "needed": true|false,
        "type": "bar|pie|line|scatter",
        "title": "Chart Title",
        "labels": ["Label1", "Label2", "Label3"],
        "values": [30, 45, 25],
        "description": "What this data shows"
      }}
    }}
  ]
}}

GUIDELINES:
- First slide MUST be an engaging title slide with type: "title"
- Last slide should be conclusion/call-to-action
- Vary slide types for engagement
- Include 1-2 data visualization slides if topic involves numbers/trends
- Image prompts should be detailed and specific
- Keep content concise but meaningful
- Ensure proper JSON formatting

IMPORTANT: Return ONLY the JSON, no other text."""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an expert presentation designer. You create engaging, well-structured presentations with compelling content. You always return valid JSON."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.8,
                        "max_tokens": 8000
                    },
                    timeout=90
                )
            
            if response.status_code != 200:
                raise Exception(f"API error: {response.status_code}")
            
            content = response.json()["choices"][0]["message"]["content"]
            
            # Extract JSON
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise Exception("No valid JSON in response")
                
        except Exception as e:
            print(f"❌ Error in comprehensive prompt: {e}")
            return self._create_emergency_fallback(topic, num_slides)
        
    async def get_available_models(self) -> List[str]:
        """Get available models from OpenRouter"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://openrouter.ai/api/v1/models",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                    },
                    timeout=10
                )

            if response.status_code == 200:
                data = response.json()
                models = data.get("data", [])
                return [model["id"] for model in models if model.get("id")]
            return []
        except Exception as e:
            print(f"Error fetching models from OpenRouter: {e}")
            return []
    
    async def _add_media_assets(self, slides: List[Dict]) -> List[Dict]:
        """Generate images and render charts"""
        enhanced = []
        
        for i, slide in enumerate(slides):
            print(f"  Processing slide {i+1}/{len(slides)}: {slide.get('title')}")
            
            # Generate image
            if slide.get("imagePrompt"):
                try:
                    image_url = await self._generate_image(slide["imagePrompt"])
                    slide["imageUrl"] = image_url
                except Exception as e:
                    print(f"    ⚠️ Image gen failed: {e}")
                    slide["imageUrl"] = self._fallback_image()
            
            # Generate chart
            chart_data = slide.get("chartData", {})
            if chart_data.get("needed") and chart_data.get("labels"):
                try:
                    chart_url = self._render_chart(chart_data)
                    slide["chartUrl"] = chart_url
                    print(f"    📊 Chart generated")
                except Exception as e:
                    print(f"    ⚠️ Chart gen failed: {e}")
            
            enhanced.append(slide)
        
        return enhanced
    
    async def _generate_image(self, prompt: str) -> str:
        """Generate image from prompt using OpenRouter"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",  # ✅ Use chat completions endpoint
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.image_model,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "max_tokens": 1000  # For image models
                    },
                    timeout=60
                )
        
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
            
            # Check if response contains an image URL or base64
            # Some models return URLs, others return markdown with URLs
                import re
            
            # Try to extract URL from markdown format: ![image](url)
                url_match = re.search(r'!\[.*?\]\((https?://[^\)]+)\)', content)
                if url_match:
                    return url_match.group(1)
            
            # Try to find any URL in the response
                url_match = re.search(r'https?://[^\s]+', content)
                if url_match:
                    return url_match.group(0)
            
            # If the content itself is a URL
                if content.startswith('http'):
                    return content
            
                print(f"Unexpected image response format: {content[:200]}")
            else:
                print(f"Image generation failed: {response.status_code} - {response.text}")
        
            return self._fallback_image()
        
        except Exception as e:
            print(f"Image generation error: {e}")
            return self._fallback_image()
    
    def _render_chart(self, chart_data: Dict) -> str:
        """Render chart to base64 image"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        chart_type = chart_data.get("type", "bar")
        labels = chart_data.get("labels", [])
        values = chart_data.get("values", [])
        title = chart_data.get("title", "Chart")
        
        if chart_type == "bar":
            ax.bar(labels, values, color="#3b82f6")
        elif chart_type == "pie":
            ax.pie(values, labels=labels, autopct="%1.1f%%", startangle=90)
        elif chart_type == "line":
            ax.plot(labels, values, marker="o", linewidth=2, markersize=8)
        elif chart_type == "scatter":
            ax.scatter(range(len(values)), values, s=100, alpha=0.6)
            ax.set_xticks(range(len(labels)))
            ax.set_xticklabels(labels)
        
        ax.set_title(title, fontsize=14, fontweight="bold", pad=20)
        
        if chart_data.get("description"):
            ax.text(
                0.5, -0.15, 
                chart_data["description"],
                transform=ax.transAxes,
                ha="center",
                fontsize=10,
                style="italic"
            )
        
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")
        plt.close(fig)
        
        return f"data:image/png;base64,{img_base64}"
    
    def _apply_theme_colors(self, slide: Dict, theme) -> Dict:
        """Apply theme colors to slide"""
        slide["backgroundColor"] = theme.background_color
        slide["textColor"] = theme.text_color
        slide["primaryColor"] = theme.primary_color
        slide["secondaryColor"] = theme.secondary_color
        slide["accentColor"] = theme.accent_color
        return slide
    
    def _get_theme_data(self, theme) -> Dict:
        return {
            "primaryColor": theme.primary_color,
            "secondaryColor": theme.secondary_color,
            "accentColor": theme.accent_color,
            "backgroundColor": theme.background_color,
            "textColor": theme.text_color,
            "fontFamily": theme.font_family
        }
    
    def _fallback_image(self) -> str:
        return "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop"
    
    def _create_emergency_fallback(self, topic: str, num_slides: int) -> Dict:
        """Emergency fallback if AI completely fails"""
        slides = [
            {
                "type": "content",
                "title": f"Slide {i+1}: {topic}",
                "content": f"Content about {topic}",
                "imagePrompt": f"Professional image for {topic}",
                "layout": "left",
                "chartData": {"needed": False}
            }
            for i in range(num_slides)
        ]
        
        slides[0]["type"] = "title"
        slides[0]["title"] = topic.title()
        slides[0]["layout"] = "center"
        
        return {
            "title": topic.title(),
            "description": f"Presentation about {topic}",
            "slides": slides
        }
    
    # Backward compatibility methods
    def get_available_themes(self) -> List[str]:
        return theme_manager.get_available_themes()
    
    def create_custom_theme(self, name: str, **kwargs) -> str:
        theme = theme_manager.create_custom_theme(name, **kwargs)
        return theme.name
    
    async def generate_image(self, prompt: str) -> str:
        """Public method for image generation"""
        return await self._generate_image(prompt)
    
    async def generate_outline(self, content: str):
        """Compatibility wrapper"""
        result = await self._generate_with_comprehensive_prompt(
            content, "modern", 8, self.default_model
        )
        return {"title": result["title"], "sections": result["slides"]}
    
    async def generate_slides_from_outline(self, outline: dict):
        """Compatibility wrapper"""
        return {"slides": outline.get("sections", [])}
    
    async def summarize_document(self, content: str, filename: str = "document"):
        """Generate presentation from document content"""
        return await self.generate_presentation(
            topic=f"Summary of {filename}: {content[:200]}",
            num_slides=6
        )


# Alias for backward compatibility
PresentaionAi = AIHeavyPresentationService