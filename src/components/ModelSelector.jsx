import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronDown, Check } from 'lucide-react'
import { presentationAPI } from '../services/api'

const ModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [models, setModels] = useState([])
  const [defaultModel, setDefaultModel] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const response = await presentationAPI.getAvailableModels()
      setModels(response.models)
      setDefaultModel(response.default_model)
      
      // Set default model if none selected
      if (!selectedModel && response.default_model) {
        onModelChange(response.default_model)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
      // Set some default models if API fails
      setModels([
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Most capable model for complex tasks',
          context_length: 200000
        },
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          description: 'Fast and efficient model',
          context_length: 128000
        },
        {
          id: 'google/gemini-pro',
          name: 'Gemini Pro',
          description: 'Google\'s advanced model',
          context_length: 30720
        }
      ])
      setDefaultModel('anthropic/claude-3.5-sonnet')
      if (!selectedModel) {
        onModelChange('anthropic/claude-3.5-sonnet')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedModelData = models.find(model => model.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel.split('/').pop() || 'Unknown Model',
    description: ''
  }

  const popularModels = [
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'google/gemini-pro',
    'meta-llama/llama-3.1-405b-instruct'
  ]

  const filteredModels = models.filter(model => 
    popularModels.includes(model.id)
  ).sort((a, b) => {
    const aIndex = popularModels.indexOf(a.id)
    const bIndex = popularModels.indexOf(b.id)
    return aIndex - bIndex
  })

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between hover:border-secondary-400 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-primary-600" />
          <div className="text-left">
            <div className="text-sm font-medium text-secondary-900">
              {isLoading ? 'Loading models...' : selectedModelData.name}
            </div>
            {selectedModelData.description && (
              <div className="text-xs text-secondary-500">
                {selectedModelData.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs font-medium text-secondary-500 px-2 py-1 mb-1">
              Popular Models
            </div>
            {filteredModels.map((model) => (
              <button 
                key={model.id}
                onClick={() => {
                  onModelChange(model.id)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary-100 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-secondary-900">
                    {model.name}
                  </div>
                  {model.description && (
                    <div className="text-xs text-secondary-500">
                      {model.description}
                    </div>
                  )}
                  {model.context_length && (
                    <div className="text-xs text-secondary-400">
                      Context: {model.context_length.toLocaleString()} tokens
                    </div>
                  )}
                </div>
                {selectedModel === model.id && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ModelSelector
