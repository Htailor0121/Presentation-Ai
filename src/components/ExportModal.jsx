import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Image, Presentation, Loader } from 'lucide-react'
import { exportToPDF, exportToPowerPoint, exportToImages, downloadImages } from '../utils/exportUtils'
import toast from 'react-hot-toast'

const ExportModal = ({ isOpen, onClose, presentation }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const slideRefs = useRef([])

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Export as a PDF file with all slides',
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'pptx',
      name: 'PowerPoint',
      description: 'Export as a PowerPoint presentation',
      icon: Presentation,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'images',
      name: 'Image Files',
      description: 'Export each slide as a separate image',
      icon: Image,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ]

  const handleExport = async () => {
    if (!presentation || presentation.slides.length === 0) {
      toast.error('No slides to export')
      return
    }

    setIsExporting(true)

    try {
      switch (exportFormat) {
        case 'pdf':
          await exportToPDF(presentation, slideRefs.current.filter(Boolean))
          toast.success('PDF exported successfully!')
          break

        case 'pptx':
          await exportToPowerPoint(presentation)
          toast.success('PowerPoint file exported successfully!')
          break

        case 'images':
          const images = await exportToImages(presentation, slideRefs.current.filter(Boolean))
          downloadImages(images, presentation.title)
          toast.success('Images exported successfully!')
          break

        default:
          throw new Error('Unsupported export format')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export presentation')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">Export Presentation</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {presentation.title}
              </h3>
              <p className="text-secondary-600">
                {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Export Format Selection */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-secondary-700">Choose export format:</h4>
              {exportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => setExportFormat(option.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      exportFormat === option.id
                        ? `${option.borderColor} ${option.bgColor}`
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${option.bgColor}`}>
                        <Icon className={`w-5 h-5 ${option.color}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-secondary-900">
                          {option.name}
                        </div>
                        <div className="text-sm text-secondary-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Hidden slide previews for export */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
              {presentation.slides.map((slide, index) => (
              <div
                key={slide.id}
                ref={(el) => (slideRefs.current[index] = el)}
                style={{
                  width: '1920px',
                  height: '1080px',
                  backgroundColor: slide.backgroundColor || '#ffffff',
                  color: slide.textColor || '#1f2937',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Slide Content */}
                <div style={{ padding: '80px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {/* Title */}
                  <h1 style={{ 
                    fontSize: '72px', 
                    fontWeight: 'bold', 
                    marginBottom: '40px',
                    color: slide.textColor || '#1f2937',
                    textAlign: slide.textAlign || 'left'
                  }}>
                    {slide.title}
                  </h1>
                  
                  {/* Content */}
                  <div style={{ 
                    fontSize: '36px', 
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: slide.textColor || '#1f2937',
                    textAlign: slide.textAlign || 'left'
                  }}>
                    {slide.content}
                  </div>
                  
                  {/* Image - Only if no chart */}
                  {slide.imageUrl && !slide.chartUrl && (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      style={{
                        marginTop: '40px',
                        maxWidth: '800px',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                      crossOrigin="anonymous"
                    />
                  )}
                  
                  {/* Chart - Takes priority over image */}
                  {slide.chartUrl && (
                    <img
                      src={slide.chartUrl}
                      alt="Chart"
                      style={{
                        marginTop: '40px',
                        maxWidth: '1200px',
                        maxHeight: '600px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

            {/* Export Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-800 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ExportModal
