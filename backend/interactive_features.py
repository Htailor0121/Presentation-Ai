from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import uuid

@dataclass
class Toggle:
    """Represents a collapsible text section"""
    id: str
    title: str
    content: str
    is_expanded: bool = False

@dataclass
class NestedCard:
    """Represents a sub-card embedded within a parent card"""
    id: str
    title: str
    content: str
    image_url: Optional[str] = None
    layout: str = "content"

@dataclass
class InteractiveSlide:
    """Enhanced slide with interactive features"""
    id: str
    title: str
    content: str
    image_url: Optional[str] = None
    layout: str = "content"
    toggles: List[Toggle] = None
    nested_cards: List[NestedCard] = None
    footnotes: List[str] = None
    
    def __post_init__(self):
        if self.toggles is None:
            self.toggles = []
        if self.nested_cards is None:
            self.nested_cards = []
        if self.footnotes is None:
            self.footnotes = []

class InteractiveFeatureManager:
    """Manages interactive features for presentations"""
    
    def __init__(self):
        pass
    
    def create_toggle(self, title: str, content: str, is_expanded: bool = False) -> Toggle:
        """Create a new toggle element"""
        return Toggle(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            is_expanded=is_expanded
        )
    
    def create_nested_card(self, title: str, content: str, image_url: str = None, layout: str = "content") -> NestedCard:
        """Create a new nested card"""
        return NestedCard(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            image_url=image_url,
            layout=layout
        )
    
    def add_toggle_to_slide(self, slide: Dict[str, Any], title: str, content: str) -> Dict[str, Any]:
        """Add a toggle to an existing slide"""
        if "toggles" not in slide:
            slide["toggles"] = []
        
        toggle = self.create_toggle(title, content)
        slide["toggles"].append({
            "id": toggle.id,
            "title": toggle.title,
            "content": toggle.content,
            "isExpanded": toggle.is_expanded
        })
        
        return slide
    
    def add_nested_card_to_slide(self, slide: Dict[str, Any], title: str, content: str, image_url: str = None) -> Dict[str, Any]:
        """Add a nested card to an existing slide"""
        if "nestedCards" not in slide:
            slide["nestedCards"] = []
        
        nested_card = self.create_nested_card(title, content, image_url)
        slide["nestedCards"].append({
            "id": nested_card.id,
            "title": nested_card.title,
            "content": nested_card.content,
            "imageUrl": nested_card.image_url,
            "layout": nested_card.layout
        })
        
        return slide
    
    def add_footnote_to_slide(self, slide: Dict[str, Any], footnote: str) -> Dict[str, Any]:
        """Add a footnote to an existing slide"""
        if "footnotes" not in slide:
            slide["footnotes"] = []
        
        slide["footnotes"].append(footnote)
        return slide
    
    def create_qa_slide(self, questions: List[str]) -> Dict[str, Any]:
        """Create a Q&A slide using toggles"""
        slide = {
            "type": "qa",
            "title": "Questions & Answers",
            "content": "Click on any question to reveal the answer",
            "layout": "qa",
            "backgroundColor": "#f8fafc",
            "textColor": "#1f2937",
            "toggles": []
        }
        
        for i, question in enumerate(questions):
            slide = self.add_toggle_to_slide(
                slide, 
                f"Q{i+1}: {question}", 
                f"This is the answer to question {i+1}. You can provide detailed explanations here."
            )
        
        return slide
    
    def create_comparison_slide(self, title: str, items: List[Dict[str, str]]) -> Dict[str, Any]:
        """Create a comparison slide using nested cards"""
        slide = {
            "type": "comparison",
            "title": title,
            "content": "Compare the following items:",
            "layout": "gallery",
            "backgroundColor": "#ffffff",
            "textColor": "#1f2937",
            "nestedCards": []
        }
        
        for item in items:
            slide = self.add_nested_card_to_slide(
                slide,
                item.get("title", "Item"),
                item.get("content", "Description"),
                item.get("image_url")
            )
        
        return slide
    
    def create_timeline_slide(self, title: str, events: List[Dict[str, str]]) -> Dict[str, Any]:
        """Create a timeline slide"""
        slide = {
            "type": "timeline",
            "title": title,
            "content": "Timeline of events:",
            "layout": "timeline",
            "backgroundColor": "#f0f9ff",
            "textColor": "#1e40af",
            "nestedCards": []
        }
        
        for event in events:
            slide = self.add_nested_card_to_slide(
                slide,
                event.get("date", "Date"),
                event.get("description", "Event description"),
                event.get("image_url")
            )
        
        return slide
    
    def enhance_slide_with_interactivity(self, slide: Dict[str, Any], interactivity_type: str = "auto") -> Dict[str, Any]:
        """Automatically enhance a slide with appropriate interactive features"""
        
        if interactivity_type == "auto":
            # Determine interactivity based on content
            content = slide.get("content", "").lower()
            title = slide.get("title", "").lower()
            
            if any(keyword in content for keyword in ["question", "q&a", "faq", "ask"]):
                return self._add_qa_features(slide)
            elif any(keyword in content for keyword in ["compare", "vs", "versus", "difference"]):
                return self._add_comparison_features(slide)
            elif any(keyword in content for keyword in ["timeline", "history", "chronology", "sequence"]):
                return self._add_timeline_features(slide)
            elif any(keyword in content for keyword in ["detail", "more info", "expand", "additional"]):
                return self._add_toggle_features(slide)
        
        return slide
    
    def _add_qa_features(self, slide: Dict[str, Any]) -> Dict[str, Any]:
        """Add Q&A features to a slide"""
        # Extract potential questions from content
        content = slide.get("content", "")
        lines = content.split('\n')
        
        questions = []
        for line in lines:
            if line.strip().endswith('?') or line.strip().startswith('Q:'):
                questions.append(line.strip())
        
        if questions:
            slide["toggles"] = []
            for i, question in enumerate(questions[:3]):  # Limit to 3 questions
                slide = self.add_toggle_to_slide(slide, question, f"Answer to question {i+1}")
        
        return slide
    
    def _add_comparison_features(self, slide: Dict[str, Any]) -> Dict[str, Any]:
        """Add comparison features to a slide"""
        slide["layout"] = "gallery"
        slide["nestedCards"] = []
        
        # Create sample comparison items
        slide = self.add_nested_card_to_slide(slide, "Option A", "First option details")
        slide = self.add_nested_card_to_slide(slide, "Option B", "Second option details")
        
        return slide
    
    def _add_timeline_features(self, slide: Dict[str, Any]) -> Dict[str, Any]:
        """Add timeline features to a slide"""
        slide["layout"] = "timeline"
        slide["nestedCards"] = []
        
        # Create sample timeline events
        slide = self.add_nested_card_to_slide(slide, "2023", "First milestone")
        slide = self.add_nested_card_to_slide(slide, "2024", "Second milestone")
        slide = self.add_nested_card_to_slide(slide, "2025", "Future goal")
        
        return slide
    
    def _add_toggle_features(self, slide: Dict[str, Any]) -> Dict[str, Any]:
        """Add toggle features to a slide"""
        slide["toggles"] = []
        
        # Create sample toggles
        slide = self.add_toggle_to_slide(slide, "More Details", "Additional information about this topic")
        slide = self.add_toggle_to_slide(slide, "Examples", "Real-world examples and use cases")
        
        return slide

# Global interactive feature manager instance
interactive_manager = InteractiveFeatureManager()
