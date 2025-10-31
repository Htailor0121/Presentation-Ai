import os
import json
import httpx
import re
import time
from typing import Dict, Any, List
from dotenv import load_dotenv
from theme_manager import theme_manager
from interactive_features import interactive_manager
import matplotlib.pyplot as plt
import io, base64
from datetime import datetime
import urllib.parse
import random
import asyncio
import traceback

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
    
    async def call_openrouter_api(self, system_prompt: str, user_prompt: str, model: str = None, temperature: float = 0.7, max_tokens: int = 8000):
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
            "temperature": temperature,
            "max_tokens": max_tokens  # Now configurable
        }

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )

            if response.status_code != 200:
                raise Exception(
                    f"OpenRouter API error: {response.status_code} - {response.text}"
                )

            try:
                data = response.json()
                return data["choices"][0]["message"]["content"]

            except Exception as e:
                print("⚠️ OpenRouter raw response:", response.text[:1000])
                raise Exception(
                    f"Failed to parse OpenRouter response as JSON: {e}"
                )

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

CRITICAL RULES:
1. Each section from the outline becomes ONE individual slide
2. DO NOT combine multiple sections into one slide
3. DO NOT create additional slides
4. USE THE EXACT TITLE from each outline section
5. Expand the content into {bullet_guide} bullet points
6. EVERY THIRD SLIDE (slides 3, 6, 9, etc.) MUST INCLUDE A CHART with realistic data

Chart Requirements:
- Slides 3, 6, 9, 12, 15 MUST have chartData with needed: true
- Include realistic labels and values related to the slide topic
- Use appropriate chart type: bar, line, pie, or area

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
Each section becomes ONE slide with its EXACT title preserved:

    {sections_text}

IMPORTANT: Slides 3, 6, 9, 12, 15 MUST include charts with realistic data.

Return ONLY this JSON structure:

{{
  "title": "Overall Presentation Title",
  "description": "Brief description",
  "slides": [
    {{
      "type": "content",
      "title": "EXACT title from Section 1 - DO NOT CHANGE",
      "content": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
      "imagePrompt": "{image_style} style image for this specific topic",
      "layout": "split",
      "chartData": {{"needed": false}}
    }},
    {{
      "type": "content",
      "title": "EXACT title from Section 3 - MUST HAVE CHART",
      "content": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
      "imagePrompt": "",
      "layout": "split",
      "chartData": {{
        "needed": true,
        "type": "bar",
        "title": "Relevant Chart Title",
        "labels": ["Item 1", "Item 2", "Item 3", "Item 4"],
        "values": [65, 78, 82, 91],
        "description": "Brief chart description"
      }}
    }}
  ]
}}

CRITICAL REQUIREMENTS:
- Create EXACTLY {num_slides} slides
- Each slide MUST use the EXACT title from its corresponding section
- Slides at positions 3, 6, 9, 12, 15 MUST have chartData.needed: true
- Charts should have realistic data relevant to the slide topic
- Generate {bullet_guide} bullet points per slide
- Image prompts should match {image_style} style
- NO imagePrompt for slides with charts

