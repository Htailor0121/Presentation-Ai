import React from 'react'

const styles = [
  { id: 'photorealistic', name: 'Photorealistic', description: 'High-quality real-life style images' },
  { id: 'illustration', name: 'Illustration', description: 'Vector and drawn-style graphics' },
  { id: 'abstract', name: 'Abstract', description: 'Creative and artistic image styles' },
  { id: 'minimal', name: 'Minimal', description: 'Flat, clean and simple icons or graphics' },
  { id: '3d', name: '3D Render', description: 'Three-dimensional render visuals' },
]

const ImageStyleSelector = ({ selected, onChange }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-secondary-700 mb-3">Image Style</h3>
      <div className="grid grid-cols-1 gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selected === style.id
                ? 'border-primary-500 ring-2 ring-primary-400 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="font-semibold">{style.name}</div>
            <div className="text-xs text-secondary-600">{style.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageStyleSelector
