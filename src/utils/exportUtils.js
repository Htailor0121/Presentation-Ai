import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PptxGenJS from 'pptxgenjs'

// Convert image URL to base64 for PowerPoint safety
async function toBase64(url) {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error('Image fetch failed')
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn(`Image conversion failed for ${url}`, err)
    return null
  }
}

export const exportToPDF = async (presentation, slides) => {
  try {
    // Wait for fonts to load
    await document.fonts.ready.catch(() => {});
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'px', 
      format: [1920, 1080] 
    });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      if (!slide) {
        console.warn(`Slide ${i} is null/undefined, skipping`);
        continue;
      }

      console.log(`📸 Capturing slide ${i + 1}/${slides.length}`);

      try {
        if (i > 0) pdf.addPage();

        // Capture the slide with html2canvas
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: presentation.slides?.[i]?.backgroundColor || '#ffffff',
          logging: false,
          width: 1920,
          height: 1080,
          windowWidth: 1920,
          windowHeight: 1080
        });

        // Convert to image
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Add to PDF
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
        
        console.log(`✅ Slide ${i + 1} added to PDF`);
        
      } catch (err) {
        console.error(`❌ Failed to capture slide ${i + 1}:`, err);
      }
    }

    const fileName = `${presentation.title || 'presentation'}.pdf`;
    pdf.save(fileName);
    console.log(`✅ PDF saved: ${fileName}`);
    
    return true;
  } catch (error) {
    console.error('❌ PDF export error:', error);
    throw error;
  }
}

export const exportToPowerPoint = async (presentation) => {
  const pptx = new PptxGenJS()
  pptx.author = 'Presentation AI'
  pptx.company = 'Presentation AI'
  pptx.title = presentation.title
  pptx.subject = presentation.description

  for (const [index, slide] of presentation.slides.entries()) {
    const slideObj = pptx.addSlide()
    slideObj.background = { color: slide.backgroundColor }

    if (slide.title) {
      slideObj.addText(slide.title, {
        x: 1, y: 0.5, w: 8, h: 1,
        fontSize: 32, color: slide.textColor, bold: true,
        align: slide.layout === 'center' ? 'center' : 'left'
      })
    }

    if (slide.content) {
      const contentY = slide.title ? 1.8 : 1
      slideObj.addText(slide.content, {
        x: 1, y: contentY,
        w: slide.layout === 'two-column' ? 3.5 : 8,
        h: 4, fontSize: 18, color: slide.textColor,
        align: slide.layout === 'center' ? 'center' : 'left'
      })
    }

    if (slide.imageUrl) {
      const base64 = slide.imageUrl.startsWith('data:')
        ? slide.imageUrl
        : await toBase64(slide.imageUrl)

      if (base64) {
        slideObj.addImage({
          data: base64,
          x: slide.layout === 'two-column' ? 5 : 1,
          y: slide.layout === 'two-column' ? 1.8 : 3,
          w: slide.layout === 'two-column' ? 3.5 : 8,
          h: slide.layout === 'two-column' ? 4 : 3,
        })
      } else {
        console.warn(`Skipping image on slide ${index + 1}`)
      }
    }
  }

  await pptx.writeFile({ fileName: `${presentation.title}.pptx` })
}

export const exportToImages = async (presentation, slides) => {
  const images = []
  for (let i = 0; i < slides.length; i++) {
    try {
      const slide = slides[i]
      const canvas = await html2canvas(slide, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: presentation.slides[i]?.backgroundColor || '#ffffff'
      })
      images.push(canvas.toDataURL('image/png'))
    } catch (err) {
      console.error(`Image export failed for slide ${i + 1}`, err)
    }
  }
  return images
}

export const downloadImages = (images, presentationTitle) => {
  images.forEach((imgData, index) => {
    setTimeout(() => {
      const link = document.createElement('a')
      link.download = `${presentationTitle}_slide_${index + 1}.png`
      link.href = imgData
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, index * 300) // stagger to avoid Chrome blocking
  })
}