Generate the {num_slides} slides now, preserving ALL section titles EXACTLY and adding charts every 3rd slide."""

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

            # ✅ CRITICAL FIX: Force charts on specific slides
                chart_positions = [2, 5, 8, 11, 14]  # 0-indexed: slides 3, 6, 9, 12, 15
            
                for i, slide in enumerate(slides):
                    if i < len(outline_sections):
                    # Force the exact title from the outline section
                        slide["title"] = outline_sections[i]["title"]

                    # If content is empty or too generic, use section content
                        if not slide.get("content") or len(slide.get("content", "")) < 20:
                            section_content = outline_sections[i].get("content", "")
                            if section_content and not section_content.startswith("•"):
                                sentences = [s.strip() for s in section_content.split('.') if s.strip()]
                                slide["content"] = "\n".join([f"• {s}" for s in sentences[:5]])
                            else:
                                slide["content"] = section_content
                    
                    # ✅ FORCE CHART on specific positions
                        if i in chart_positions:
                            # Generate contextual chart data
                            slide["chartData"] = self._generate_contextual_chart(slide, outline_sections[i]["title"])
                            slide["imagePrompt"] = ""  # No image for chart slides
                            print(f"  ✅ FORCED CHART on slide {i+1}: {slide['title'][:50]}")
                        else:
                        # Ensure no chart for non-chart slides
                            if not slide.get("chartData") or not slide["chartData"].get("needed"):
                                slide["chartData"] = {"needed": False}
                        # Ensure image prompt exists
                            if not slide.get("imagePrompt"):
                                slide["imagePrompt"] = f"{outline_sections[i]['title']}, {image_style} style, professional"

            # Ensure we have exactly the right number of slides
                if len(slides) < num_slides:
                    print(f"⚠️ Only {len(slides)} slides generated, filling remaining...")
                    for i in range(len(slides), num_slides):
                        section = outline_sections[i]
                        section_content = section.get('content', '')

                        if section_content and not section_content.startswith("•"):
                            sentences = [s.strip() for s in section_content.split('.') if s.strip()]
                            formatted_content = "\n".join([f"• {s}" for s in sentences[:5]])
                        else:
                            formatted_content = section_content or f"• Key point 1\n• Key point 2\n• Key point 3"

                        new_slide = {
                            "type": "content",
                            "title": section["title"],
                            "content": formatted_content,
                            "imagePrompt": f"{section['title']}, {image_style} style, professional",
                            "layout": "split",
                            "chartData": {"needed": False}
                        }
                    
                    # Check if this position should have a chart
                        if i in chart_positions:
                            new_slide["chartData"] = self._generate_contextual_chart(new_slide, section["title"])
                            new_slide["imagePrompt"] = ""
                            print(f"  ✅ FORCED CHART on added slide {i+1}")
                    
                        slides.append(new_slide)
                elif len(slides) > num_slides:
                    slides = slides[:num_slides]

            # Final validation
                chart_count = sum(1 for s in slides if s.get("chartData", {}).get("needed", False))
                expected_charts = len([p for p in chart_positions if p < len(slides)])
            
                print(f"✅ Generated {len(slides)} slides with {chart_count} charts (expected {expected_charts})")
            
                data["slides"] = slides
                return data
            else:
                raise Exception("No valid JSON found")

        except Exception as e:
            print(f"❌ Error generating from outline: {e}")
            return self._create_fallback_from_outline(outline_sections, theme, image_style)

    def _create_fallback_from_outline(
        self, 
        outline_sections: List[Dict], 
        theme: str,
        image_style: str
    ) -> Dict:
        """Create slides directly from outline sections - PRESERVING EXACT TITLES"""
        slides = []

        for i, section in enumerate(outline_sections):
            # ✅ Use exact section title - no modifications
            section_title = section.get('title', f'Section {i+1}')
            section_content = section.get('content', '')

            # Format content as bullets if needed
            if section_content and not section_content.startswith("•"):
                sentences = [s.strip() for s in section_content.split('.') if s.strip()]
                formatted_content = "\n".join([f"• {s}" for s in sentences[:5]])
            else:
                formatted_content = section_content or f"• Key insight\n• Supporting detail\n• Takeaway"

            slide = {
                "type": "content",
                "title": section_title,  # ✅ Exact title from section
                "content": formatted_content,
                "imagePrompt": f"{section_title}, {image_style} style, professional, high quality",
                "layout": "split",
                "chartData": {"needed": False}
            }
            slides.append(slide)

        return {
            "title": outline_sections[0].get('title', 'Presentation') if outline_sections else 'Presentation',
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
                if i > 0:
                    await asyncio.sleep(0.5)
                    
                print(f"  Processing slide {i+1}/{len(slides)}: {slide.get('title')}")
                chart_data = slide.get("chartData", {})
                has_chart = chart_data.get("needed", False)

            # ✅ CRITICAL FIX: Check if chartData has actual data
                if has_chart and chart_data:
                # Validate that chartData has required fields
                    if all(k in chart_data for k in ['type', 'labels', 'values']):
                        slide["imageUrl"] = ""  # No image if chart exists
                        try:
                            chart_url = self._render_chart(chart_data)
                            slide["chartUrl"] = chart_url if chart_url else ""
                            print(f"    📊 Chart generated ({chart_data.get('type', 'bar')})")
                        except Exception as chart_error:
                            print(f"    ❌ Chart error: {chart_error}")
                            slide["chartUrl"] = ""
                    else:
                        print(f"    ⚠️ Invalid chartData structure, skipping chart")
                        has_chart = False
                        slide["chartUrl"] = ""
                else:
                    slide["chartUrl"] = ""

            # Generate image only if no chart
                if not has_chart:
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

            # Set layout based on content
                slide["layout"] = "split"  # Default layout for all slides

                enhanced.append(slide)

            except Exception as e:
                print(f"  ❌ Critical error on slide {i+1}: {e}")
                slide.setdefault("chartUrl", "")
                slide.setdefault("imageUrl", "")
                slide.setdefault("layout", "split")
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
        # Clean and enhance prompt
            clean_prompt = prompt.strip()
            if len(clean_prompt) < 10:
                clean_prompt = f"{clean_prompt} professional illustration"

        # Add quality keywords
            enhanced_prompt = f"{clean_prompt}, high quality, professional, detailed, 4k"
        
        # URL encode properly
            encoded_prompt = urllib.parse.quote(enhanced_prompt)

        # Build URL with optimal parameters
            image_url = (
                f"{self.pollinations_url}{encoded_prompt}"
                f"?width=1920&height={height}&nologo=true&enhance=true&model=flux"
            )
        
            print(f"    🎨 Generated Pollinations URL")
        
        # ✅ NO VALIDATION - Pollinations generates images on-demand
            return image_url
        
        except Exception as e:
            print(f"    ❌ Pollinations error: {e}")
        # Fallback to simple URL
            safe_prompt = urllib.parse.quote("professional presentation background")
            return f"{self.pollinations_url}{safe_prompt}?width=1920&height={height}&nologo=true"  
          
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
    
    # Replace the summarize_document and generate_outline methods in ai_service.py

    async def summarize_document(self, document_content: str, filename: str, outline_only: bool = False):
        """Intelligently summarize document with AI-generated contextual content"""
        try:
            if outline_only:
                # ✅ SIMPLIFIED PROMPT - Forces JSON output
                system_prompt = """You are a document analyzer that outputs ONLY valid JSON.

