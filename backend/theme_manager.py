import random
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class Theme:
    name: str
    primary_color: str
    secondary_color: str
    accent_color: str
    background_color: str
    text_color: str
    font_family: str
    image_style_keywords: List[str]

class ThemeManager:
    """Manages themes and layout rules for Gamma-style presentations"""
    
    def __init__(self):
        self.themes = self._initialize_themes()
        self.layout_templates = self._initialize_layout_templates()
    
    def _initialize_themes(self) -> Dict[str, Theme]:
        """Initialize built-in themes with style keywords"""
        return {
            "modern": Theme(
                name="Modern",
                primary_color="#3b82f6",
                secondary_color="#1e40af", 
                accent_color="#60a5fa",
                background_color="#ffffff",
                text_color="#1f2937",
                font_family="Inter, sans-serif",
                image_style_keywords=["modern", "clean", "minimalist", "flat design", "professional"]
            ),
            "dark": Theme(
                name="Dark",
                primary_color="#1f2937",
                secondary_color="#374151",
                accent_color="#6b7280",
                background_color="#111827",
                text_color="#f9fafb",
                font_family="Inter, sans-serif",
                image_style_keywords=["dark", "moody", "sophisticated", "high contrast", "professional"]
            ),
            "warm": Theme(
                name="Warm",
                primary_color="#f59e0b",
                secondary_color="#d97706",
                accent_color="#fbbf24",
                background_color="#fef3c7",
                text_color="#1f2937",
                font_family="Inter, sans-serif",
                image_style_keywords=["warm", "friendly", "approachable", "soft colors", "inviting"]
            ),
            "corporate": Theme(
                name="Corporate",
                primary_color="#1e40af",
                secondary_color="#1e3a8a",
                accent_color="#3b82f6",
                background_color="#f8fafc",
                text_color="#1e293b",
                font_family="Inter, sans-serif",
                image_style_keywords=["corporate", "professional", "business", "formal", "trustworthy"]
            ),
            "creative": Theme(
                name="Creative",
                primary_color="#8b5cf6",
                secondary_color="#7c3aed",
                accent_color="#a78bfa",
                background_color="#faf5ff",
                text_color="#1f2937",
                font_family="Inter, sans-serif",
                image_style_keywords=["creative", "artistic", "vibrant", "innovative", "inspiring"]
            )
        }
    
    def _initialize_layout_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize layout templates for different slide types"""
        return {
            "title": {
                "layout": "center",
                "background_style": "gradient",
                "text_alignment": "center",
                "image_position": "background"
            },
            "content": {
                "layout": "left",
                "background_style": "solid",
                "text_alignment": "left",
                "image_position": "right"
            },
            "two-column": {
                "layout": "two-column",
                "background_style": "solid",
                "text_alignment": "left",
                "image_position": "left"
            },
            "image-background": {
                "layout": "image-background",
                "background_style": "image",
                "text_alignment": "center",
                "image_position": "background"
            },
            "gallery": {
                "layout": "gallery",
                "background_style": "solid",
                "text_alignment": "center",
                "image_position": "multiple"
            },
            "timeline": {
                "layout": "timeline",
                "background_style": "solid",
                "text_alignment": "left",
                "image_position": "inline"
            }
        }
    
    def get_theme(self, theme_name: str = None) -> Theme:
        """Get a theme by name or return a random one"""
        if theme_name and theme_name in self.themes:
            return self.themes[theme_name]
        return random.choice(list(self.themes.values()))
    
    def get_layout_template(self, layout_type: str = None) -> Dict[str, Any]:
        """Get a layout template by type or return a random one"""
        if layout_type and layout_type in self.layout_templates:
            return self.layout_templates[layout_type]
        return random.choice(list(self.layout_templates.values()))
    
    def apply_theme_to_slide(self, slide: Dict[str, Any], theme: Theme, layout_type: str = None) -> Dict[str, Any]:
        """Apply theme and layout to a slide"""
        layout = self.get_layout_template(layout_type)
        
        # Apply theme colors
        slide["backgroundColor"] = theme.background_color
        slide["textColor"] = theme.text_color
        slide["primaryColor"] = theme.primary_color
        slide["secondaryColor"] = theme.secondary_color
        slide["accentColor"] = theme.accent_color
        
        # Apply layout
        slide["layout"] = layout["layout"]
        slide["backgroundStyle"] = layout["background_style"]
        slide["textAlignment"] = layout["text_alignment"]
        slide["imagePosition"] = layout["image_position"]
        
        # Add theme-specific image style keywords
        if "imagePrompt" in slide:
            style_keywords = ", ".join(theme.image_style_keywords)
            slide["imagePrompt"] = f"{slide['imagePrompt']}, {style_keywords}"
        
        return slide
    
    def get_available_themes(self) -> List[str]:
        """Get list of available theme names"""
        return list(self.themes.keys())
    
    def create_custom_theme(self, name: str, **kwargs) -> Theme:
        """Create a custom theme"""
        theme = Theme(
            name=name,
            primary_color=kwargs.get("primary_color", "#3b82f6"),
            secondary_color=kwargs.get("secondary_color", "#1e40af"),
            accent_color=kwargs.get("accent_color", "#60a5fa"),
            background_color=kwargs.get("background_color", "#ffffff"),
            text_color=kwargs.get("text_color", "#1f2937"),
            font_family=kwargs.get("font_family", "Inter, sans-serif"),
            image_style_keywords=kwargs.get("image_style_keywords", ["professional", "clean"])
        )
        self.themes[name] = theme
        return theme

# Global theme manager instance
theme_manager = ThemeManager()
