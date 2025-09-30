"""
Document processing service for PDF, PPT, and text files
"""
import os
import tempfile
from typing import Dict, Any
import PyPDF2
from pptx import Presentation
import re
import httpx

class DocumentProcessor:
    def __init__(self):
        self.supported_formats = ['.pdf', '.pptx', '.ppt', '.txt', '.docx']
    
    async def process_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process uploaded document and extract text content"""
        try:
            file_ext = os.path.splitext(filename)[1].lower()
            
            if file_ext == '.pdf':
                content = await self._extract_pdf_content(file_path)
            elif file_ext in ['.pptx', '.ppt']:
                content = await self._extract_ppt_content(file_path)
            elif file_ext == '.txt':
                content = await self._extract_txt_content(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            # Clean and structure the content
            structured_content = self._structure_content(content, filename)
            
            return {
                "success": True,
                "filename": filename,
                "content": structured_content,
                "word_count": len(content.split()),
                "char_count": len(content)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    async def _extract_pdf_content(self, file_path: str) -> str:
        """Extract text content from PDF"""
        content = []
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    if text.strip():
                        content.append(f"Page {page_num + 1}:\n{text}")
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
        
        return "\n\n".join(content)
    
    async def _extract_ppt_content(self, file_path: str) -> str:
        """Extract text content from PowerPoint presentation"""
        content = []
        try:
            presentation = Presentation(file_path)
            for slide_num, slide in enumerate(presentation.slides, 1):
                slide_content = []
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        slide_content.append(shape.text)
                
                if slide_content:
                    content.append(f"Slide {slide_num}:\n" + "\n".join(slide_content))
        except Exception as e:
            raise Exception(f"Error reading PowerPoint: {str(e)}")
        
        return "\n\n".join(content)
    
    async def _extract_txt_content(self, file_path: str) -> str:
        """Extract text content from text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    content = file.read()
            except Exception as e:
                raise Exception(f"Error reading text file: {str(e)}")
        except Exception as e:
            raise Exception(f"Error reading text file: {str(e)}")
        
        return content
    
    def _structure_content(self, content: str, filename: str) -> Dict[str, Any]:
        """Structure the extracted content"""
        # Clean the content
        cleaned_content = self._strip_html_like(content)
        cleaned_content = re.sub(r'\s+', ' ', cleaned_content).strip()
        
        # Split into sections (basic structure)
        sections = self._split_into_sections(cleaned_content)
        
        return {
            "raw_content": cleaned_content,
            "sections": sections,
            "summary": self._generate_basic_summary(cleaned_content),
            "key_topics": self._extract_key_topics(cleaned_content)
        }

    def _strip_html_like(self, text: str) -> str:
        """Remove basic HTML/XML tags and scripts/styles from text"""
        if not text:
            return ""
        # Remove script/style blocks
        text = re.sub(r'<\s*(script|style)[^>]*>[\s\S]*?<\s*/\s*\1\s*>', ' ', text, flags=re.IGNORECASE)
        # Remove tags
        text = re.sub(r'<[^>]+>', ' ', text)
        return text
    
    def _split_into_sections(self, content: str) -> list:
        """Split content into logical sections"""
        # Simple section splitting based on common patterns
        sections = []
        
        # Split by double newlines or common headers
        parts = re.split(r'\n\s*\n|^#+\s+|\n[A-Z][A-Z\s]{10,}:\n', content, flags=re.MULTILINE)
        
        for i, part in enumerate(parts):
            if part.strip():
                sections.append({
                    "title": f"Section {i + 1}",
                    "content": part.strip(),
                    "word_count": len(part.split())
                })
        
        return sections
    
    def _generate_basic_summary(self, content: str) -> str:
        """Generate a basic summary of the content"""
        words = content.split()
        if len(words) <= 100:
            return content
        
        # Take first 100 words as basic summary
        summary_words = words[:100]
        return " ".join(summary_words) + "..."
    
    def _extract_key_topics(self, content: str) -> list:
        """Extract key topics from content"""
        # Simple keyword extraction
        words = content.lower().split()
        
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
        
        # Count word frequency
        word_count = {}
        for word in words:
            if len(word) > 3 and word not in stop_words and word.isalpha():
                word_count[word] = word_count.get(word, 0) + 1
        
        # Get top 10 most frequent words
        sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
        return [word for word, count in sorted_words[:10]]

    async def fetch_url_content(self, url: str) -> Dict[str, Any]:
        """Fetch content from a URL and preprocess it"""
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=20.0) as client:
                resp = await client.get(url, headers={"User-Agent": "PresentationAI/1.0"})
                if resp.status_code != 200:
                    return {"success": False, "error": f"Failed to fetch URL: {resp.status_code}"}
                html = resp.text
                text = self._strip_html_like(html)
                structured = self._structure_content(text, url)
                return {
                    "success": True,
                    "filename": url,
                    "content": structured,
                    "word_count": len(structured["raw_content"].split()),
                    "char_count": len(structured["raw_content"]),
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def ingest_plain_text(self, text: str, name: str = "pasted_text") -> Dict[str, Any]:
        """Ingest pasted text and preprocess it"""
        try:
            structured = self._structure_content(text, name)
            return {
                "success": True,
                "filename": name,
                "content": structured,
                "word_count": len(structured["raw_content"].split()),
                "char_count": len(structured["raw_content"]),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

# Global instance
document_processor = DocumentProcessor()