CRITICAL RULES:
1. Return ONLY raw JSON - no markdown, no explanations, no code blocks
2. Create exactly 10 sections
3. Each section has "title" (string) and "content" (string with 3 bullet points)
4. Bullet points use • character
5. No extra text before or after JSON

Output format:
{"title":"Document Title","sections":[{"title":"Section Title","content":"• Point 1\\n• Point 2\\n• Point 3"}]}"""

                user_prompt = f"""Analyze this document and create 10 sections as JSON:

{document_content[:3500]}

Requirements:
- 10 sections with specific titles (not generic)
- Each section: 3 bullets with • character
- Each bullet: 15-20 words
- Return ONLY raw JSON (no markdown blocks)

JSON output:"""

                # ✅ CRITICAL FIX: Increased max_tokens to 20000
                response = await self.call_openrouter_api(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    model=self.default_model,
                    temperature=0.7,
                    max_tokens=20000
                )

                # ✅ ENHANCED CLEANING
                response = response.strip()
                
                # Remove ALL markdown artifacts
                response = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'^```\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'\s*```$', '', response, flags=re.MULTILINE)
                response = response.strip()
                
                # Remove "markdown" prefix if present
                if response.lower().startswith('markdown'):
                    response = response[8:].strip()
                
                print(f"🔍 Cleaned response preview: {response[:200]}")

                # ✅ ROBUST JSON EXTRACTION
                data = None
                
                # Try 1: Direct JSON parse
                try:
                    data = json.loads(response)
                    print("✅ Direct JSON parse successful")
                except json.JSONDecodeError as e:
                    print(f"⚠️ Direct parse failed: {e}")
                    
                    # Try 2: Find JSON object with regex
                    json_pattern = r'\{[^{}]*"sections"[^{}]*\[[^\]]*\][^{}]*\}'
                    match = re.search(json_pattern, response, re.DOTALL)
                    
                    if match:
                        try:
                            data = json.loads(match.group(0))
                            print("✅ Regex extraction successful")
                        except:
                            pass
                    
                    # Try 3: Fix incomplete JSON
                    if not data and response.strip().startswith('{'):
                        # Find last complete section
                        last_complete = response.rfind('"}')
                        if last_complete > 0:
                            # Try to close the JSON properly
                            fixed_json = response[:last_complete + 2]
                            
                            # Count braces to determine what's missing
                            open_braces = fixed_json.count('[')
                            close_braces = fixed_json.count(']')
                            
                            if open_braces > close_braces:
                                fixed_json += ']'
                            
                            open_curly = fixed_json.count('{')
                            close_curly = fixed_json.count('}')
                            
                            if open_curly > close_curly:
                                fixed_json += '}'
                            
                            try:
                                data = json.loads(fixed_json)
                                print("✅ Fixed incomplete JSON")
                            except Exception as fix_error:
                                print(f"❌ Could not fix JSON: {fix_error}")

                # ✅ VALIDATION
                if not data:
                    raise Exception(f"Failed to parse JSON. Response preview: {response[:500]}")
                
                if "sections" not in data:
                    raise Exception("Missing 'sections' key in response")
                
                sections = data.get("sections", [])
                
                if not sections:
                    raise Exception("Empty sections array")

                # ✅ CLEAN AND VALIDATE SECTIONS
                validated_sections = []
                
                for i, section in enumerate(sections):
                    title = section.get("title", "").strip()
                    content = section.get("content", "").strip()
                    
                    # Skip invalid sections
                    if not title or len(title) < 5:
                        print(f"⚠️ Skipping section {i+1}: invalid title")
                        continue
                    
                    if not content or len(content) < 20:
                        print(f"⚠️ Skipping section {i+1}: insufficient content")
                        continue
                    
                    # Ensure bullet formatting
                    if "•" not in content:
                        lines = [l.strip() for l in content.split("\n") if l.strip()]
                        content = "\n".join([f"• {line}" if not line.startswith("•") else line for line in lines[:3]])
                    
                    validated_sections.append({
                        "title": title,
                        "content": content
                    })

                # ✅ ENSURE 8-15 SECTIONS
                if len(validated_sections) < 8:
                    print(f"⚠️ Only {len(validated_sections)} sections, padding to 8")
                    while len(validated_sections) < 8:
                        validated_sections.append({
                            "title": f"Key Point {len(validated_sections) + 1}",
                            "content": "• Important insight\n• Supporting detail\n• Key takeaway"
                        })
                
                if len(validated_sections) > 15:
                    print(f"⚠️ Limiting to 15 sections")
                    validated_sections = validated_sections[:15]

                print(f"✅ Successfully generated {len(validated_sections)} sections")

                return {
                    "title": data.get("title", f"Analysis: {filename}"),
                    "description": "Document analysis",
                    "sections": validated_sections
                }

            else:
                # Full slides mode - similar improvements
                system_prompt = """Create 10 presentation slides from document. Return ONLY raw JSON.
