import React, { useState } from 'react'

const ColorPicker = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const presetColors = [
    '#ffffff', '#000000', '#3b82f6', '#ef4444', '#10b981',
    '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280', '#1f2937',
    '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 rounded-lg border border-secondary-300 flex items-center justify-between px-3 hover:border-secondary-400 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-6 h-6 rounded border border-secondary-300"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-secondary-700">{color}</span>
        </div>
        <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 p-4">
          <div className="space-y-4">
            {/* Preset Colors */}
            <div>
              <h4 className="text-sm font-medium text-secondary-700 mb-2">Preset Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => {
                      onChange(presetColor)
                      setIsOpen(false)
                    }}
                    className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                      color === presetColor ? 'border-primary-500' : 'border-secondary-300'
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <h4 className="text-sm font-medium text-secondary-700 mb-2">Custom Color</h4>
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded border border-secondary-300 cursor-pointer"
              />
            </div>

            {/* Color Input */}
            <div>
              <label className="block text-xs font-medium text-secondary-700 mb-1">
                Hex Code
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close picker */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ColorPicker
