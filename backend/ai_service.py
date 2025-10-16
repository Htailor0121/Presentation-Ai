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
import random

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
        self.hf_api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        self.hf_api_url = "https://api-inference.huggingface.co/models/"
        
        # Free image generation models on Hugging Face
        self.hf_image_models = [
            "stabilityai/stable-diffusion-2-1",
            "stabilityai/stable-diffusion-xl-base-1.0",
            "runwayml/stable-diffusion-v1-5",
            "prompthero/openjourney-v4",
            "Lykon/dreamshaper-8",
            "SG161222/Realistic_Vision_V5.1_noVAE",
        ]
        
        self.current_hf_model = os.getenv("HF_IMAGE_MODEL", self.hf_image_models[0])
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

        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)

        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")

        try:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print("⚠️ OpenRouter raw response:", response.text[:1000])
            raise Exception(f"Failed to parse OpenRouter response as JSON: {e}")
    
    def _calculate_dynamic_height(self, slide: Dict) -> int:
        """Calculate dynamic height based on slide content"""
        base_height = 800
        content = slide.get("content", "")
        title = slide.get("title", "")
        has_chart = slide.get("chartData", {}).get("needed", False)
        
        # Count bullet points
        bullet_count = content.count("•") + content.count("\n")
        
        # Calculate text length
        text_length = len(content) + len(title)
        
        # Dynamic height calculation
        height = base_height
        
        # Add height for bullet points (each bullet ~40px)
        height += bullet_count * 40
        
        # Add height for long text (every 200 chars = +50px)
        height += (text_length // 200) * 50
        
        # Add extra height if chart present
        if has_chart:
            height += 300
        
        # Clamp between 800 and 1400
        height = max(800, min(1400, height))
        
        return height
    
    async def generate_presentation(
        self,
        topic: str,
        model: str = None,
        theme_name: str = "modern",
        include_interactive: bool = True,
        num_slides: int = 8
    ) -> Dict[str, Any]:
        """Generate complete presentation with AI-generated images and charts"""
        
        print(f"🎨 Generating presentation with AI-heavy approach...")
        print(f"🖼️  Using Hugging Face model: {self.current_hf_model}")
        
        # Step 1: Generate presentation structure with chart data
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
        
        # Step 3: Apply theme, calculate dynamic height, add interactive features
        theme = theme_manager.get_theme(theme_name)
        final_slides = []
        
        for i, slide in enumerate(enhanced_slides):
            slide = self._apply_theme_colors(slide, theme)
            
            # ✅ Calculate dynamic height
            slide["height"] = self._calculate_dynamic_height(slide)
            
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
            """Generate professional presentation with charts and proper slide separation"""
    
            num_slides = max(8, min(15, num_slides))
    
            prompt = f"""You are creating a professional presentation with EXACTLY {num_slides} slides.
    
        CRITICAL RULES:
        1. Create {num_slides} SEPARATE slide objects
        2. Each slide must be a distinct JSON object
        3. Include CHARTS/GRAPHS in appropriate slides
        4. Each slide should have 3-5 bullet points maximum
    
        TOPIC: {topic}
    
        Return ONLY this JSON structure (no markdown, no extra text):
    
        {{
          "title": "Presentation Title",
          "description": "Brief description",
          "slides": [
            {{
              "type": "title",
              "title": "Main Title Here",
              "content": "Subtitle or tagline",
              "imagePrompt": "professional title background",
              "layout": "center",
              "chartData": {{"needed": false}}
            }},
            {{
              "type": "stats",
              "title": "Key Statistics",
              "content": "📊 Metric 1: 85%\\n📈 Metric 2: 1000+\\n⚡ Metric 3: <2s",
              "imagePrompt": "statistics dashboard",
              "layout": "stats-grid",
              "chartData": {{
                "needed": true,
                "type": "bar",
                "title": "Performance Metrics",
                "labels": ["Metric 1", "Metric 2", "Metric 3"],
                "values": [85, 92, 78]
              }}
            }},
            {{
              "type": "content",
              "title": "Slide Title",
              "content": "• Point 1\\n• Point 2\\n• Point 3",
              "imagePrompt": "relevant image",
              "layout": "split",
              "chartData": {{"needed": false}}
            }}
          ]
        }}
    
        SLIDE TYPE DISTRIBUTION:
        - Slide 1: type "title", layout "center", NO chart
        - Slides 2-3: type "stats" with BAR or PIE charts
        - Slides 4-{num_slides-2}: type "content" with optional LINE charts
        - Slide {num_slides}: type "conclusion", layout "center", NO chart
    
        CHART GUIDELINES:
        - Include charts in 30-40% of slides
        - Stats slides MUST have charts
        - Use realistic data values
        - Chart types: bar, pie, line, scatter
    
        IMPORTANT: Return EXACTLY {num_slides} slide objects with appropriate charts."""
    
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
                                    "content": f"You are a presentation expert. Create EXACTLY {num_slides} slides with charts where appropriate. Include chartData with realistic values."
                                },
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ],
                            "temperature": 0.7,
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
                    data = json.loads(json_match.group())
                    slides = data.get("slides", [])
    
                    # Validate and add charts if missing
                    slides = self._ensure_charts_in_slides(slides, topic)
    
                    if len(slides) < num_slides:
                        print(f"⚠️ Only {len(slides)} slides generated, adding more...")
                        while len(slides) < num_slides:
                            slides.append(self._create_content_slide_with_chart(topic, len(slides)))
                    elif len(slides) > num_slides:
                        slides = slides[:num_slides]
    
                    data["slides"] = slides
                    print(f"✅ Generated {len(slides)} slides with charts")
                    return data
                else:
                    raise Exception("No valid JSON in response")
    
            except Exception as e:
                print(f"❌ Error in comprehensive prompt: {e}")
                return self._create_professional_fallback(topic, num_slides)
    
    def _ensure_charts_in_slides(self, slides: List[Dict], topic: str) -> List[Dict]:
        """Ensure appropriate slides have chart data"""
        chart_types = ["bar", "pie", "line", "scatter"]
        
        for i, slide in enumerate(slides):
            slide_type = slide.get("type", "content")
            
            # Force charts in stats slides
            if slide_type == "stats":
                if not slide.get("chartData", {}).get("needed"):
                    slide["chartData"] = self._generate_chart_data(slide, "bar", topic)
            
            # Add charts to 30% of content slides
            elif slide_type == "content" and i % 3 == 0:
                if not slide.get("chartData", {}).get("needed"):
                    chart_type = random.choice(chart_types)
                    slide["chartData"] = self._generate_chart_data(slide, chart_type, topic)
        
        return slides
    
    def _generate_chart_data(self, slide: Dict, chart_type: str, topic: str) -> Dict:
        """Generate realistic chart data for a slide"""
        title = slide.get("title", topic)
        
        # Generate realistic labels and values
        if chart_type == "bar":
            labels = ["Q1", "Q2", "Q3", "Q4"]
            values = [random.randint(60, 95) for _ in range(4)]
        elif chart_type == "pie":
            labels = ["Category A", "Category B", "Category C", "Category D"]
            values = [random.randint(15, 40) for _ in range(4)]
        elif chart_type == "line":
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
            values = [random.randint(50, 100) for _ in range(6)]
        else:  # scatter
            labels = ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
            values = [random.randint(40, 90) for _ in range(5)]
        
        return {
            "needed": True,
            "type": chart_type,
            "title": f"{title} - Analysis",
            "labels": labels,
            "values": values,
            "description": f"Data visualization for {title}"
        }
    
    def _create_content_slide_with_chart(self, topic: str, index: int) -> Dict:
        """Create content slide with chart"""
        has_chart = index % 2 == 0  # Every alternate slide has chart
        
        slide = {
            "type": "content",
            "title": f"Key Point {index}: {topic}",
            "content": f"• Important insight about {topic}\n• Supporting detail\n• Additional context\n• Key takeaway",
            "imagePrompt": f"{topic} professional illustration, section {index}",
            "layout": "split"
        }
        
        if has_chart:
            slide["chartData"] = self._generate_chart_data(slide, random.choice(["bar", "line", "pie"]), topic)
        else:
            slide["chartData"] = {"needed": False}
        
        return slide
    
    def _create_professional_fallback(self, topic: str, num_slides: int, outline_sections: List[Dict] = None) -> Dict:
        """Create professional fallback with charts using outline sections if available"""
        num_slides = max(8, min(15, num_slides))

        slides = []

        # Extract titles from outline if provided
        section_titles = []
        if outline_sections:
            section_titles = [section.get("title", f"Section {i+1}") 
                             for i, section in enumerate(outline_sections)]

        # Title slide
        slides.append({
            "type": "title",
            "title": section_titles[0] if section_titles else topic.title(),
            "content": f"A comprehensive professional presentation",
            "imagePrompt": f"{topic} title background, modern, professional, corporate",
            "layout": "center",
            "chartData": {"needed": False}
        })

        # Stats slide with BAR chart
        slides.append({
            "type": "stats",
            "title": section_titles[1] if len(section_titles) > 1 else f"Key Metrics - {topic}",
            "content": "📊 Performance: 85%\nSuccess rate achieved\n\n📈 Growth: 120%\nYear over year\n\n⚡ Speed: <2s\nProcessing time",
            "imagePrompt": f"{topic} statistics, data visualization, professional",
            "layout": "stats-grid",
            "chartData": {
                "needed": True,
                "type": "bar",
                "title": "Performance Metrics",
                "labels": ["Performance", "Growth", "Speed", "Quality"],
                "values": [85, 92, 78, 88]
            }
        })

        # Comparison slide with PIE chart
        if num_slides >= 5:
            slides.append({
                "type": "comparison",
                "title": section_titles[2] if len(section_titles) > 2 else f"Market Analysis - {topic}",
                "content": "✅ SEGMENT A: 45%\n• Leading market share\n• Strong growth\n\n✅ SEGMENT B: 30%\n• Emerging sector\n\n✅ SEGMENT C: 25%\n• Stable revenue",
                "imagePrompt": f"{topic} market analysis, professional",
                "layout": "two-column",
                "chartData": {
                    "needed": True,
                    "type": "pie",
                    "title": "Market Distribution",
                    "labels": ["Segment A", "Segment B", "Segment C"],
                    "values": [45, 30, 25]
                }
            })

        # Timeline with LINE chart
        if num_slides >= 6:
            slides.append({
                "type": "timeline",
                "title": section_titles[3] if len(section_titles) > 3 else f"Growth Trajectory - {topic}",
                "content": "📈 PHASE 1: Foundation\nInitial setup and planning\n\n📈 PHASE 2: Growth\nRapid expansion phase\n\n📈 PHASE 3: Maturity\nOptimization and scale",
                "imagePrompt": f"{topic} timeline, growth chart, professional",
                "layout": "split",
                "chartData": {
                    "needed": True,
                    "type": "line",
                    "title": "Growth Over Time",
                    "labels": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
                    "values": [45, 58, 72, 85, 91, 98]
                }
            })

        # Content slides with occasional charts - use outline titles
        remaining = num_slides - len(slides) - 1
        for i in range(remaining):
            section_index = len(slides)
            has_chart = i % 2 == 0

            # Use outline title if available
            title = (section_titles[section_index] if len(section_titles) > section_index 
                    else f"Key Insight {i + 1}: {topic}")

            slide = {
                "type": "content",
                "title": title,
                "content": f"💡 Important findings about {topic}\n\n• Critical detail point\n• Supporting evidence\n• Additional context\n• Key takeaway",
                "imagePrompt": f"{topic} professional illustration, insight {i + 1}",
                "layout": "split"
            }

            if has_chart:
                slide["chartData"] = {
                    "needed": True,
                    "type": random.choice(["bar", "line"]),
                    "title": f"Analysis {i + 1}",
                    "labels": ["A", "B", "C", "D"],
                    "values": [random.randint(60, 95) for _ in range(4)]
                }
            else:
                slide["chartData"] = {"needed": False}

            slides.append(slide)

        # Conclusion slide
        slides.append({
        "type": "conclusion",
        "title": section_titles[-1] if section_titles else "Key Takeaways",
        "content": f"🎯 Summary of {topic}\n\n✅ Major insight 1\n✅ Major insight 2\n✅ Major insight 3\n\n💼 Thank you!",
        "imagePrompt": f"{topic} conclusion, success, professional",
        "layout": "center",
        "chartData": {"needed": False}
    })

        return {
            "title": topic.title(),
            "description": f"Professional presentation about {topic}",
            "slides": slides
        }

    
    async def _add_media_assets(self, slides: List[Dict]) -> List[Dict]:
        """Generate AI images and charts - NO PLACEHOLDERS, only Pollinations fallback"""
        enhanced = []
    
        for i, slide in enumerate(slides):
            print(f"  Processing slide {i+1}/{len(slides)}: {slide.get('title')}")
    
            chart_data = slide.get("chartData", {})
            has_chart = chart_data.get("needed", False)
    
            # Generate image ONLY if slide does NOT have a chart
            if not has_chart:
                height = self._calculate_dynamic_height(slide)
                image_prompt = slide.get("imagePrompt", slide.get('title', 'professional presentation'))
                
                # ✅ Try HuggingFace first, fallback to Pollinations (NO PLACEHOLDER)
                try:
                    print(f"    🎨 Trying Hugging Face...")
                    image_url = await self._generate_hf_image(image_prompt, height)
                    
                    if image_url:
                        slide["imageUrl"] = image_url
                        print(f"    ✅ Image: Hugging Face")
                    else:
                        # ✅ Pollinations fallback
                        print(f"    📄 HF unavailable → Using Pollinations.ai")
                        image_url = await self._generate_pollinations_image(image_prompt, height)
                        slide["imageUrl"] = image_url
                        print(f"    ✅ Image: Pollinations.ai")
                        
                except Exception as e:
                    # ✅ On any error, use Pollinations
                    print(f"    ⚠️ Error: {str(e)[:80]} → Using Pollinations.ai")
                    image_url = await self._generate_pollinations_image(image_prompt, height)
                    slide["imageUrl"] = image_url
                    print(f"    ✅ Image: Pollinations.ai (error fallback)")
            else:
                print(f"    📊 Slide has chart - skipping image")
    
            # Generate chart if needed
            if has_chart:
                chart_prompt = slide.get("chartPrompt", "")
                if chart_prompt:
                    try:
                        generated_chart_data = await self._generate_chart_from_prompt(chart_prompt, slide)
                        if generated_chart_data and generated_chart_data.get("labels") and generated_chart_data.get("values"):
                            chart_url = self._render_chart(generated_chart_data)
                            if chart_url:
                                slide["chartUrl"] = chart_url
                                slide["chartData"] = generated_chart_data
                                print(f" 📊 Chart: {generated_chart_data.get('type', 'bar')}")
                        else:
                            raise ValueError("Invalid chart data")
                    except Exception as e:
                        print(f"    ⚠️ Chart generation failed: {e}")
                        fallback_chart_data = self._generate_fallback_chart_data(slide)
                        chart_url = self._render_chart(fallback_chart_data)
                        if chart_url:
                            slide["chartUrl"] = chart_url
                            slide["chartData"] = fallback_chart_data
                            print(f"    📊 Chart: fallback")
                else:
                    fallback_chart_data = self._generate_fallback_chart_data(slide)
                    chart_url = self._render_chart(fallback_chart_data)
                    if chart_url:
                        slide["chartUrl"] = chart_url
                        slide["chartData"] = fallback_chart_data
                        print(f"    📊 Chart: auto-generated")
    
            enhanced.append(slide)
    
        return enhanced
    def _generate_fallback_chart_data(self, slide: Dict) -> Dict:
        """Generate fallback chart data when chart generation fails"""
        title = slide.get("title", "Data Overview")
        slide_type = slide.get("type", "content")
        
        # Generate appropriate fallback based on slide type
        if slide_type == "stats":
            return {
                "needed": True,
                "type": "bar",
                "title": f"{title} - Metrics",
                "labels": ["Metric 1", "Metric 2", "Metric 3", "Metric 4"],
                "values": [75, 82, 68, 91],
                "description": "Performance metrics overview"
            }
        elif slide_type == "timeline":
            return {
                "needed": True,
                "type": "line",
                "title": f"{title} - Timeline",
                "labels": ["Q1", "Q2", "Q3", "Q4"],
                "values": [45, 62, 78, 89],
                "description": "Progress over time"
            }
        elif slide_type == "comparison":
            return {
                "needed": True,
                "type": "pie",
                "title": f"{title} - Distribution",
                "labels": ["Category A", "Category B", "Category C"],
                "values": [40, 35, 25],
                "description": "Category distribution"
            }
        else:
            # Default content slide chart
            return {
                "needed": True,
                "type": "bar",
                "title": f"{title} - Analysis",
                "labels": ["Point A", "Point B", "Point C", "Point D"],
                "values": [random.randint(60, 95) for _ in range(4)],
                "description": f"Data analysis for {title}"
            }
    
    async def _generate_chart_from_prompt(self, chart_prompt: str, slide: Dict) -> Dict:
        """Generate chart data from AI prompt with fallback"""
        try:
            system_prompt = """You are a data visualization expert. Generate chart data based on the prompt.
    
    RETURN ONLY this JSON structure:
    {
      "type": "bar",
      "title": "Chart Title",
      "labels": ["Label1", "Label2", "Label3"],
      "values": [10, 20, 30],
      "description": "Brief description"
    }
    
    Chart types: bar, pie, line, scatter
    Values must be realistic numbers (0-100 range preferred)
    NO markdown, ONLY JSON"""
    
            user_prompt = f"""Create chart data for: {chart_prompt}
    
    Slide context: {slide.get('title', '')}
    {slide.get('content', '')[:200]}
    
    Generate appropriate chart with realistic data."""
    
            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )
    
            # Clean and parse
            response = response.strip()
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
    
            data = json.loads(response)
            
            # Validate required fields
            if not data.get("labels") or not data.get("values"):
                raise ValueError("Missing labels or values")
            
            if len(data["labels"]) != len(data["values"]):
                raise ValueError("Labels and values length mismatch")
            
            data["needed"] = True
            return data
    
        except Exception as e:
            print(f"    ⚠️ Chart AI generation failed: {e}, using fallback")
            return None
    
    async def _generate_hf_image(self, prompt: str, height: int = 800):
        """Try Hugging Face - returns None if fails (triggers Pollinations fallback)"""
        headers = {}
        if self.hf_api_key:
            headers["Authorization"] = f"Bearer {self.hf_api_key}"
    
    # Try main model
        result = await self._try_hf_model(self.current_hf_model, prompt, headers)
        if result:
            return result
    
    # Try alternatives
        for model in self.hf_image_models[:2]:  # Only try 2 alternatives
            if model != self.current_hf_model:
                result = await self._try_hf_model(model, prompt, headers)
                if result:
                    return result
    
        return None
    
    async def _try_hf_model(self, model: str, prompt: str, headers: dict):
        """Try single HF model with short timeout"""
        try:
            url = f"{self.hf_api_url}{model}"
        
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": prompt},
                    timeout=15  # ✅ Quick timeout
                )
        
            if response.status_code == 200:
                image_bytes = response.content
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                return f"data:image/png;base64,{image_base64}"
        
            return None
            
        except:
            return None
    
    async def _generate_pollinations_image(self, prompt: str, height: int = 800) -> str:
        """
        ✅ ALWAYS WORKS - Pollinations.ai image generation
        This is the reliable fallback that never fails
        """
        try:
            # Clean and enhance prompt
            clean_prompt = prompt.strip()
            if len(clean_prompt) < 10:
                clean_prompt = f"{clean_prompt} professional illustration"

            # Add quality keywords
            enhanced_prompt = f"{clean_prompt}, high quality, professional, detailed"
            encoded_prompt = urllib.parse.quote(enhanced_prompt)

            # ✅ Pollinations.ai with best parameters
            image_url = (
                f"{self.pollinations_url}{encoded_prompt}"
                f"?width=1200&height={height}&nologo=true&enhance=true&model=flux"
            )

            return image_url

        except Exception as e:
            # ✅ Even if encoding fails, return basic URL
            print(f"    ⚠️ Pollinations encoding error: {e}")
            safe_prompt = urllib.parse.quote("professional presentation background")
            return f"{self.pollinations_url}{safe_prompt}?width=1200&height={height}&nologo=true"

    
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
    
    async def generate_image(self, prompt: str, height: int = 800) -> str:
        """
        🎨 Standalone image generation - NEVER returns placeholder
        Always tries HF first, then Pollinations
        """
    
    # Try HuggingFace
        try:
            result = await self._generate_hf_image(prompt, height)
            if result:
                print("✅ Image source: Hugging Face")
                return result
        except Exception as e:
            print(f"⚠️ HF failed: {str(e)[:80]}")
    
    # ✅ ALWAYS use Pollinations fallback
        print("📄 Using Pollinations.ai fallback...")
        result = await self._generate_pollinations_image(prompt, height)
        print("✅ Image source: Pollinations.ai")
        return result
    
    async def generate_outline(self, content: str):
        """Generate 8-15 section outline from content"""
        try:
            system_prompt = """You are a professional presentation outline creator.

    YOUR TASK: Create a structured outline with EXACTLY 8-15 sections.

    STRICT RULES:
    1. Generate minimum 8 sections, maximum 15 sections
    2. Each section should be logical and flow well
    3. Return ONLY valid JSON in this format:

    {
      "title": "Presentation Title",
      "sections": [
        {
          "title": "Section Title",
          "content": "Brief description of what this section covers"
        }
      ]
    }

    IMPORTANT:
    - NO markdown formatting
    - NO code blocks
    - Return ONLY the JSON object
    - Ensure 8-15 sections always"""

            user_prompt = f"""Create a comprehensive presentation outline with 8-15 sections for this topic:

    {content[:4000]}

    Remember: 
    - Minimum 8 sections
    - Maximum 15 sections
    - Each section should have clear title and brief content description"""

            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )

            # Clean response
            response = response.strip()
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()

            # Parse JSON
            data = json.loads(response)
            sections = data.get("sections", [])

            # Validate section count (8-15)
            if len(sections) < 8:
                print(f"⚠️ AI generated only {len(sections)} sections, padding to 8...")
                while len(sections) < 8:
                    sections.append({
                        "title": f"Additional Point {len(sections) + 1}",
                        "content": f"Supporting information for {content[:50]}"
                    })
            elif len(sections) > 15:
                print(f"⚠️ AI generated {len(sections)} sections, trimming to 15...")
                sections = sections[:15]

            print(f"✅ Generated {len(sections)} outline sections")

            return {
                "title": data.get("title", "Presentation Outline"),
                "sections": sections
            }

        except Exception as e:
            print(f"❌ Error in generate_outline: {e}")
            return {
                "title": "Presentation Outline",
                "sections": [
                    {"title": f"Section {i+1}", "content": f"Content for section {i+1}"}
                    for i in range(8)
                ]
            }
    
    async def summarize_document(self, document_content: str, filename: str, outline_only: bool = False):
        """Summarize document content and create 8-15 section outline or full slides with charts"""
        try:
            if outline_only:
                system_prompt = """You are a professional presentation outline creator.
    
    YOUR TASK: Create a structured outline with EXACTLY 8-15 sections from the document.
    
    STRICT RULES:
    1. Generate minimum 8 sections, maximum 15 sections
    2. Extract key points from the document
    3. Each section should cover a distinct topic
    4. Return ONLY valid JSON:
    
    {
      "sections": [
        {
          "title": "Clear Section Title",
          "content": "Brief 2-3 sentence description"
        }
      ]
    }
    
    NO markdown, NO code blocks, ONLY JSON."""
    
                user_prompt = f"""Create a presentation outline with 8-15 sections from this document:
    
    {document_content[:6000]}
    
    Extract the main topics and create logical sections.
    Minimum 8 sections, maximum 15 sections."""
    
            else:
                system_prompt = """You are a professional presentation creator.
    
    Create presentation slides from document content with CHARTS where appropriate.
    
    RETURN ONLY this JSON structure:
    {
      "slides": [
        {
          "title": "Slide Title",
          "content": "• Point 1\\n• Point 2\\n• Point 3",
          "chartData": {
            "needed": true,
            "type": "bar",
            "title": "Chart Title",
            "labels": ["A", "B", "C"],
            "values": [10, 20, 30]
          }
        }
      ]
    }
    
    RULES:
    - Create 8-15 slides
    - Use bullet points (•)
    - Include charts in 30-40% of slides
    - Chart types: bar, pie, line
    - NO markdown, ONLY JSON"""
    
                user_prompt = f"""Create 8-15 presentation slides with charts from this document:
    
    {document_content[:6000]}
    
    Include charts for data-heavy slides. Each slide should have clear title and 3-5 bullet points."""
    
            # Call AI
            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )
    
            # Clean response
            response = response.strip()
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
    
            # Parse JSON
            data = json.loads(response)
    
            if outline_only:
                sections = data.get("sections", [])
                
                if len(sections) < 8:
                    print(f"⚠️ Only {len(sections)} sections, padding to 8...")
                    while len(sections) < 8:
                        sections.append({
                            "title": f"Additional Section {len(sections) + 1}",
                            "content": f"Supporting content from {filename}"
                        })
                elif len(sections) > 15:
                    print(f"⚠️ Too many sections ({len(sections)}), trimming to 15...")
                    sections = sections[:15]
    
                print(f"✅ Generated {len(sections)} outline sections")
    
                return {
                    "title": f"Outline: {filename}",
                    "description": "Document outline",
                    "sections": sections
                }
    
            else:
                raw_slides = data.get("slides", [])
                
                if len(raw_slides) < 8:
                    while len(raw_slides) < 8:
                        raw_slides.append({
                            "title": f"Slide {len(raw_slides) + 1}",
                            "content": f"Additional content from {filename}",
                            "chartData": {"needed": False}
                        })
                elif len(raw_slides) > 15:
                    raw_slides = raw_slides[:15]
    
                # Clean slides and ensure charts
                slides = []
                for i, slide_data in enumerate(raw_slides):
                    title = self._clean_text(slide_data.get("title", f"Slide {i+1}"))
                    content = self._clean_content(slide_data.get("content", ""))
                    
                    # Get or generate chart data
                    chart_data = slide_data.get("chartData", {"needed": False})
                    if not chart_data.get("needed") and i % 3 == 0:  # Add chart every 3rd slide
                        chart_data = self._generate_chart_data(slide_data, "bar", filename)
    
                    slide = {
                        "type": "content",
                        "title": title,
                        "content": content,
                        "layout": "split",
                        "chartData": chart_data
                    }
                    
                    slides.append(slide)
    
                print(f"✅ Generated {len(slides)} slides with charts")
    
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
    
            if outline_only:
                return {
                    "title": f"Outline: {filename}",
                    "sections": [
                        {"title": f"Section {i+1}", "content": "Content overview"}
                        for i in range(8)
                    ]
                }
            else:
                return {
                    "title": f"Summary of {filename}",
                    "slides": [
                        {
                            "title": f"Slide {i+1}", 
                            "content": "Content", 
                            "type": "content", 
                            "layout": "split",
                            "chartData": {"needed": False}
                        }
                        for i in range(8)
                    ]
                }
    
    def _clean_text(self, text: str) -> str:
        """Clean text from escape sequences and formatting"""
        if not text:
            return ""
        text = text.replace("\\n", " ")
        text = text.replace("\\N", " ")
        text = text.replace("\\t", " ")
        text = text.replace("\\r", " ")
        text = text.replace("**", "")
        text = text.replace("##", "")
        text = text.replace("#", "")
        text = text.replace("*", "")
        text = " ".join(text.split())
        return text.strip()

    def _clean_content(self, content: str) -> str:
        """Clean and format slide content"""
        if not content:
            return ""
        content = content.replace("\\n", "\n")
        content = content.replace("\\N", "\n")
        content = content.replace("\\t", " ")
        content = content.replace("\\r", "")
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        formatted_lines = []
        for line in lines:
            line = line.lstrip("•-*> ")
            if line:
                formatted_lines.append(f"• {line}")
        return "\n".join(formatted_lines[:6])

    async def generate_ai_text(self, prompt: str) -> str:
        """Simple helper for text-only AI generation"""
        try:
            system_prompt = "You are an expert presentation assistant that helps improve and rephrase text."
            result = await self.call_openrouter_api(system_prompt=system_prompt, user_prompt=prompt)
            return result.strip()
        except Exception as e:
            print(f"❌ generate_ai_text failed: {e}")
            return f"(AI error: {e})"


# Alias for backward compatibility
PresentaionAi = AIHeavyPresentationService