Each slide: title, 3 bullets, chart if data-heavy.
No markdown blocks - just raw JSON."""

                user_prompt = f"""Create 10 slides from: {document_content[:3500]}

Return raw JSON only."""

                response = await self.call_openrouter_api(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.7,
                    max_tokens=20000
                )

                # Same cleaning process
                response = response.strip()
                response = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'^```\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'\s*```$', '', response, flags=re.MULTILINE)
                if response.lower().startswith('markdown'):
                    response = response[8:].strip()

                data = json.loads(response)
                raw_slides = data.get("slides", [])
                
                slides = []
                for i, slide_data in enumerate(raw_slides[:10]):
                    slide = {
                        "type": "content",
                        "title": slide_data.get("title", f"Slide {i+1}"),
                        "content": slide_data.get("content", ""),
                        "layout": "split",
                        "chartData": slide_data.get("chartData", {"needed": False}),
                        "imagePrompt": f"{slide_data.get('title', '')} professional",
                        "id": f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}"
                    }
                    slides.append(slide)

                slides = await self._add_media_assets(slides)

                return {
                    "title": data.get("title", f"Summary: {filename}"),
                    "description": "Document presentation",
                    "slides": slides,
                    "theme": "modern"
                }

        except Exception as e:
            print(f"❌ summarize_document error: {e}")
            traceback.print_exc()
            raise Exception(f"Failed to process document: {str(e)}")


    async def generate_outline(self, content: str):
        """Generate 8-15 section outline with AI-generated contextual titles and bullet points"""
        try:
            # ✅ SIMPLIFIED PROMPT - Forces JSON output
            system_prompt = """You are an expert document analyzer that outputs ONLY valid JSON.

