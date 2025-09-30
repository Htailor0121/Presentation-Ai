import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PptxGenJS from 'pptxgenjs'

export const exportToPDF = async (presentation, slides) => {
  await document.fonts?.ready?.catch(() => {})
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage()

    const slide = slides[i]
    const canvas = await html2canvas(slide, {
      scale: 2,
      useCORS: true,
      backgroundColor: presentation.slides?.[i]?.backgroundColor || '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const w = pageW
    const h = (canvas.height / canvas.width) * w
    const y = Math.max(0, (pageH - h) / 2)
    pdf.addImage(imgData, 'PNG', 0, y, w, h)
  }

  pdf.save(`${presentation.title || 'presentation'}.pdf`)
}

export const exportToPowerPoint = async (presentation) => {
  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'Presentation AI'
  pptx.company = 'Presentation AI'
  pptx.title = presentation.title
  pptx.subject = presentation.description

  // Add slides
  presentation.slides.forEach((slide, index) => {
    const slideObj = pptx.addSlide()

    // Set slide background
    slideObj.background = { color: slide.backgroundColor }

    // Add title
    if (slide.title) {
      slideObj.addText(slide.title, {
        x: 1,
        y: 0.5,
        w: 8,
        h: 1,
        fontSize: 32,
        color: slide.textColor,
        bold: true,
        align: slide.layout === 'center' ? 'center' : 'left'
      })
    }

    // Add content
    if (slide.content) {
      const contentY = slide.title ? 1.8 : 1
      slideObj.addText(slide.content, {
        x: 1,
        y: contentY,
        w: slide.layout === 'two-column' ? 3.5 : 8,
        h: 4,
        fontSize: 18,
        color: slide.textColor,
        align: slide.layout === 'center' ? 'center' : 'left'
      })
    }

    // Add image if present
    if (slide.imageUrl && slide.layout === 'two-column') {
      slideObj.addImage({
        data: slide.imageUrl,
        x: 5,
        y: 1.8,
        w: 3.5,
        h: 4
      })
    } else if (slide.imageUrl) {
      slideObj.addImage({
        data: slide.imageUrl,
        x: 1,
        y: 3,
        w: 8,
        h: 3
      })
    }
  })

  // Save the presentation
  pptx.writeFile({ fileName: `${presentation.title}.pptx` })
}

export const exportToImages = async (presentation, slides) => {
  const images = []

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const canvas = await html2canvas(slide, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: presentation.slides[i]?.backgroundColor || '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    images.push(imgData)
  }

  return images
}

export const downloadImages = (images, presentationTitle) => {
  images.forEach((imgData, index) => {
    const link = document.createElement('a')
    link.download = `${presentationTitle}_slide_${index + 1}.png`
    link.href = imgData
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}
