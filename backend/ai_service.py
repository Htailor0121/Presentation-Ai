import os
import json
import httpx
import re
from typing import Dict, Any, List, Optional
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
    Gamma-level AI presentation service with advanced content intelligence
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.default_model = os.getenv("DEFAULT_AI_MODEL", "mistralai/mistral-7b-instruct:free")
        
        # Hugging Face Inference API
        self.hf_api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        self.hf_api_url = "https://api-inference.huggingface.co/models/"
        
        # Free image generation models
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
            "temperature": 0.7,
            "max_tokens": 8000
        }

        async with httpx.AsyncClient(timeout=120) as client:
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
        
        bullet_count = content.count("•") + content.count("\n")
        text_length = len(content) + len(title)
        
        height = base_height
        height += bullet_count * 40
        height += (text_length // 200) * 50
        
        if has_chart:
            height += 300
        
        return max(800, min(1400, height))
    
    async def generate_presentation(
        self,
        topic: str,
        model: str = None,
        theme_name: str = "modern",
        include_interactive: bool = True,
        num_slides: int = 8,
        audience: str = "business professionals",
        purpose: str = "inform",
        outline_sections: List[Dict] = None,
        text_level: str = "concise",
        image_style: str = "professional"
    ) -> Dict[str, Any]:
        """Generate complete presentation with Gamma-level intelligence"""
        
        print(f"🎨 Generating Gamma-level presentation...")
        print(f"📊 Topic: {topic}")
        print(f"👥 Audience: {audience}")
        print(f"🎯 Purpose: {purpose}")


        if outline_sections and len(outline_sections) > 0:
            print(f"📝 Using provided outline with {len(outline_sections)} sections")
            presentation_data = await self._generate_from_outline_sections(
                outline_sections=outline_sections,
                theme=theme_name,
                model=model or self.default_model,
                audience=audience,
                purpose=purpose,
                text_level=text_level,
                image_style=image_style
            )
        else:
            # Original flow for prompt-based generation
            presentation_data = await self._generate_with_gamma_intelligence(
                topic=topic,
                theme=theme_name,
                num_slides=num_slides,
                model=model or self.default_model,
                audience=audience,
                purpose=purpose
            )
        
        # Step 1: Analyze topic and generate presentation structure
        presentation_data = await self._generate_with_gamma_intelligence(
            topic=topic,
            theme=theme_name,
            num_slides=num_slides,
            model=model or self.default_model,
            audience=audience,
            purpose=purpose
        )
        
        # Step 2: Generate AI images and charts
        enhanced_slides = await self._add_media_assets(
            presentation_data.get("slides", [])
        )
        
        # Step 3: Apply theme, calculate height, add interactivity
        theme = theme_manager.get_theme(theme_name)
        final_slides = []
        
        for i, slide in enumerate(enhanced_slides):
            slide = self._apply_theme_colors(slide, theme)
            slide["height"] = self._calculate_dynamic_height(slide)
            
            if include_interactive:
                slide = interactive_manager.enhance_slide_with_interactivity(slide)
            
            slide["id"] = slide.get("id") or f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}"
            final_slides.append(slide)
        
        return {
            "title": presentation_data.get("title", topic.title()),
            "description": presentation_data.get("description", f"Professional presentation about {topic}"),
            "theme": theme.name,
            "themeData": self._get_theme_data(theme),
            "slides": final_slides,
            "metadata": {
                "totalSlides": len(final_slides),
                "hasInteractiveFeatures": include_interactive,
                "hasCharts": any("chartUrl" in s for s in final_slides),
                "hasImages": all("imageUrl" in s for s in final_slides),
                "generatedAt": datetime.now().isoformat(),
                "audience": audience,
                "purpose": purpose
            }
        }
    async def _generate_from_outline_sections(
        self,
        outline_sections: List[Dict],
        theme: str,
        model: str,
        audience: str,
        purpose: str,
        text_level: str,
        image_style: str
    ) -> Dict[str, Any]:
        """Generate slides from outline sections - one slide per section"""

        num_slides = len(outline_sections)

        # Map text level to bullet count
        bullet_counts = {
            "minimal": "2-3",
            "concise": "3-4",
            "detailed": "4-6",
            "extensive": "5-7"
        }
        bullet_guide = bullet_counts.get(text_level, "3-5")

        system_prompt = f"""You are an expert presentation designer creating slides for {audience}.

    YOUR TASK: Create EXACTLY {num_slides} SEPARATE slides from the provided outline.

    CRITICAL: Each section from the outline becomes ONE individual slide.
    DO NOT combine multiple sections into one slide.
    DO NOT create additional slides.

    Style preferences:
    - Text level: {text_level} ({bullet_guide} bullets per slide)
    - Image style: {image_style}
    - Purpose: {purpose}"""

        # Build the prompt with section-by-section instructions
        sections_text = "\n\n".join([
            f"SECTION {i+1}:\nTitle: {sec['title']}\nContent: {sec['content']}"
            for i, sec in enumerate(outline_sections)
        ])

        user_prompt = f"""Create {num_slides} slides from these outline sections.
    Each section becomes ONE slide:

    {sections_text}

    Return ONLY this JSON structure:

    {{
      "title": "Presentation Title",
      "description": "Brief description",
      "slides": [
        {{
          "type": "content",
          "title": "Exact title from outline section",
          "content": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
          "imagePrompt": "{image_style} style image for this specific topic",
          "layout": "split",
          "chartData": {{"needed": false}}
        }}
      ]
    }}

    RULES:
    - Create EXACTLY {num_slides} slides
    - Each slide uses its section's title
    - {bullet_guide} bullet points per slide
    - Make content specific to that section only
    - Image prompts should match {image_style} style
    - Include charts where data would help (use chartData.needed: true)

    Generate the {num_slides} slides now."""

        try:
            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model
            )

            # Parse and validate
            content = response.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                slides = data.get("slides", [])

                # ✅ Ensure we have exactly the right number of slides
                if len(slides) < num_slides:
                    print(f"⚠️ Only {len(slides)} slides, adding more...")
                    for i in range(len(slides), num_slides):
                        section = outline_sections[i]
                        slides.append({
                            "type": "content",
                            "title": section['title'],
                            "content": section.get('content', '')[:500] or f"• Key point 1\n• Key point 2\n• Key point 3",
                            "imagePrompt": f"{section['title']}, {image_style} style",
                            "layout": "split",
                            "chartData": {"needed": False}
                        })
                elif len(slides) > num_slides:
                    slides = slides[:num_slides]

                data["slides"] = slides
                print(f"✅ Generated {len(slides)} slides from outline")
                return data
            else:
                raise Exception("No valid JSON found")

        except Exception as e:
            print(f"❌ Error generating from outline: {e}")
            # Fallback: use outline sections directly
            return self._create_fallback_from_outline(outline_sections, theme, image_style)

    def _create_fallback_from_outline(
        self, 
        outline_sections: List[Dict], 
        theme: str,
        image_style: str
    ) -> Dict:
        """Create slides directly from outline sections"""
        slides = []

        for i, section in enumerate(outline_sections):
            slide = {
                "type": "content",
                "title": section.get('title', f'Slide {i+1}'),
                "content": section.get('content', '')[:500] or f"• Key insight\n• Supporting detail\n• Takeaway",
                "imagePrompt": f"{section.get('title', 'presentation')}, {image_style} style, professional",
                "layout": "split",
                "chartData": {"needed": False}
            }
            slides.append(slide)

        return {
            "title": "Presentation",
            "description": "Generated from outline",
            "slides": slides
        }
    async def _generate_with_gamma_intelligence(
        self,
        topic: str,
        theme: str,
        num_slides: int,
        model: str,
        audience: str,
        purpose: str
    ) -> Dict[str, Any]:
        """🎯 GAMMA-LEVEL: Generate presentation with deep content intelligence"""
        
        num_slides = max(8, min(15, num_slides))
        
        # Map purpose to presentation strategy
        strategy_map = {
            "inform": "educate the audience with clear, factual information",
            "persuade": "convince the audience to take action or change perspective",
            "inspire": "motivate and energize the audience",
            "educate": "teach the audience new skills or concepts",
            "sell": "demonstrate value and drive purchasing decisions"
        }
        
        strategy = strategy_map.get(purpose.lower(), "inform and engage the audience")
        
        system_prompt = f"""You are an expert presentation designer with 15+ years creating compelling presentations for Fortune 500 companies, TEDx talks, and startup pitches.

CORE EXPERTISE:
- Storytelling and narrative structure
- Data visualization and analytics
- Business communication principles
- Cognitive psychology and persuasion
- Design thinking and UX
- Industry trends and benchmarks

YOUR MISSION: Create a presentation that doesn't just inform, but PERSUADES and INSPIRES.
Each slide must serve the story and build toward a clear conclusion."""

        user_prompt = f"""Create a professional presentation with EXACTLY {num_slides} slides.

=== TOPIC ANALYSIS ===
Topic: {topic}
Target Audience: {audience}
Purpose: {strategy}

BEFORE CREATING SLIDES, ANALYZE:
1. What's the current state/context of this topic?
2. What does {audience} care about? What are their pain points?
3. What should they think/feel/do after this presentation?
4. What's the most compelling narrative to deliver this message?

=== CONTENT STRATEGY ({num_slides} slides) ===

OPENING (Slides 1-2):
- Slide 1: Powerful title that promises value + compelling subtitle
  Layout: "center", NO chart
  
- Slide 2: Hook with surprising insight, statistic, or provocative question
  Type: "hook"
  Layout: "split"
  Include CHART showing problem/opportunity scale
  Chart should have realistic data supporting the hook

CONTEXT (Slides 3-4):
- Why this matters NOW
- Current challenges/landscape
- Stakeholder impact
Include relevant data visualization

CORE CONTENT (Slides 5-{num_slides-2}):
- One clear concept per slide
- Build logically on previous slides
- Action-oriented headlines (NOT generic)
- Support claims with evidence
- 30-40% should have charts with contextual data

CLOSING (Last 2 slides):
- Synthesize key insights
- Clear call-to-action
- Memorable takeaway

=== SLIDE QUALITY RULES ===

HEADLINES:
✅ "How We Increased Revenue 40% in 90 Days"
✅ "3 Critical Mistakes Costing You $50K/Year"
❌ "Overview"
❌ "Introduction"
❌ "Background"

CONTENT:
- 3-5 bullet points MAX
- One clear point per bullet
- Simple, powerful language (8th grade level)
- Each slide answers "So what?"

CHART INTELLIGENCE:
When chartData.needed = true:
- Generate data that SUPPORTS the specific claim
- Use realistic industry values
- Choose type by data relationship:
  * bar: Comparing categories
  * line: Trends over time
  * pie: Parts of whole (<6 categories only)
  * scatter: Correlations
- Title states the insight: "Revenue Grew 45% After Implementation"
- NOT generic: "Data Chart"

IMAGE PROMPTS:
- Match emotional tone
- Reinforce message (not generic)
- Professional, modern aesthetic
Example: "diverse team celebrating breakthrough, modern office, natural light, professional photography"

=== JSON STRUCTURE ===

Return ONLY valid JSON (no markdown, no code blocks):

{{
  "title": "Compelling Main Title Promising Value",
  "description": "One-sentence value proposition",
  "slides": [
    {{
      "type": "title",
      "title": "Main Title Here",
      "content": "Compelling subtitle creating interest",
      "imagePrompt": "professional inspiring image matching {theme} theme",
      "layout": "center",
      "chartData": {{"needed": false}}
    }},
    {{
      "type": "hook",
      "title": "Did You Know? [Surprising Insight]",
      "content": "• Compelling statistic\\n• Why it matters\\n• What's at stake",
      "imagePrompt": "data visualization concept, modern, professional",
      "layout": "split",
      "chartData": {{
        "needed": true,
        "type": "bar",
        "title": "Scale of the Opportunity",
        "labels": ["Current", "Potential", "Industry Avg"],
        "values": [45, 85, 60],
        "description": "Data reveals significant growth potential"
      }}
    }},
    {{
      "type": "content",
      "title": "Action-Oriented Headline (Specific, Not Generic)",
      "content": "• First key insight\\n• Supporting detail\\n• Why it matters",
      "imagePrompt": "relevant professional image supporting message",
      "layout": "split",
      "chartData": {{"needed": false}}
    }}
  ]
}}

CRITICAL REQUIREMENTS:
✅ EXACTLY {num_slides} slides
✅ Every slide has PURPOSE in narrative
✅ Headlines are specific and benefit-focused
✅ Charts support claims with realistic data
✅ Content flows logically
✅ Language is clear and conversational
✅ NO generic titles like "Overview" or "Introduction"

Generate the presentation now."""

        try:
            print("🤖 Calling AI for content generation...")
            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model
            )
            
            # Extract and parse JSON
            content = response.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                slides = data.get("slides", [])
                
                # Validate and enhance slides
                slides = self._validate_and_enhance_slides(slides, topic, audience)
                
                # Ensure correct count
                if len(slides) < num_slides:
                    print(f"⚠️ Only {len(slides)} slides, adding more...")
                    while len(slides) < num_slides:
                        slides.append(self._create_intelligent_slide(topic, len(slides), audience))
                elif len(slides) > num_slides:
                    slides = slides[:num_slides]
                
                data["slides"] = slides
                print(f"✅ Generated {len(slides)} intelligent slides")
                return data
            else:
                raise Exception("No valid JSON found")
                
        except Exception as e:
            print(f"❌ AI generation error: {e}")
            print("🔄 Using intelligent fallback...")
            return self._create_intelligent_fallback(topic, num_slides, audience, purpose)
    
    def _validate_and_enhance_slides(self, slides: List[Dict], topic: str, audience: str) -> List[Dict]:
        """Validate slide quality and enhance with intelligent defaults"""
        enhanced = []
        
        for i, slide in enumerate(slides):
            # Fix generic titles
            title = slide.get("title", "")
            if self._is_generic_title(title):
                slide["title"] = self._generate_smart_title(slide, topic, i)
            
            # Ensure proper chart data
            chart_data = slide.get("chartData", {})
            if chart_data.get("needed") and not self._is_valid_chart_data(chart_data):
                slide["chartData"] = self._generate_contextual_chart(slide, topic)
            
            # Enhance image prompts
            if not slide.get("imagePrompt") or len(slide.get("imagePrompt", "")) < 10:
                slide["imagePrompt"] = self._generate_smart_image_prompt(slide, topic)
            
            # Ensure content quality
            content = slide.get("content", "")
            if len(content) > 600:  # Too long
                slide["content"] = self._condense_content(content)
            
            enhanced.append(slide)
        
        return enhanced
    
    def _is_generic_title(self, title: str) -> bool:
        """Check if title is generic/weak"""
        generic_words = [
            "overview", "introduction", "background", "about",
            "slide", "section", "part", "chapter", "summary"
        ]
        title_lower = title.lower()
        return any(word in title_lower for word in generic_words) or len(title) < 5
    
    def _generate_smart_title(self, slide: Dict, topic: str, index: int) -> str:
        """Generate action-oriented title"""
        slide_type = slide.get("type", "content")
        
        if slide_type == "title":
            return f"Mastering {topic}: A Strategic Approach"
        elif slide_type == "hook":
            return f"The {topic} Opportunity You're Missing"
        elif slide_type == "stats":
            return f"Key Metrics: {topic} Performance"
        elif slide_type == "conclusion":
            return f"Your {topic} Action Plan"
        else:
            return f"How {topic} Drives Results"
    
    def _generate_contextual_chart(self, slide: Dict, topic: str) -> Dict:
        """Generate chart data that's contextually relevant"""
        title = slide.get("title", topic)
        content = slide.get("content", "")
        
        # Analyze content to determine appropriate chart
        content_lower = (title + " " + content).lower()
        
        # Trend/growth keywords → Line chart
        if any(word in content_lower for word in ["growth", "trend", "over time", "timeline", "progress"]):
            return {
                "needed": True,
                "type": "line",
                "title": f"{topic} Growth Trajectory",
                "labels": ["Q1", "Q2", "Q3", "Q4"],
                "values": [65, 72, 84, 91],
                "description": "Consistent quarter-over-quarter growth"
            }
        
        # Comparison keywords → Bar chart
        elif any(word in content_lower for word in ["compare", "vs", "versus", "difference", "performance"]):
            return {
                "needed": True,
                "type": "bar",
                "title": f"{topic} Comparison",
                "labels": ["Before", "After", "Industry Avg"],
                "values": [55, 89, 72],
                "description": "Significant improvement vs benchmark"
            }
        
        # Distribution keywords → Pie chart
        elif any(word in content_lower for word in ["distribution", "breakdown", "segments", "share"]):
            return {
                "needed": True,
                "type": "pie",
                "title": f"{topic} Distribution",
                "labels": ["Segment A", "Segment B", "Segment C"],
                "values": [45, 35, 20],
                "description": "Market segment breakdown"
            }
        
        # Default: Bar chart with performance metrics
        else:
            return {
                "needed": True,
                "type": "bar",
                "title": f"{topic} Key Metrics",
                "labels": ["Efficiency", "Quality", "Speed", "Satisfaction"],
                "values": [78, 85, 92, 88],
                "description": "Performance across key dimensions"
            }
    
    def _generate_smart_image_prompt(self, slide: Dict, topic: str) -> str:
        """Generate contextually appropriate image prompt"""
        slide_type = slide.get("type", "content")
        title = slide.get("title", topic)
        
        # Emotional tone based on slide type
        if slide_type == "title":
            return f"{topic} hero image, modern professional, inspiring, high quality"
        elif slide_type == "hook":
            return f"data visualization, digital analytics, modern technology, professional"
        elif slide_type == "stats":
            return f"business metrics dashboard, professional analytics, modern office"
        elif slide_type == "conclusion":
            return f"success, achievement, team celebration, professional photography"
        else:
            # Extract key concept from title
            key_concept = title.split(":")[0] if ":" in title else title
            return f"{key_concept}, professional illustration, modern design, business context"
    
    def _is_valid_chart_data(self, chart_data: Dict) -> bool:
        """Validate chart data structure"""
        if not isinstance(chart_data, dict):
            return False
        
        required = ["type", "labels", "values"]
        if not all(k in chart_data for k in required):
            return False
        
        labels = chart_data.get("labels", [])
        values = chart_data.get("values", [])
        
        if not labels or not values or len(labels) != len(values):
            return False
        
        return True
    
    def _condense_content(self, content: str) -> str:
        """Condense overly long content"""
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        bullets = [line for line in lines if line.startswith("•")]
        
        if len(bullets) > 5:
            bullets = bullets[:5]
        
        return "\n".join(bullets)
    
    def _create_intelligent_slide(self, topic: str, index: int, audience: str) -> Dict:
        """Create an intelligent slide when AI generation is incomplete"""
        has_chart = index % 3 == 0
        
        slide = {
            "type": "content",
            "title": f"How {topic} Impacts {audience.title()}",
            "content": f"• Strategic insight about {topic}\n• Data-driven approach\n• Measurable outcomes\n• Key takeaway for action",
            "imagePrompt": f"{topic} professional business context, modern",
            "layout": "split"
        }
        
        if has_chart:
            slide["chartData"] = self._generate_contextual_chart(slide, topic)
        else:
            slide["chartData"] = {"needed": False}
        
        return slide
    
    def _create_intelligent_fallback(self, topic: str, num_slides: int, audience: str, purpose: str) -> Dict:
        """Create intelligent fallback presentation"""
        num_slides = max(8, min(15, num_slides))
        slides = []
        
        # Slide 1: Title
        slides.append({
            "type": "title",
            "title": f"Mastering {topic}: A Strategic Guide",
            "content": f"Essential insights for {audience}",
            "imagePrompt": f"{topic} professional hero image, modern, inspiring",
            "layout": "center",
            "chartData": {"needed": False}
        })
        
        # Slide 2: Hook with chart
        slides.append({
            "type": "hook",
            "title": f"The {topic} Opportunity",
            "content": f"• 85% of {audience} report significant impact\n• Industry growing 40% year-over-year\n• Critical window for action",
            "imagePrompt": "data analytics, opportunity, modern professional",
            "layout": "split",
            "chartData": {
                "needed": True,
                "type": "bar",
                "title": "Market Growth & Opportunity",
                "labels": ["2022", "2023", "2024", "2025"],
                "values": [55, 68, 82, 95],
                "description": "Accelerating market growth trajectory"
            }
        })
        
        # Slide 3: Context
        slides.append({
            "type": "context",
            "title": f"Why {topic} Matters Now",
            "content": f"• Changing market dynamics\n• Competitive pressure increasing\n• Customer expectations evolving\n• Technology enabling new approaches",
            "imagePrompt": f"{topic} business context, professional",
            "layout": "split",
            "chartData": {"needed": False}
        })
        
        # Core content slides
        core_topics = [
            ("Strategy", "Strategic approach"),
            ("Implementation", "Execution framework"),
            ("Results", "Measurable outcomes"),
            ("Best Practices", "Proven methodologies"),
            ("Challenges", "Overcoming obstacles"),
            ("Future", "What's next")
        ]
        
        for i, (section, desc) in enumerate(core_topics[:num_slides-5]):
            has_chart = i % 2 == 0
            
            slide = {
                "type": "content",
                "title": f"{section}: {desc} for {topic}",
                "content": f"• Key insight about {section.lower()}\n• Practical application\n• Real-world examples\n• Action items",
                "imagePrompt": f"{topic} {section.lower()}, professional business",
                "layout": "split"
            }
            
            if has_chart:
                slide["chartData"] = {
                    "needed": True,
                    "type": "bar" if i % 2 == 0 else "line",
                    "title": f"{section} Metrics",
                    "labels": ["Factor 1", "Factor 2", "Factor 3", "Factor 4"],
                    "values": [random.randint(70, 95) for _ in range(4)],
                    "description": f"Performance analysis for {section.lower()}"
                }
            else:
                slide["chartData"] = {"needed": False}
            
            slides.append(slide)
        
        # Penultimate: Key takeaways with chart
        slides.append({
            "type": "summary",
            "title": "Key Takeaways: Your Path Forward",
            "content": f"• {topic} drives measurable results\n• Implementation is straightforward\n• ROI is proven and significant\n• Time to act is now",
            "imagePrompt": "success metrics, achievement, professional",
            "layout": "split",
            "chartData": {
                "needed": True,
                "type": "pie",
                "title": "Success Factor Distribution",
                "labels": ["Strategy", "Execution", "Team", "Technology"],
                "values": [30, 35, 20, 15],
                "description": "Critical success factors breakdown"
            }
        })
        
        # Final: Call to action
        slides.append({
            "type": "conclusion",
            "title": "Your Action Plan",
            "content": f"✅ Immediate next steps\n✅ Resources available\n✅ Support structure\n\n🎯 Let's transform {topic} together",
            "imagePrompt": "team success, celebration, professional photography",
            "layout": "center",
            "chartData": {"needed": False}
        })
        
        return {
            "title": f"{topic}: Strategic Guide for {audience.title()}",
            "description": f"Comprehensive presentation for {purpose}",
            "slides": slides[:num_slides]
        }
    
    async def _add_media_assets(self, slides: List[Dict]) -> List[Dict]:
        """Generate AI images and charts"""
        enhanced = []

        for i, slide in enumerate(slides):
            try:
                print(f"  Processing slide {i+1}/{len(slides)}: {slide.get('title')}")
                chart_data = slide.get("chartData", {})
                has_chart = chart_data.get("needed", False)
                
                if not has_chart:
                    height = self._calculate_dynamic_height(slide)
                    image_prompt = slide.get("imagePrompt", slide.get('title', 'professional presentation'))

                    try:
                        image_url = await self._generate_hf_image(image_prompt, height)
                        if image_url:
                            slide["imageUrl"] = image_url
                            print(f"    ✅ Image: Hugging Face")
                        else:
                            image_url = await self._generate_pollinations_image(image_prompt, height)
                            slide["imageUrl"] = image_url
                            print(f"    ✅ Image: Pollinations.ai")
                    except Exception as img_error:
                        print(f"    ⚠️ Image error: {img_error}")
                        image_url = await self._generate_pollinations_image(image_prompt, height)
                        slide["imageUrl"] = image_url
                else:
                    slide["imageUrl"] = ""  # ✅ Explicitly empty
                    print(f"    📊 Slide has chart - no image generated")

            # Generate chart if needed
                if has_chart:
                    try:
                        chart_url = self._render_chart(chart_data)
                        if chart_url:
                            slide["chartUrl"] = chart_url  # ✅ SET THIS
                            slide["chartData"] = chart_data
                            print(f"    📊 Chart: {chart_data.get('type', 'bar')}")
                        else:
                            print(f"    ⚠️ Chart rendering returned None")
                            slide["chartUrl"] = ""  # ✅ Set empty if failed
                    except Exception as chart_error:
                        print(f"    ❌ Chart error: {chart_error}")
                        slide["chartUrl"] = ""  # ✅ Set empty if error
                else:
                    slide["chartUrl"] = ""  # ✅ No chart needed

                enhanced.append(slide)

            except Exception as e:
                print(f"  ❌ Critical error on slide {i+1}: {e}")
                if "imageUrl" not in slide:
                    slide["imageUrl"] = ""
                if "chartUrl" not in slide:
                    slide["chartUrl"] = ""
                enhanced.append(slide)

        print(f"✅ Processed {len(enhanced)}/{len(slides)} slides")
        return enhanced

    
    async def _generate_hf_image(self, prompt: str, height: int = 800):
        """Try Hugging Face image generation"""
        headers = {}
        if self.hf_api_key:
            headers["Authorization"] = f"Bearer {self.hf_api_key}"
    
        result = await self._try_hf_model(self.current_hf_model, prompt, headers)
        if result:
            return result
    
        for model in self.hf_image_models[:2]:
            if model != self.current_hf_model:
                result = await self._try_hf_model(model, prompt, headers)
                if result:
                    return result
    
        return None
    
    async def _try_hf_model(self, model: str, prompt: str, headers: dict):
        """Try single HF model with timeout"""
        try:
            url = f"{self.hf_api_url}{model}"
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": prompt},
                    timeout=15
                )
            
            if response.status_code == 200:
                image_bytes = response.content
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                return f"data:image/png;base64,{image_base64}"
            return None
        except:
            return None
    
    async def _generate_pollinations_image(self, prompt: str, height: int = 800) -> str:
        """Reliable Pollinations.ai image generation"""
        try:
            clean_prompt = prompt.strip()
            if len(clean_prompt) < 10:
                clean_prompt = f"{clean_prompt} professional illustration"

            enhanced_prompt = f"{clean_prompt}, high quality, professional, detailed"
            encoded_prompt = urllib.parse.quote(enhanced_prompt)

            image_url = (
                f"{self.pollinations_url}{encoded_prompt}"
                f"?width=1200&height={height}&nologo=true&enhance=true&model=flux"
            )
            return image_url
        except:
            safe_prompt = urllib.parse.quote("professional presentation background")
            return f"{self.pollinations_url}{safe_prompt}?width=1200&height={height}&nologo=true"
    
    def _render_chart(self, chart_data: Dict) -> str:
        """Render chart to base64 image with professional styling"""
        try:
            fig, ax = plt.subplots(figsize=(10, 6))
            plt.style.use('seaborn-v0_8-darkgrid')
            
            chart_type = chart_data.get("type", "bar")
            labels = chart_data.get("labels", [])
            values = chart_data.get("values", [])
            title = chart_data.get("title", "Chart")
            
            if not labels or not values or len(labels) != len(values):
                raise ValueError("Invalid chart data")
            
            colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            
            if chart_type == "bar":
                bars = ax.bar(labels, values, color=colors[0], alpha=0.8, edgecolor='#1e40af', linewidth=2)
                ax.set_ylabel('Values', fontsize=11, fontweight='bold')
                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height,
                           f'{height:.1f}',
                           ha='center', va='bottom', fontsize=9, fontweight='bold')
                           
            elif chart_type == "pie":
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
                       color=colors[0], markerfacecolor='#60a5fa', markeredgecolor='#1e40af', 
                       markeredgewidth=2)
                ax.set_ylabel('Values', fontsize=11, fontweight='bold')
                ax.grid(True, alpha=0.3, linestyle='--')
                for i, (label, value) in enumerate(zip(labels, values)):
                    ax.text(i, value, f'{value:.1f}', ha='center', va='bottom', 
                           fontsize=9, fontweight='bold')
                           
            elif chart_type == "scatter":
                ax.scatter(range(len(values)), values, s=200, alpha=0.6, 
                          c=colors[0], edgecolors='#1e40af', linewidth=2)
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
        """Apply theme colors to slide"""
        slide["backgroundColor"] = theme.background_color
        slide["textColor"] = theme.text_color
        slide["primaryColor"] = theme.primary_color
        slide["secondaryColor"] = theme.secondary_color
        slide["accentColor"] = theme.accent_color
        return slide
    
    def _get_theme_data(self, theme) -> Dict:
        """Get theme data dictionary"""
        return {
            "primaryColor": theme.primary_color,
            "secondaryColor": theme.secondary_color,
            "accentColor": theme.accent_color,
            "backgroundColor": theme.background_color,
            "textColor": theme.text_color,
            "fontFamily": theme.font_family
        }
    
    async def get_available_models(self) -> List[str]:
        """Get available AI models from OpenRouter"""
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
        """Get available presentation themes"""
        return theme_manager.get_available_themes()
    
    def create_custom_theme(self, name: str, **kwargs) -> str:
        """Create custom theme"""
        theme = theme_manager.create_custom_theme(name, **kwargs)
        return theme.name
    
    async def generate_image(self, prompt: str, height: int = 800) -> str:
        """Standalone image generation"""
        print(f"🎨 generate_image() called with prompt: {prompt[:50]}...")
        
        try:
            result = await self._generate_hf_image(prompt, height)
            if result:
                print("✅ Image source: Hugging Face")
                return result
        except Exception as e:
            print(f"⚠️ HF failed: {str(e)[:80]}")

        print("🔄 Using Pollinations.ai fallback...")
        result = await self._generate_pollinations_image(prompt, height)
        print("✅ Image source: Pollinations.ai")
        return result
    
    async def generate_outline(self, content: str):
        """Generate 8-15 section outline with intelligence"""
        try:
            system_prompt = """You are a professional presentation strategist.

YOUR TASK: Analyze the content and create a STRATEGIC outline with 8-15 sections.

ANALYSIS FRAMEWORK:
1. Identify the core message/thesis
2. Determine logical flow and story arc
3. Group related concepts
4. Create compelling section titles (not generic)
5. Ensure each section serves the narrative

QUALITY RULES:
- Section titles should be specific and actionable
- NOT: "Introduction" → YES: "The Problem Costing You $50K"
- NOT: "Overview" → YES: "3 Critical Success Factors"
- Each section must have clear value proposition

Return ONLY this JSON:
{
  "title": "Compelling Presentation Title",
  "sections": [
    {
      "title": "Specific, Action-Oriented Section Title",
      "content": "2-3 sentences explaining what this section covers and why it matters"
    }
  ]
}

Generate 8-15 sections. NO markdown, NO code blocks."""

            user_prompt = f"""Analyze this content and create a strategic presentation outline:

{content[:4000]}

Create 8-15 sections that:
- Tell a compelling story
- Build logically on each other
- Have specific, actionable titles
- Each serve a clear purpose"""

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
            sections = data.get("sections", [])

            # Ensure 8-15 sections
            if len(sections) < 8:
                print(f"⚠️ Only {len(sections)} sections, adding intelligent sections...")
                while len(sections) < 8:
                    sections.append({
                        "title": f"Key Insight {len(sections) + 1}: Supporting Evidence",
                        "content": f"Additional strategic perspective on {content[:50]}"
                    })
            elif len(sections) > 15:
                sections = sections[:15]

            print(f"✅ Generated {len(sections)} strategic outline sections")

            return {
                "title": data.get("title", "Strategic Presentation Outline"),
                "sections": sections
            }

        except Exception as e:
            print(f"❌ Error in generate_outline: {e}")
            return {
                "title": "Presentation Outline",
                "sections": [
                    {"title": f"Strategic Section {i+1}", "content": f"Key insights for section {i+1}"}
                    for i in range(8)
                ]
            }
    
    async def summarize_document(self, document_content: str, filename: str, outline_only: bool = False):
        """Intelligently summarize document with context"""
        try:
            if outline_only:
                system_prompt = """You are an expert at analyzing documents and creating strategic outlines.

TASK: Extract key themes and create 8-15 section outline.

ANALYSIS APPROACH:
1. Identify main themes and arguments
2. Group related concepts
3. Create logical flow
4. Generate specific, actionable section titles

OUTPUT: JSON with sections array. Each section needs:
- Specific title (not "Introduction" or "Overview")
- 2-3 sentence description of what it covers

NO markdown, ONLY JSON."""

                user_prompt = f"""Analyze this document and create strategic outline with 8-15 sections:

DOCUMENT: {filename}
CONTENT:
{document_content[:6000]}

Create sections that:
- Capture key themes
- Flow logically
- Have specific titles
- Build narrative arc"""

            else:
                system_prompt = """You are a professional presentation creator specializing in document summarization.

TASK: Transform document into compelling presentation slides (8-15 slides).

RULES:
- Extract key points, don't just copy text
- One clear message per slide
- Include charts for data-heavy content (30-40% of slides)
- Use bullet points (•)
- Create logical flow

OUTPUT: JSON with slides array. Each slide needs chartData where appropriate.
NO markdown, ONLY JSON."""

                user_prompt = f"""Create 8-15 presentation slides from this document:

DOCUMENT: {filename}
CONTENT:
{document_content[:6000]}

Extract key insights, organize logically, add charts where data supports claims."""

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

            if outline_only:
                sections = data.get("sections", [])
                
                if len(sections) < 8:
                    while len(sections) < 8:
                        sections.append({
                            "title": f"Additional Insight {len(sections) + 1}",
                            "content": f"Supporting content from {filename}"
                        })
                elif len(sections) > 15:
                    sections = sections[:15]

                return {
                    "title": f"Strategic Analysis: {filename}",
                    "description": "Document outline",
                    "sections": sections
                }

            else:
                raw_slides = data.get("slides", [])
                
                if len(raw_slides) < 8:
                    while len(raw_slides) < 8:
                        raw_slides.append({
                            "title": f"Key Point {len(raw_slides) + 1}",
                            "content": f"Additional insights from {filename}",
                            "chartData": {"needed": False}
                        })
                elif len(raw_slides) > 15:
                    raw_slides = raw_slides[:15]

                slides = []
                for i, slide_data in enumerate(raw_slides):
                    title = self._clean_text(slide_data.get("title", f"Slide {i+1}"))
                    content = self._clean_content(slide_data.get("content", ""))
                    
                    chart_data = slide_data.get("chartData", {"needed": False})
                    if not chart_data.get("needed") and i % 3 == 0:
                        chart_data = self._generate_contextual_chart(slide_data, filename)

                    slide = {
                        "type": "content",
                        "title": title,
                        "content": content,
                        "layout": "split",
                        "chartData": chart_data,
                        "imagePrompt": f"{title} professional illustration"
                    }
                    
                    slides.append(slide)

                return {
                    "title": f"Analysis: {filename}",
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
                    "title": f"Summary: {filename}",
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
        """Clean text from escape sequences"""
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
        """Simple text generation helper"""
        try:
            system_prompt = "You are an expert presentation assistant. Provide clear, concise, professional responses."
            result = await self.call_openrouter_api(system_prompt=system_prompt, user_prompt=prompt)
            return result.strip()
        except Exception as e:
            print(f"❌ generate_ai_text failed: {e}")
            return f"(AI error: {e})"


# Backward compatibility alias
PresentaionAi = AIHeavyPresentationService