CRITICAL RULES:
1. Return ONLY raw JSON - no markdown, no code blocks, no explanations
2. Create EXACTLY 10 sections
3. Each section: "title" (specific, not generic) and "content" (3 bullet points with •)
4. Titles must be specific to the content (never generic like "Section 1")
5. Each bullet: 15-20 words

Output ONLY this JSON structure:
{"title":"Main Title","sections":[{"title":"Specific Title","content":"• Point 1\\n• Point 2\\n• Point 3"}]}"""

            user_prompt = f"""Create an outline with EXACTLY 10 sections for this content:

CONTENT:
{content[:4000]}

Requirements:
- 10 section titles that are SPECIFIC to this topic
- Each section has exactly 3 bullet points using •
- Use real information from the content
- Return ONLY raw JSON (no markdown, no extra text)

JSON output:"""

            # ✅ CRITICAL: Increased max_tokens
            response = await self.call_openrouter_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=self.default_model,
                temperature=0.7,
                max_tokens=20000
            )

            # ✅ ENHANCED CLEANING
            response = response.strip()
            
            # Remove ALL markdown artifacts
            response = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
            response = re.sub(r'^```\s*', '', response, flags=re.MULTILINE)
            response = re.sub(r'\s*```$', '', response, flags=re.MULTILINE)
            response = response.strip()
            
            # Remove "markdown" prefix
            if response.lower().startswith('markdown'):
                response = response[8:].strip()

            print(f"🔍 Response length: {len(response)} chars")
            print(f"🔍 Response preview: {response[:200]}")

            # ✅ ROBUST JSON PARSING
            data = None
            
            # Try 1: Direct parse
            try:
                data = json.loads(response)
                print("✅ Direct JSON parse successful")
            except json.JSONDecodeError as e:
                print(f"⚠️ Direct parse failed: {e}")
                
                # Try 2: Regex extraction
                match = re.search(r'\{.*?"sections".*?\[.*?\].*?\}', response, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(0))
                        print("✅ Regex extraction successful")
                    except:
                        pass
                
                # Try 3: Fix incomplete JSON
                if not data and response.startswith('{'):
                    last_complete = response.rfind('"}')
                    if last_complete > 0:
                        fixed_json = response[:last_complete + 2]
                        
                        # Balance brackets
                        if fixed_json.count('[') > fixed_json.count(']'):
                            fixed_json += ']'
                        if fixed_json.count('{') > fixed_json.count('}'):
                            fixed_json += '}'
                        
                        try:
                            data = json.loads(fixed_json)
                            print("✅ Fixed incomplete JSON")
                        except Exception as fix_error:
                            print(f"❌ Could not fix JSON: {fix_error}")

            if not data:
                raise Exception(f"Failed to parse JSON. Response: {response[:500]}")

            if "sections" not in data:
                raise Exception("Invalid response - missing sections")

            sections = data.get("sections", [])
            
            if not sections:
                raise Exception("Empty sections array")

            # ✅ VALIDATE AND CLEAN
            validated_sections = []
            
            for i, section in enumerate(sections):
                title = section.get("title", "").strip()
                content_text = section.get("content", "").strip()
                
                if not title or len(title) < 5:
                    print(f"⚠️ Skipping section {i+1}: invalid title")
                    continue
                
                if not content_text or len(content_text) < 20:
                    print(f"⚠️ Skipping section {i+1}: insufficient content")
                    continue
                
                # Ensure bullet formatting
                if "•" not in content_text:
                    lines = [l.strip() for l in content_text.split("\n") if l.strip()]
                    content_text = "\n".join([f"• {line}" if not line.startswith("•") else line for line in lines[:3]])
                
                validated_sections.append({
                    "title": title,
                    "content": content_text
                })

            # ✅ ENSURE 8-15 SECTIONS
            if len(validated_sections) < 8:
                print(f"⚠️ Only {len(validated_sections)} sections, padding to 8")
                while len(validated_sections) < 8:
                    validated_sections.append({
                        "title": f"Key Insight {len(validated_sections) + 1}",
                        "content": "• Important point\n• Supporting detail\n• Key takeaway"
                    })
            
            if len(validated_sections) > 15:
                print(f"⚠️ Limiting to 15 sections")
                validated_sections = validated_sections[:15]

            print(f"✅ Successfully generated {len(validated_sections)} sections")
            
            # Log titles
            for i, section in enumerate(validated_sections):
                print(f"   {i+1}. {section['title'][:60]}")

            return {
                "title": data.get("title", "Strategic Presentation"),
                "sections": validated_sections
            }

        except Exception as e:
            print(f"❌ Critical error in generate_outline: {e}")
            traceback.print_exc()
            raise Exception(f"Failed to generate outline: {str(e)}")

    async def summarize_document(self, document_content: str, filename: str, outline_only: bool = False):
        """Intelligently summarize document with AI-generated contextual content"""
        try:
            if outline_only:
                system_prompt = """You are a document analyzer that outputs ONLY valid JSON.

