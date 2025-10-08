import React from 'react'

const levels = [
  { id: 'minimal', name: 'Minimal', description: 'One-liners or keywords only' },
  { id: 'concise', name: 'Concise', description: 'Short sentences, easy to scan' },
  { id: 'detailed', name: 'Detailed', description: 'Paragraph-style explanations' },
  { id: 'extensive', name: 'Extensive', description: 'In-depth with multiple paragraphs' },
]

const ContentLevelSelector = ({ selected, onChange }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-secondary-700 mb-3">Content Level</h3>
      <div className="grid grid-cols-1 gap-3">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selected === level.id
                ? 'border-primary-500 ring-2 ring-primary-400 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="font-semibold">{level.name}</div>
            <div className="text-xs text-secondary-600">{level.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ContentLevelSelector
