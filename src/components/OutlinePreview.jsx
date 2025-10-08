import React from 'react'
import { GripVertical } from 'lucide-react'

const OutlinePreview = ({ outline, onChange }) => {
  const handleTitleChange = (index, value) => {
    const newOutline = [...outline]
    newOutline[index].title = value
    onChange(newOutline)
  }

  const handleContentChange = (index, value) => {
    const newOutline = [...outline]
    newOutline[index].content = value
    onChange(newOutline)
  }

  return (
    <div className="space-y-6">
      {outline.map((slide, index) => (
        <div
          key={index}
          className="p-4 border border-secondary-200 rounded-lg bg-white shadow-sm"
        >
          <div className="flex items-center mb-3">
            <GripVertical className="w-4 h-4 text-secondary-400 mr-2" />
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleChange(index, e.target.value)}
              className="w-full text-lg font-semibold border-b border-transparent focus:border-primary-500 focus:outline-none"
              placeholder="Slide title..."
            />
          </div>
          <textarea
            value={slide.content}
            onChange={(e) => handleContentChange(index, e.target.value)}
            className="w-full text-sm text-secondary-700 border border-secondary-200 rounded-lg p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            rows={3}
            placeholder="Slide content..."
          />
        </div>
      ))}
    </div>
  )
}

export default OutlinePreview
