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
import urllib.parse

load_dotenv()

class AIHeavyPresentationService:
    """
    Uses Hugging Face free models for image generation
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.default_model = os.getenv("DEFAULT_AI_MODEL", "mistralai/mistral-7b-instruct:free")
        
        # Hugging Face Inference API
        self.hf_api_key = os.getenv("HUGGINGFACE_API_KEY", "")  # Optional but recommended for rate limits
        self.hf_api_url = "https://api-inference.huggingface.co/models/"
        
        # Free image generation models on Hugging Face
        self.hf_image_models = [
            "stabilityai/stable-diffusion-2-1",           # Fast, reliable
            "stabilityai/stable-diffusion-xl-base-1.0",   # High quality
            "runwayml/stable-diffusion-v1-5",             # Classic SD
            "prompthero/openjourney-v4",                   # Artistic style
            "Lykon/dreamshaper-8",                        # Great for various styles
            "SG161222/Realistic_Vision_V5.1_noVAE",       # Photorealistic
        ]
        
        # Default model
        self.current_hf_model = os.getenv("HF_IMAGE_MODEL", self.hf_image_models[0])
        
        # Fallback: Pollinations.ai (no API key needed)
        self.pollinations_url = "https://image.pollinations.ai/prompt/"
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found")
    
    async def call_openrouter_api(self, system_prompt: str, user_prompt: str, model: str = None):
        """Generic helper to send a chat completion request to OpenRouter."""
        model = model or self.default_model

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)

        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")

        try:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print("⚠️ OpenRouter raw response:", response.text[:1000])  # print first 1000 chars
            raise Exception(f"Failed to parse OpenRouter response as JSON: {e}")
    
    async def generate_presentation(
        self,
        topic: str,
        model: str = None,
        theme_name: str = "modern",
        include_interactive: bool = True,
        num_slides: int = 8
    ) -> Dict[str, Any]:
        """Generate complete presentation with AI-generated images"""
        
        print(f"🎨 Generating presentation with AI-heavy approach...")
        print(f"🖼️  Using Hugging Face model: {self.current_hf_model}")
        
        # Step 1: Single comprehensive AI call
        presentation_data = await self._generate_with_comprehensive_prompt(
            topic, 
            theme_name, 
            num_slides,
            model or self.default_model
        )
        
        # Step 2: Generate AI images and charts
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
3. Create concise image generation prompts for Stable Diffusion (20-30 words max)
4. Identify slides that need data visualizations and specify chart data
5. Ensure logical flow and narrative coherence

RETURN ONLY THIS EXACT JSON STRUCTURE:
{{
  "title": "Engaging Presentation Title",
  "description": "Brief compelling description",
  "slides": [
    {{
      "type": "title|content|comparison|timeline|data",
      "title": "Compelling Slide Title",
      "content": "Detailed, well-written content (3-5 bullet points or 2-3 paragraphs)",
      "imagePrompt": "Stable Diffusion prompt (20-30 words). Be specific but concise. Example: modern futuristic architecture with glass and steel, AI technology elements, professional photography, natural lighting, high detail, 4k quality",
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

IMAGE PROMPT GUIDELINES FOR STABLE DIFFUSION:
- Keep to 20-30 words maximum
- Include quality tags: "high detail", "professional", "4k", "photorealistic"
- Specify style: "photography", "illustration", "3D render", "concept art"
- Good examples:
  * "futuristic smart building with holographic AI displays, glass architecture, blue lighting, professional architectural photography, high detail, 4k"
  * "modern office interior, architect using AI software on tablet, natural lighting, professional photography, contemporary design, sharp focus"
  * "abstract digital AI brain network, glowing neural connections, blue and purple colors, digital art, high tech, detailed illustration"

GUIDELINES:
- First slide MUST be type: "title" with layout: "center"
- Last slide should be conclusion/call-to-action
- Vary slide types for engagement
- Include 1-2 data visualization slides if topic involves numbers/trends
- Keep content concise but meaningful
- Make image prompts suitable for Stable Diffusion

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
                                "content": "You are an expert presentation designer and Stable Diffusion prompt engineer. Create engaging presentations with concise, effective image prompts. Always return valid JSON."
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
                try:
                    return json.loads(json_match.group())
                except Exception:
                    # Sometimes model returns nested JSON in a string
                    inner_json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
                    if inner_json_match:
                        slides_data = json.loads(inner_json_match.group())
                        return {
                            "title": f"{topic.title()} Presentation",
                            "description": f"AI-parsed fallback for {topic}",
                            "slides": slides_data
                        }
                    raise Exception("Invalid JSON after parsing")
            else:
                raise Exception("No valid JSON in response")

                
        except Exception as e:
            print(f"❌ Error in comprehensive prompt: {e}")
            return self._create_emergency_fallback(topic, num_slides)
    
    async def _add_media_assets(self, slides: List[Dict]) -> List[Dict]:
        """Generate AI images using Hugging Face and render charts"""
        enhanced = []
        
        for i, slide in enumerate(slides):
            print(f"  Processing slide {i+1}/{len(slides)}: {slide.get('title')}")
            
            # Generate AI image
            image_prompt = slide.get("imagePrompt", "")
            if image_prompt:
                try:
                    # Try Hugging Face first
                    image_url = await self._generate_hf_image(image_prompt)
                    if image_url:
                        slide["imageUrl"] = image_url
                        print(f"    🎨 Hugging Face image generated")
                    else:
                        # Fallback to Pollinations.ai
                        print(f"    🔄 Trying Pollinations.ai fallback...")
                        image_url = await self._generate_pollinations_image(image_prompt)
                        slide["imageUrl"] = image_url
                        print(f"    🎨 Pollinations.ai image generated")
                except Exception as e:
                    print(f"    ⚠️ Image generation error: {e}")
                    slide["imageUrl"] = self._get_placeholder_image(i)
            else:
                slide["imageUrl"] = self._get_placeholder_image(i)
            
            # Generate chart if needed
            chart_data = slide.get("chartData", {})
            if chart_data.get("needed") and chart_data.get("labels") and chart_data.get("values"):
                try:
                    chart_url = self._render_chart(chart_data)
                    if chart_url:
                        slide["chartUrl"] = chart_url
                        print(f"    📊 Chart generated")
                except Exception as e:
                    print(f"    ⚠️ Chart generation failed: {e}")
            
            enhanced.append(slide)
        
        return enhanced
    
    async def _generate_hf_image(self, prompt: str) -> str:
        """
        Generate image using Hugging Face Inference API
        Returns base64 data URL
        """
        headers = {}
        if self.hf_api_key:
            headers["Authorization"] = f"Bearer {self.hf_api_key}"
        
        # Try primary model
        result = await self._try_hf_model(self.current_hf_model, prompt, headers)
        if result:
            return result
        
        # Try alternative models
        for model in self.hf_image_models:
            if model != self.current_hf_model:
                print(f"    🔄 Trying alternative HF model: {model.split('/')[-1]}")
                result = await self._try_hf_model(model, prompt, headers)
                if result:
                    return result
        
        return None
    
    async def _try_hf_model(self, model: str, prompt: str, headers: dict) -> str:
        """Try to generate image with a specific Hugging Face model"""
        try:
            url = f"{self.hf_api_url}{model}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": prompt},
                    timeout=120  # Hugging Face can take time for cold starts
                )
            
            if response.status_code == 200:
                # Image is returned as bytes
                image_bytes = response.content
                
                # Convert to base64 data URL
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                return f"data:image/png;base64,{image_base64}"
            
            elif response.status_code == 503:
                # Model is loading
                print(f"    ⏳ Model loading (503), will retry...")
                return None
            
            else:
                error_text = response.text[:200]
                print(f"    ⚠️ HF API error {response.status_code}: {error_text}")
                return None
                
        except Exception as e:
            print(f"    ⚠️ HF model {model.split('/')[-1]} failed: {str(e)[:100]}")
            return None
    
    async def _generate_pollinations_image(self, prompt: str) -> str:
        """
        Fallback: Generate image using Pollinations.ai (FREE, no API key)
        """
        try:
            clean_prompt = prompt.strip()
            encoded_prompt = urllib.parse.quote(clean_prompt)
            image_url = f"{self.pollinations_url}{encoded_prompt}?width=1200&height=800&nologo=true&enhance=true"
            return image_url
        except Exception as e:
            print(f"    Pollinations.ai error: {e}")
            raise
    
    def _get_placeholder_image(self, index: int) -> str:
        """Get a gradient placeholder if all generation fails"""
        colors = [
            ("#3b82f6", "#1e40af"),  # blue
            ("#10b981", "#059669"),  # green
            ("#f59e0b", "#d97706"),  # orange
            ("#ef4444", "#dc2626"),  # red
            ("#8b5cf6", "#7c3aed"),  # purple
            ("#ec4899", "#db2777"),  # pink
            ("#06b6d4", "#0891b2"),  # cyan
            ("#84cc16", "#65a30d"),  # lime
        ]
        color1, color2 = colors[index % len(colors)]
        
        svg = f'''<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad{index}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:{color1};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:{color2};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#grad{index})"/>
            <circle cx="600" cy="400" r="120" fill="white" opacity="0.2"/>
            <text x="600" y="420" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">
                Slide {index + 1}
            </text>
        </svg>'''
        
        svg_base64 = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
        return f"data:image/svg+xml;base64,{svg_base64}"
    
    def _render_chart(self, chart_data: Dict) -> str:
        """Render chart to base64 image"""
        try:
            fig, ax = plt.subplots(figsize=(10, 6))
            plt.style.use('default')
            
            chart_type = chart_data.get("type", "bar")
            labels = chart_data.get("labels", [])
            values = chart_data.get("values", [])
            title = chart_data.get("title", "Chart")
            
            if not labels or not values or len(labels) != len(values):
                raise ValueError("Invalid chart data")
            
            if chart_type == "bar":
                bars = ax.bar(labels, values, color="#3b82f6", alpha=0.8, edgecolor='#1e40af', linewidth=2)
                ax.set_ylabel('Values', fontsize=11, fontweight='bold')
                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height,
                           f'{height:.1f}',
                           ha='center', va='bottom', fontsize=9, fontweight='bold')
                           
            elif chart_type == "pie":
                colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                wedges, texts, autotexts = ax.pie(
                    values, 
                    labels=labels, 
                    autopct="%1.1f%%", 
                    startangle=90,
                    colors=colors[:len(values)],
                    textprops={'fontsize': 10, 'fontweight': 'bold'}
                )
                ax.axis('equal')
                
            elif chart_type == "line":
                ax.plot(labels, values, marker="o", linewidth=3, markersize=10, 
                       color='#3b82f6', markerfacecolor='#60a5fa', markeredgecolor='#1e40af', 
                       markeredgewidth=2)
                ax.set_ylabel('Values', fontsize=11, fontweight='bold')
                ax.grid(True, alpha=0.3, linestyle='--')
                for i, (label, value) in enumerate(zip(labels, values)):
                    ax.text(i, value, f'{value:.1f}', ha='center', va='bottom', 
                           fontsize=9, fontweight='bold')
                           
            elif chart_type == "scatter":
                scatter = ax.scatter(range(len(values)), values, s=200, alpha=0.6, 
                                   c='#3b82f6', edgecolors='#1e40af', linewidth=2)
                ax.set_xticks(range(len(labels)))
                ax.set_xticklabels(labels, fontsize=10)
                ax.set_ylabel('Values', fontsize=11, fontweight='bold')
                ax.grid(True, alpha=0.3, linestyle='--')
            
            ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            
            if chart_type in ['bar', 'scatter']:
                plt.xticks(rotation=45, ha='right', fontsize=10)
            
            if chart_data.get("description"):
                fig.text(0.5, 0.02, chart_data["description"],
                        ha="center", fontsize=11, style="italic", wrap=True)
            
            plt.tight_layout()
            
            buf = io.BytesIO()
            plt.savefig(buf, format="png", dpi=150, bbox_inches="tight", 
                       facecolor='white', edgecolor='none')
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode("utf-8")
            plt.close(fig)
            
            return f"data:image/png;base64,{img_base64}"
            
        except Exception as e:
            print(f"Chart rendering error: {e}")
            plt.close('all')
            return None
    
    def _apply_theme_colors(self, slide: Dict, theme) -> Dict:
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
    
    def _create_emergency_fallback(self, topic: str, num_slides: int) -> Dict:
        slides = [
            {
                "type": "content",
                "title": f"Slide {i+1}: {topic}",
                "content": f"Content about {topic}",
                "imagePrompt": f"{topic} professional illustration, modern style, high quality",
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
    
    async def get_available_models(self) -> List[str]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://openrouter.ai/api/v1/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10
                )
            if response.status_code == 200:
                data = response.json()
                models = data.get("data", [])
                return [model["id"] for model in models if model.get("id")]
            return []
        except Exception as e:
            print(f"Error fetching models: {e}")
            return []
    
    def get_available_themes(self) -> List[str]:
        return theme_manager.get_available_themes()
    
    def create_custom_theme(self, name: str, **kwargs) -> str:
        theme = theme_manager.create_custom_theme(name, **kwargs)
        return theme.name
    
    async def generate_image(self, prompt: str) -> str:
        result = await self._generate_hf_image(prompt)
        if not result:
            print("⚠️ Hugging Face image generation failed — using placeholder image instead.")
            return self._get_placeholder_image(0)
        return result
    
    async def generate_outline(self, content: str):
        result = await self._generate_with_comprehensive_prompt(
            content, "modern", 8, self.default_model
        )
        return {"title": result["title"], "sections": result["slides"]}
    
    async def summarize_document(self, document_content: str, filename: str, outline_only: bool = False):
        """
        Summarize document content and create clean presentation slides.
        """
        try:
            system_prompt = """You are a professional presentation creator. Your task is to convert document content into clean, well-structured presentation slides.

    STRICT OUTPUT FORMAT - Return ONLY valid JSON with this exact structure:
    {
      "slides": [
        {
          "title": "Clear Slide Title Here",
          "content": "Point 1: explanation\\nPoint 2: explanation\\nPoint 3: explanation"
        }
      ]
    }

    RULES:
    1. Create 5-8 slides from the document
    2. Each slide title must be clear and descriptive (not "Slide 1", "Section", etc.)
    3. Content should be 3-5 concise bullet points
    4. Use \\n for line breaks between points
    5. NO markdown, NO special formatting, NO code blocks
    6. Start each point with a dash or bullet
    7. Keep content focused and scannable

    Return ONLY the JSON object, nothing else."""

            user_prompt = f"""Create presentation slides from this document:

    {document_content[:6000]}

    Remember: Return ONLY valid JSON with slides array. Each slide needs title and content fields."""

            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )

            if not response or not response.strip():
                raise ValueError("Empty response from AI")

            # Clean the response
            response = response.strip()

            # Try to extract JSON from the response
            try:
                # Remove markdown code blocks if present
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0].strip()
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0].strip()

                # Parse JSON
                data = json.loads(response)
                raw_slides = data.get("slides", [])

                if not raw_slides:
                    raise ValueError("No slides in response")

            except json.JSONDecodeError as e:
                print(f"⚠️ JSON parse error: {e}")
                print(f"Response preview: {response[:500]}")
                # Fallback: create slides from raw text
                raw_slides = self._parse_fallback_format(response)

            # Clean and format slides
            slides = []
            for i, slide_data in enumerate(raw_slides[:8]):  # Limit to 8 slides
                title = slide_data.get("title", f"Slide {i+1}").strip()
                content = slide_data.get("content", "").strip()

                # Skip junk titles
                if any(bad in title.lower() for bad in ["slide:", "section:", "title:", "outline"]):
                    title = title.split(":", 1)[-1].strip()

                # Clean title
                title = self._clean_text(title)
                if not title or len(title) < 3:
                    title = f"Key Point {i+1}"

                # Clean content - handle various escape sequences
                content = self._clean_content(content)

                if len(content) < 10:
                    continue
                
                slides.append({
                    "type": "content",
                    "title": title,
                    "content": content,
                    "layout": "split"
                })

            # Ensure we have at least one slide
            if not slides:
                slides = [{
                    "type": "content",
                    "title": f"Summary of {filename}",
                    "content": self._create_basic_summary(document_content)
                }]

            return {
                "title": f"Summary of {filename}",
                "description": "Document presentation",
                "slides": slides,
                "theme": "modern"
            }

        except Exception as e:
            print(f"❌ summarize_document error: {e}")
            import traceback
            traceback.print_exc()

            # Emergency fallback
            return {
                "title": f"Summary of {filename}",
                "description": "Auto-generated summary",
                "slides": [{
                    "type": "content",
                    "title": "Document Overview",
                    "content": self._create_basic_summary(document_content)
                }],
                "theme": "modern"
            }

    def _clean_text(self, text: str) -> str:
        """Clean text from escape sequences and formatting"""
        if not text:
            return ""

        # Remove common escape sequences
        text = text.replace("\\n", " ")
        text = text.replace("\\N", " ")
        text = text.replace("\\t", " ")
        text = text.replace("\\r", " ")

        # Remove markdown
        text = text.replace("**", "")
        text = text.replace("##", "")
        text = text.replace("#", "")
        text = text.replace("*", "")

        # Remove extra whitespace
        text = " ".join(text.split())

        return text.strip()

    def _clean_content(self, content: str) -> str:
        """Clean and format slide content"""
        if not content:
            return ""

        # Replace escape sequences with actual newlines
        content = content.replace("\\n", "\n")
        content = content.replace("\\N", "\n")
        content = content.replace("\\t", " ")
        content = content.replace("\\r", "")

        # Split into lines and clean each
        lines = [line.strip() for line in content.split("\n") if line.strip()]

        # Format as bullet points
        formatted_lines = []
        for line in lines:
            # Remove existing bullets/dashes
            line = line.lstrip("•-*> ")

            if line:
                # Add bullet point
                formatted_lines.append(f"• {line}")

        return "\n".join(formatted_lines[:6])  # Max 6 points per slide

    def _parse_fallback_format(self, text: str) -> list:
        """Parse slides from non-JSON formatted text"""
        slides = []

        # Try to find slide markers
        if "SLIDE:" in text.upper():
            sections = text.upper().split("SLIDE:")
            for section in sections[1:]:  # Skip first empty part
                lines = [l.strip() for l in section.split("\n") if l.strip()]
                if lines:
                    title = lines[0]
                    content = "\n".join(lines[1:])
                    slides.append({"title": title, "content": content})
        else:
            # Split by double newlines
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            for para in paragraphs[:8]:
                lines = para.split("\n")
                title = lines[0] if lines else "Key Point"
                content = "\n".join(lines[1:]) if len(lines) > 1 else para
                slides.append({"title": title, "content": content})

        return slides[:8]

    def _create_basic_summary(self, document_content: str) -> str:
        """Create a basic summary when AI fails"""
        lines = document_content.split("\n")[:10]
        summary_lines = []

        for line in lines:
            line = line.strip()
            if line and len(line) > 20:
                summary_lines.append(f"• {line[:100]}")
                if len(summary_lines) >= 5:
                    break
                
        return "\n".join(summary_lines) if summary_lines else "Document content overview"
    async def generate_ai_text(self, prompt: str) -> str:
        """
        Simple helper for text-only AI generation.
        Used by Enhance / Rewrite / Summarize / Expand / Tone routes.
        """
        try:
            system_prompt = "You are an expert presentation assistant that helps improve and rephrase text."
            result = await self.call_openrouter_api(system_prompt=system_prompt, user_prompt=prompt)
            return result.strip()
        except Exception as e:
            print(f"❌ generate_ai_text failed: {e}")
            return f"(AI error: {e})"



# Alias for backward compatibility
PresentaionAi = AIHeavyPresentationService