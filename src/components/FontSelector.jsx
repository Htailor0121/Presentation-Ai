import React from 'react'

const fonts = [
  { id: 'default', name: 'Default', fontFamily: 'sans-serif' },
  { id: 'serif', name: 'Serif', fontFamily: 'serif' },
  { id: 'mono', name: 'Monospace', fontFamily: 'monospace' },
  { id: 'playful', name: 'Playful', fontFamily: '"Comic Sans MS", cursive, sans-serif' },
  { id: 'modern', name: 'Modern', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
]

const FontSelector = ({ selected, onChange }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-secondary-700 mb-3">Font</h3>
      <div className="grid grid-cols-2 gap-3">
        {fonts.map((font) => (
          <button
            key={font.id}
            onClick={() => onChange(font.id)}
            className={`p-3 rounded-lg border transition-colors ${
              selected === font.id
                ? 'border-primary-500 ring-2 ring-primary-400'
                : 'border-secondary-200 hover:border-secondary-300'
            }`}
            style={{ fontFamily: font.fontFamily }}
          >
            <div className="text-lg mb-1">Aa</div>
            <div className="text-xs text-secondary-700">{font.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FontSelector
