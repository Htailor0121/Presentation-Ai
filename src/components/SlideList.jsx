import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Eye } from 'lucide-react'

const SlideList = ({
  slides,
  selectedSlideId,
  onSelectSlide,
  onDeleteSlide,
}) => {
  return (
    <div className="p-4 space-y-3">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
            selectedSlideId === slide.id
              ? 'border-primary-500 shadow-md'
              : 'border-secondary-200 hover:border-secondary-300'
          }`}
          onClick={() => onSelectSlide(slide.id)}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-secondary-500">
                Slide {index + 1}
              </span>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSlide(slide.id)
                  }}
                  className="p-1 text-secondary-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="text-sm font-medium text-secondary-900 mb-1 truncate">
              {slide.title}
            </div>
            
            <div className="text-xs text-secondary-500 truncate">
              {slide.content.slice(0, 50)}...
            </div>
          </div>

          {/* Slide Preview Thumbnail */}
          <div className="mx-3 mb-3">
            <div
              className="w-full h-20 rounded border"
              style={{
                backgroundColor: slide.backgroundColor,
                color: slide.textColor,
              }}
            >
              <div className="p-2 h-full flex flex-col justify-center">
                <div className="text-xs font-semibold truncate mb-1">
                  {slide.title}
                </div>
                <div className="text-xs opacity-75 line-clamp-2">
                  {slide.content.slice(0, 60)}...
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {slides.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="w-6 h-6 text-secondary-400" />
          </div>
          <p className="text-sm text-secondary-500">
            No slides yet. Add your first slide to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default SlideList
