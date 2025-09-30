import React from 'react'
import { motion } from 'framer-motion'

const SlidePreview = ({ slide, className = '' }) => {
  const renderSlideContent = () => {
    switch (slide.layout) {
      case 'center':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full p-8">
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              {slide.title}
            </h1>
            <div className="text-lg leading-relaxed max-w-2xl">
              {slide.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
            {slide.imageUrl && (
              <div className="mt-8">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="max-w-md max-h-64 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        )

      case 'left':
        return (
          <div className="flex flex-col justify-center h-full p-8">
            <h1 className="text-3xl font-bold mb-6">
              {slide.title}
            </h1>
            <div className="text-lg leading-relaxed max-w-2xl">
              {slide.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
            {slide.imageUrl && (
              <div className="mt-6">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="max-w-sm max-h-48 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        )

      case 'right':
        return (
          <div className="flex flex-col justify-center h-full p-8 text-right">
            <h1 className="text-3xl font-bold mb-6">
              {slide.title}
            </h1>
            <div className="text-lg leading-relaxed max-w-2xl ml-auto">
              {slide.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
            {slide.imageUrl && (
              <div className="mt-6 flex justify-end">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="max-w-sm max-h-48 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        )

      case 'two-column':
        return (
          <div className="flex h-full p-8">
            <div className="flex-1 pr-4">
              <h1 className="text-3xl font-bold mb-6">
                {slide.title}
              </h1>
              <div className="text-lg leading-relaxed">
                {slide.content.split('\n').map((line, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex-1 pl-4 flex items-center justify-center">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-secondary-400">Image placeholder</span>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full p-8">
            <h1 className="text-4xl font-bold mb-6">
              {slide.title}
            </h1>
            <div className="text-lg leading-relaxed max-w-2xl">
              {slide.content}
            </div>
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