CRITICAL RULES:
1. Return ONLY raw JSON - no markdown, no explanations, no code blocks
2. Create exactly 10 sections
3. Each section has "title" (string) and "content" (string with 3 bullet points)
4. Bullet points use • character
5. No extra text before or after JSON

Output format:
{"title":"Document Title","sections":[{"title":"Section Title","content":"• Point 1\\n• Point 2\\n• Point 3"}]}"""

                user_prompt = f"""Analyze this document and create 10 sections as JSON:
                {document_content[:3500]}

Requirements:
- 10 sections with specific titles (not generic)
- Each section: 3 bullets with • character
- Each bullet: 15-20 words
- Return ONLY raw JSON (no markdown blocks)

JSON output:"""

            # ✅ CRITICAL FIX: Increased max_tokens to 20000
                response = await self.call_openrouter_api(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    model=self.default_model,
                    temperature=0.7,  # Lower temp for more consistent JSON
                    max_tokens=20000  # ✅ Increased from 16000
                )

            # ✅ ENHANCED CLEANING
                response = response.strip()
            
            # Remove ALL markdown artifacts
                response = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'^```\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'\s*```$', '', response, flags=re.MULTILINE)
                response = response.strip()
            
            # Remove "markdown" prefix if present
                if response.lower().startswith('markdown'):
                    response = response[8:].strip()
            
                print(f"🔍 Cleaned response preview: {response[:200]}")

            # ✅ ROBUST JSON EXTRACTION
                data = None
            
            # Try 1: Direct JSON parse
                try:
                    data = json.loads(response)
                    print("✅ Direct JSON parse successful")
                except json.JSONDecodeError as e:
                    print(f"⚠️ Direct parse failed: {e}")
                
                # Try 2: Find JSON object with regex
                    json_pattern = r'\{[^{}]*"sections"[^{}]*\[[^\]]*\][^{}]*\}'
                    match = re.search(json_pattern, response, re.DOTALL)
                
                    if match:
                        try:
                            data = json.loads(match.group(0))
                            print("✅ Regex extraction successful")
                        except:
                            pass
                
                # Try 3: Fix incomplete JSON
                    if not data and response.strip().startswith('{'):
                        # Find last complete section
                        last_complete = response.rfind('"}')
                        if last_complete > 0:
                        # Try to close the JSON properly
                            fixed_json = response[:last_complete + 2]
                        
                        # Count braces to determine what's missing
                            open_braces = fixed_json.count('[')
                            close_braces = fixed_json.count(']')
                        
                            if open_braces > close_braces:
                                fixed_json += ']'
                        
                            open_curly = fixed_json.count('{')
                            close_curly = fixed_json.count('}')
                        
                            if open_curly > close_curly:
                                fixed_json += '}'
                        
                            try:
                                data = json.loads(fixed_json)
                                print("✅ Fixed incomplete JSON")
                            except Exception as fix_error:
                                print(f"❌ Could not fix JSON: {fix_error}")

            # ✅ VALIDATION
                if not data:
                    raise Exception(f"Failed to parse JSON. Response preview: {response[:500]}")
            
                if "sections" not in data:
                    raise Exception("Missing 'sections' key in response")
            
                sections = data.get("sections", [])

                if not sections:
                    raise Exception("Empty sections array")

            # ✅ CLEAN AND VALIDATE SECTIONS
                validated_sections = []
            
                for i, section in enumerate(sections):
                    title = section.get("title", "").strip()
                    content = section.get("content", "").strip()
                
                # Skip invalid sections
                    if not title or len(title) < 5:
                        print(f"⚠️ Skipping section {i+1}: invalid title")
                        continue
                
                    if not content or len(content) < 20:
                        print(f"⚠️ Skipping section {i+1}: insufficient content")
                        continue
                
                # Ensure bullet formatting
                    if "•" not in content:
                        lines = [l.strip() for l in content.split("\n") if l.strip()]
                        content = "\n".join([f"• {line}" if not line.startswith("•") else line for line in lines[:3]])
                
                    validated_sections.append({
                        "title": title,
                        "content": content
                    })

            # ✅ ENSURE 8-15 SECTIONS
                if len(validated_sections) < 8:
                    print(f"⚠️ Only {len(validated_sections)} sections, padding to 8")
                    while len(validated_sections) < 8:
                        validated_sections.append({
                            "title": f"Key Point {len(validated_sections) + 1}",
                            "content": "• Important insight\n• Supporting detail\n• Key takeaway"
                        })
            
                if len(validated_sections) > 15:
                    print(f"⚠️ Limiting to 15 sections")
                    validated_sections = validated_sections[:15]

                print(f"✅ Successfully generated {len(validated_sections)} sections")

                return {
                    "title": data.get("title", f"Analysis: {filename}"),
                    "description": "Document analysis",
                    "sections": validated_sections
            }

            else:
            # Full slides mode - similar improvements
                system_prompt = """Create 10 presentation slides from document. Return ONLY raw JSON.
