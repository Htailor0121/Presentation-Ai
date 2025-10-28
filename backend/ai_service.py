import os
import json
import httpx
import re
import time
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
        self.hf_api_url = "https://router.huggingface.co/hf-inference/models/"
        
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
    
    # Add this method to your AIHeavyPresentationService class in ai_service.py
    # Insert it after the __init__ method, around line 60

    async def generate_presentation_gamma_style(
        self,
        topic: str,
        theme: str,
        num_slides: int,
        model: str,
        audience: str,
        purpose: str
    ) -> Dict[str, Any]:
        """🎯 GAMMA-LEVEL: Generate presentation with advanced layouts and design"""
    
        num_slides = max(8, min(15, num_slides))
    
        strategy_map = {
            "inform": "educate the audience with clear, factual information",
            "persuade": "convince the audience to take action or change perspective",
            "inspire": "motivate and energize the audience",
            "educate": "teach the audience new skills or concepts",
            "sell": "demonstrate value and drive purchasing decisions"
        }
    
        strategy = strategy_map.get(purpose.lower(), "inform and engage the audience")
    
        system_prompt = """You are an elite presentation architect specializing in visual storytelling and modern design systems. You've designed award-winning decks for companies like Airbnb, Stripe, and Notion.

CORE MASTERY:
- Visual hierarchy and cognitive load optimization
- Modern UI/UX design patterns and component systems
- Data storytelling with sophisticated visualizations
- Brand identity and design systems
- Persuasive psychology and narrative architecture
- Accessibility and inclusive design

YOUR MISSION: Create presentations that are visually stunning, emotionally resonant, and strategically effective."""

        user_prompt = f"""Create a visually sophisticated presentation with EXACTLY {num_slides} slides.

=== STRATEGIC FOUNDATION ===
Topic: {topic}
Audience: {audience}
Goal: {strategy}
Theme: {theme}

STRATEGIC ANALYSIS (Think deeply before generating):
1. Emotional Journey: What should the audience FEEL at each stage?
2. Cognitive Load: How do we make complex ideas effortless?
3. Visual Metaphors: What imagery reinforces the core message?
4. Narrative Arc: What's the story structure? (Hero's journey? Problem-solution? Before-after?)
5. Key Moments: Which 2-3 slides should be "wow" moments?

=== DESIGN SYSTEM ===

COLOR PSYCHOLOGY:
- {theme} theme drives palette selection
- Use 60-30-10 rule (dominant, secondary, accent)
- Gradients for depth and modernity
- Contrast for accessibility (WCAG AA minimum)

TYPOGRAPHY HIERARCHY:
- Headlines: Bold, impactful (48-72px equivalent)
- Subheads: Medium weight (24-32px)
- Body: Regular (16-20px)
- Captions: Light (12-14px)

LAYOUT PRINCIPLES:
- Asymmetry for visual interest
- White space as a design element (40-60% of slide)
- F-pattern and Z-pattern for eye flow
- Golden ratio for proportions where appropriate

=== ADVANCED LAYOUT TYPES ===

Choose strategically from these 12 layouts:

1. **hero**: Full-bleed impact
   - Large headline + minimal text
   - Dramatic background image/gradient
   - Best for: Opening, section breaks, emotional moments

2. **split_visual**: Balanced content + visual
   - 50/50 or 60/40 split
   - Text left, visual right (or inverse)
   - Best for: Explaining concepts with visuals

3. **card_grid**: Multiple concepts
   - 2-4 cards with icons/images
   - Equal visual weight
   - Best for: Features, benefits, frameworks

4. **data_focus**: Chart dominates
   - Large visualization (70% of space)
   - Minimal supporting text
   - Best for: Key insights, trends, comparisons

5. **quote_statement**: Impactful message
   - Large quote/statement (center or offset)
   - Attribution or supporting detail
   - Best for: Testimonials, principles, philosophy

6. **comparison**: Side-by-side
   - Two columns: before/after, old/new, us/them
   - Visual separation with color/border
   - Best for: Contrasts, alternatives

7. **timeline**: Sequential flow
   - Horizontal or vertical progression
   - Connected with lines/arrows
   - Best for: Processes, history, roadmaps

8. **stat_showcase**: Number as hero
   - Massive statistic (80-120px)
   - Supporting context below
   - Best for: Impact metrics, key findings

9. **layered_content**: Depth and hierarchy
   - Overlapping elements
   - Cards/panels at different z-levels
   - Best for: Complex relationships, ecosystems

10. **minimal_statement**: Maximum white space
    - Single sentence or phrase
    - 70%+ empty space
    - Best for: Transitions, provocations

11. **image_collage**: Visual storytelling
    - 2-4 images in artistic arrangement
    - Minimal text overlay
    - Best for: Culture, examples, inspiration

12. **full_bleed_text**: Typography as art
    - Text is the visual element
    - Creative typography treatment
    - Best for: Quotes, bold statements, section titles

=== CONTENT COMPONENTS ===

VISUAL ELEMENTS (use strategically):

**Charts** (choose by data story):
- bar: Category comparison
- horizontalBar: Ranking or comparison with labels
- line: Trends over time
- area: Volume/cumulative trends
- pie: Parts of whole (max 5 slices)
- donut: Like pie, more modern
- scatter: Correlation/distribution
- radar: Multi-dimensional comparison
- gauge: Progress toward goal
- funnel: Conversion/process stages
- heatmap: Two-dimensional intensity

**UI Components**:
- stat_card: Large number + label + context
- icon_list: Icons with short descriptions
- progress_bar: Visual progress indicator
- badge: Label/tag/category
- callout_box: Highlighted insight/tip
- avatar_group: Team/testimonial photos
- metric_comparison: Side-by-side numbers

**Visual Enhancements**:
- gradient_overlay: Color transitions
- shape_accent: Geometric elements
- pattern_background: Subtle texture
- icon_large: Oversized icon as visual anchor
- illustration: Custom or stock illustrations
- photography: Professional photos (always with specific prompts)

=== SLIDE NARRATIVE STRUCTURE ({num_slides} slides) ===

**ACT 1: CAPTURE (Slides 1-2)**
Slide 1: Hero opening
- Layout: "hero"
- Powerful title + evocative subtitle
- Dramatic visual
- No chart needed

Slide 2: Hook with tension
- Layout: "stat_showcase" or "data_focus"
- Surprising statistic or insight
- Chart showing scale/urgency
- Creates "problem awareness"

**ACT 2: CONTEXT (Slides 3-4)**
- Why now? What's changed?
- Stakeholder impact
- Layouts: "split_visual", "comparison", "timeline"
- Build credibility with data

**ACT 3: CORE INSIGHTS (Slides 5-{num_slides-3})**
- One big idea per slide
- Vary layouts for visual rhythm
- 40% should include data visualization
- Use "card_grid" for frameworks
- Use "quote_statement" for principles
- Build momentum toward solution

**ACT 4: RESOLUTION (Last 3 slides)**
- Slide {num_slides-2}: Synthesize key insights with "layered_content" or "comparison"
- Slide {num_slides-1}: Action steps with "card_grid" (3-4 specific actions)
- Slide {num_slides}: FINAL SLIDE - Must be unique and tailored:
  * Layout: "hero" or "minimal_statement" (NOT center)
  * Title: NEVER use generic titles like "Your Action Plan", "Conclusion", "Thank You"
  * Title MUST be specific to {topic} and {purpose}:
    - inform → "3 Things to Remember About {topic}"
    - persuade → "Why {topic} Matters Right Now"
    - inspire → "Your {topic} Journey Starts Today"
    - educate → "Mastering {topic}: Your Next Steps"
    - sell → "Ready to Transform with {topic}?"
  * Content: Customize based on purpose and topic
  * Avoid checkmarks and generic phrases
  * Create emotional resonance and urgency

=== QUALITY STANDARDS ===

HEADLINES (action-oriented, specific):
 "How 3 Design Changes Increased Conversion 127%"
 "The $2.4M Cost of Ignoring User Feedback"
 "Why Traditional Approaches Fail (And What Works Instead)"
❌ "Results"
❌ "Our Solution"
❌ "Conclusion"

CONTENT PRINCIPLES:
- Progressive disclosure: Simple → Complex
- Show, don't tell (visuals > words)
- One concept per slide (ruthlessly)
- 2-4 bullets maximum (or none)
- Each slide passes "5-second test" (clarity)

CHART EXCELLENCE:
- Title states the insight: "Revenue Doubled After Q2 Launch"
- Realistic, contextual data
- Axis labels clear
- Color encodes meaning
- No chart junk

IMAGE PROMPTS (be specific):
 "diverse software team collaborating at modern standing desk, natural daylight, tech startup aesthetic, shallow depth of field"
 "abstract data visualization particles forming network, dark blue and purple gradient, 3D render, cinematic"
❌ "team working"
❌ "office"

=== JSON OUTPUT FORMAT ===

Return ONLY valid JSON:

{{
  "presentation": {{
    "title": "Compelling Main Title",
    "subtitle": "Value proposition in one line",
    "description": "2-3 sentence overview of narrative arc",
    "designSystem": {{
      "colorPalette": {{
        "primary": "#HEX",
        "secondary": "#HEX",
        "accent": "#HEX",
        "background": "#HEX",
        "text": "#HEX"
      }},
      "theme": "{theme}",
      "fontPairings": {{
        "heading": "Modern sans-serif suggestion",
        "body": "Readable sans-serif suggestion"
      }}
    }},
    "slides": [
      {{
        "slideNumber": 1,
        "type": "title",
        "layout": "hero",
        "title": "Powerful Opening Title",
        "subtitle": "Evocative subtitle that creates intrigue",
        "content": null,
        "visualElements": {{
          "backgroundType": "gradient" | "image" | "solid",
          "imagePrompt": "specific, detailed prompt for hero image",
          "gradientDirection": "to bottom right",
          "overlayOpacity": 0.6
        }},
        "components": [],
        "chartData": null,
        "designNotes": "Opening should create immediate emotional connection"
      }},
      {{
        "slideNumber": 2,
        "type": "hook",
        "layout": "stat_showcase",
        "title": "Did You Know?",
        "subtitle": null,
        "content": "Brief context for the statistic",
        "visualElements": {{
          "backgroundType": "gradient",
          "accentShape": "circle" | "rectangle" | null
        }},
        "components": [
          {{
            "type": "stat_card",
            "value": "127%",
            "label": "Increase in engagement",
            "context": "After implementing these changes",
            "size": "large"
          }}
        ],
        "chartData": {{
          "needed": true,
          "type": "bar",
          "title": "Scale of the Opportunity",
          "description": "Chart showing dramatic difference",
          "labels": ["Before", "After", "Industry Avg"],
          "datasets": [
            {{
              "label": "Performance",
              "values": [45, 102, 67],
              "color": "#primary"
            }}
          ],
          "config": {{
            "showLegend": false,
            "showGrid": true,
            "orientation": "vertical"
          }}
        }},
        "designNotes": "Create tension and curiosity"
      }},
      {{
        "slideNumber": 3,
        "type": "content",
        "layout": "split_visual",
        "title": "Specific, Benefit-Focused Headline",
        "subtitle": null,
        "content": "• First key insight (clear, concise)\\n• Supporting detail with context\\n• Why it matters to {audience}",
        "visualElements": {{
          "backgroundType": "solid",
          "imagePrompt": "relevant professional image supporting the message",
          "imagePlacement": "right"
        }},
        "components": [
          {{
            "type": "icon_list",
            "items": [
              {{"icon": "check", "text": "Key benefit one"}},
              {{"icon": "check", "text": "Key benefit two"}}
            ]
          }}
        ],
        "chartData": null,
        "designNotes": "Build on hook with actionable insights"
      }}
    ]
  }}
}}

=== ADVANCED GUIDELINES ===

LAYOUT RHYTHM:
- Alternate between text-heavy and visual-heavy slides
- Use "minimal_statement" slides as palate cleansers
- Place data-heavy slides after conceptual ones
- End sections with impact layouts ("hero", "quote_statement")

VISUAL STORYTELLING:
- Consistent visual metaphors throughout
- Color coding for themes/categories
- Progressive complexity in charts
- White space increases toward ending (visual breathing room)

ACCESSIBILITY:
- Color contrast ratio ≥ 4.5:1
- Don't rely solely on color to convey meaning
- Alt text concepts for all images
- Readable font sizes

EMOTIONAL PACING:
- Start: Curiosity/surprise
- Middle: Understanding/concern
- End: Hope/determination

=== CRITICAL REQUIREMENTS ===

 EXACTLY {num_slides} slides
 Every slide has strategic purpose
 Layout variety (use ≥6 different layouts)
 Visual hierarchy is clear
 Charts have realistic, contextual data
 Image prompts are specific and purposeful
 Design system is cohesive
 Content is scannable and clear
 No generic headlines
 Narrative arc is complete

NOW: Generate the presentation with sophistication, strategic thinking, and visual excellence."""

        try:
            print("🤖 Calling AI for Gamma-style generation...")
            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model
            )
        
        # Parse JSON response
            content = response.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
        
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                slides = data.get("slides", [])
            
                # Validate slide count
                if len(slides) < num_slides:
                    print(f"⚠️ Only {len(slides)} slides, adding more...")
                    while len(slides) < num_slides:
                        slides.append(self._create_intelligent_slide(topic, len(slides), audience))
                elif len(slides) > num_slides:
                    slides = slides[:num_slides]

                data["slides"] = slides
                print(f" Generated {len(slides)} Gamma-style slides")
                return data
            else:
                raise Exception("No valid JSON found")
            
        except Exception as e:
            print(f"❌ Gamma generation error: {e}")
            return self._create_intelligent_fallback(topic, num_slides, audience, purpose)
    
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

        if outline_sections and len(outline_sections) > 0:
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
            presentation_data = await self.generate_presentation_gamma_style(
                topic=topic,
                theme=theme_name,
                num_slides=num_slides,
                model=model or self.default_model,
                audience=audience,
                purpose=purpose
            )

    # Generate images and charts
        enhanced_slides = await self._add_media_assets(
            presentation_data.get("slides", [])
        )

    # Apply theme
        theme = theme_manager.get_theme(theme_name)
        final_slides = []

        for i, slide in enumerate(enhanced_slides):
            slide = self._apply_theme_colors(slide, theme)
            slide["height"] = self._calculate_dynamic_height(slide)
        
            if include_interactive:
                slide = interactive_manager.enhance_slide_with_interactivity(slide)
        
            slide["id"] = slide.get("id") or f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}"
        
        #  ADD THIS DEBUG LOG
            if slide.get("chartUrl"):
                print(f" Slide {i+1} HAS chartUrl: {len(slide['chartUrl'])} chars")
        
            final_slides.append(slide)

    #  ADD THIS SUMMARY LOG
        chart_count = sum(1 for s in final_slides if s.get("chartUrl"))
        print(f"📊 FINAL CHECK: {chart_count}/{len(final_slides)} slides have charts")

        return {
            "title": presentation_data.get("title", topic.title()),
            "description": presentation_data.get("description", f"Professional presentation about {topic}"),
            "theme": theme.name,
            "themeData": self._get_theme_data(theme),
            "slides": final_slides,  #  This should include chartUrl
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

                #  Ensure we have exactly the right number of slides
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
                print(f" Generated {len(slides)} slides from outline")
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
            # Extract and parse JSON
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
            "content": f" Immediate next steps\n✅ Resources available\n✅ Support structure\n\n🎯 Let's transform {topic} together",
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
     """Generate AI images and charts - with chart priority over image."""
     enhanced = []

     for i, slide in enumerate(slides):
         try:
             print(f"  Processing slide {i+1}/{len(slides)}: {slide.get('title')}")
             chart_data = slide.get("chartData", {})
             has_chart = chart_data.get("needed", False)

             #  If chart exists → DO NOT generate image
             if has_chart:
                 slide["imageUrl"] = ""  # override -> no image
                 try:
                     chart_url = self._render_chart(chart_data)
                     slide["chartUrl"] = chart_url if chart_url else ""
                     print(f"    📊 Chart generated ({chart_data.get('type', 'bar')})")
                 except Exception as chart_error:
                     print(f"    ❌ Chart error: {chart_error}")
                     slide["chartUrl"] = ""  # failed chart safe fallback
             else:
                 #  generate image only if no chart
                 slide["chartUrl"] = ""  # explicitly empty
                 height = self._calculate_dynamic_height(slide)
                 try:
                     image_prompt = slide.get("imagePrompt", slide.get('title', 'professional'))
                     image_url = await self._generate_hf_image(image_prompt, height)
                     if not image_url:
                         image_url = await self._generate_pollinations_image(image_prompt, height)
                     slide["imageUrl"] = image_url
                     print(f"     Image generated")
                 except Exception as img_error:
                     print(f"    ⚠️ Image error: {img_error}")
                     slide["imageUrl"] = ""

             #  intelligent layout logic
             slide["layout"] = "chart" if has_chart else "image"

             enhanced.append(slide)

         except Exception as e:
             print(f"  ❌ Critical error on slide {i+1}: {e}")
             # never crash slide
             slide.setdefault("chartUrl", "")
             slide.setdefault("imageUrl", "")
             slide.setdefault("layout", "image")
             enhanced.append(slide)

     print(f" Processed {len(enhanced)}/{len(slides)} slides")
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
                print(" Image source: Hugging Face")
                return result
        except Exception as e:
            print(f"⚠️ HF failed: {str(e)[:80]}")

        print("🔄 Using Pollinations.ai fallback...")
        result = await self._generate_pollinations_image(prompt, height)
        print(" Image source: Pollinations.ai")
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

            print(f" Generated {len(sections)} strategic outline sections")

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

            #  USE YOUR EXISTING OpenRouter API method
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

            try:
                data = json.loads(response)
            except Exception:
    # try to extract JSON from inside text
                match = re.search(r'\{.*\}|\[.*\]', response, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                else:
                    data = None

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
                        "imagePrompt": f"{title} professional illustration",
                        "id": f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}"
                    }
                    
                    slides.append(slide)

                slides = await self._add_media_assets(slides)

                #  FINAL ENFORCEMENT: if chart => no image, if image => no chart
                for s in slides:
                    if s.get("chartData", {}).get("needed", False):
                        s["imageUrl"] = ""
                    else:
                        s["chartUrl"] = ""
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
                            "id": f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}",
                            "title": f"Slide {i+1}", 
                            "content": "Content", 
                            "type": "content", 
                            "layout": "split",
                            "chartData": {"needed": False},
                            "imageUrl": "",
                            "chartUrl": ""
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