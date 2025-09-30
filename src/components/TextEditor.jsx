import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const TextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  className = "" 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  const applyFormatting = (format) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let formattedText = ''
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `__${selectedText}__`
        break
      case 'bullet':
        const lines = selectedText.split('\n')
        formattedText = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
        break
      case 'number':
        const numberedLines = selectedText.split('\n')
        formattedText = numberedLines.map((line, index) => 
          line.trim() ? `${index + 1}. ${line}` : line
        ).join('\n')
        break
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  const formatButtons = [
    { icon: Bold, format: 'bold', tooltip: 'Bold' },
    { icon: Italic, format: 'italic', tooltip: 'Italic' },
    { icon: Underline, format: 'underline', tooltip: 'Underline' },
    { icon: List, format: 'bullet', tooltip: 'Bullet List' },
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Formatting Toolbar */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-0 bg-white border border-secondary-200 rounded-lg shadow-lg p-2 flex items-center space-x-1 z-10"
        >
          {formatButtons.map(({ icon: Icon, format, tooltip }) => (
            <button
              key={format}
              onClick={() => applyFormatting(format)}
              className="p-2 hover:bg-secondary-100 rounded transition-colors"
              title={tooltip}
            >
              <Icon className="w-4 h-4 text-secondary-600" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${className}`}
        rows={6}
      />
    </div>
  )
}

export default TextEditor
