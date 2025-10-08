import React from 'react'
import { motion } from 'framer-motion'

const SlidePreview = ({ slide, className = '' }) => {
  const hasChart = slide.chartUrl && slide.chartUrl.startsWith('data:image')

  const renderSlideContent = () => {
    switch (slide.layout) {
      case 'left':
        return (
          <div className="flex h-full p-8 gap-8 items-center">
            {/* Text Section */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>
              <div className="text-lg leading-relaxed">
                {slide.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
            {/* Media Section */}
            <div className="flex-1 flex justify-center items-center">
              {hasChart ? (
                <img src={slide.chartUrl} alt="Chart" className="max-w-full max-h-80 rounded-lg shadow-lg object-contain" />
              ) : slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} className="max-w-full max-h-80 rounded-lg shadow-lg object-contain" />
              ) : (
                <div className="w-full h-64 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-secondary-400">Image placeholder</span>
                </div>
              )}
            </div>
          </div>
        )

      case 'right':
        return (
          <div className="flex h-full p-8 gap-8 items-center">
            {/* Media Section */}
            <div className="flex-1 flex justify-center items-center">
              {hasChart ? (
                <img src={slide.chartUrl} alt="Chart" className="max-w-full max-h-80 rounded-lg shadow-lg object-contain" />
              ) : slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} className="max-w-full max-h-80 rounded-lg shadow-lg object-contain" />
              ) : (
                <div className="w-full h-64 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-secondary-400">Image placeholder</span>
                </div>
              )}
            </div>
            {/* Text Section */}
            <div className="flex-1 text-right">
              <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>
              <div className="text-lg leading-relaxed">
                {slide.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )

      case 'two-column':
        return (
          <div className="flex h-full p-8 gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>
              <div className="text-lg leading-relaxed">
                {slide.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {hasChart ? (
                <img src={slide.chartUrl} alt="Chart" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
              ) : slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="w-full h-64 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-secondary-400">Image placeholder</span>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full p-8">
            <h1 className="text-4xl font-bold mb-6">{slide.title}</h1>
            <div className="text-lg leading-relaxed max-w-2xl">{slide.content}</div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`slide-container w-full h-96 ${className}`}
      style={{
        backgroundColor: slide.backgroundColor,
        color: slide.textColor,
      }}
    >
      {renderSlideContent()}
    </motion.div>
  )
}

export default SlidePreview