Each slide: title, 3 bullets, chart if data-heavy.
No markdown blocks - just raw JSON."""

                user_prompt = f"""Create 10 slides from: {document_content[:3500]}

Return raw JSON only."""

                response = await self.call_openrouter_api(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.7,
                    max_tokens=20000  # ✅ Increased
                )

            # Same cleaning process
                response = response.strip()
                response = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'^```\s*', '', response, flags=re.MULTILINE)
                response = re.sub(r'\s*```$', '', response, flags=re.MULTILINE)
                if response.lower().startswith('markdown'):
                    response = response[8:].strip()

                data = json.loads(response)
                raw_slides = data.get("slides", [])
            
                slides = []
                for i, slide_data in enumerate(raw_slides[:10]):
                    slide = {
                        "type": "content",
                        "title": slide_data.get("title", f"Slide {i+1}"),
                        "content": slide_data.get("content", ""),
                        "layout": "split",
                        "chartData": slide_data.get("chartData", {"needed": False}),
                        "imagePrompt": f"{slide_data.get('title', '')} professional",
                        "id": f"slide_{i+1}_{int(datetime.now().timestamp() * 1000)}"
                    }
                    slides.append(slide)

                slides = await self._add_media_assets(slides)

                return {
                    "title": data.get("title", f"Summary: {filename}"),
                    "description": "Document presentation",
                    "slides": slides,
                    "theme": "modern"
                }

        except Exception as e:
            print(f"❌ summarize_document error: {e}")
            traceback.print_exc()
            raise Exception(f"Failed to process document: {str(e)}")
        
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