import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, Type, Layout, Image, LayoutTemplate, Wand2 } from 'lucide-react'
import ColorPicker from './ColorPicker'
import SlideTemplates from './SlideTemplates'
import TextEditor from './TextEditor'
import { presentationAPI } from '../services/api'
import toast from 'react-hot-toast'

const SlideEditor = ({ slide, onUpdateSlide }) => {
  const [localSlide, setLocalSlide] = useState(slide)
  const [activeTab, setActiveTab] = useState('content')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  useEffect(() => {
    setLocalSlide(slide)
  }, [slide])

  const handleUpdate = (updates) => {
    const updatedSlide = { ...localSlide, ...updates }
    setLocalSlide(updatedSlide)
    onUpdateSlide(updatedSlide)
  }

  const handleGenerateImage = async () => {
    if (!localSlide.title && !localSlide.content) {
      toast.error('Please add a title or content to generate an image')
      return
    }

    setIsGeneratingImage(true)
    try {
      const imagePrompt = `${localSlide.title}: ${localSlide.content}`
      const response = await presentationAPI.generateImage(imagePrompt)
      handleUpdate({ imageUrl: response.image_url })
      toast.success('Image generated successfully!')
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const layoutOptions = [
    { value: 'center', label: 'Center', icon: '📄' },
    { value: 'left', label: 'Left Align', icon: '📝' },
    { value: 'right', label: 'Right Align', icon: '📋' },
    { value: 'two-column', label: 'Two Column', icon: '📊' },
  ]

  const slideTypes = [
    { value: 'title', label: 'Title Slide', icon: '🎯' },
    { value: 'content', label: 'Content', icon: '📄' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'chart', label: 'Chart', icon: '📊' },
    { value: 'quote', label: 'Quote', icon: '💬' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-secondary-200 mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          <Type className="w-4 h-4 inline mr-2" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'design'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Design
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 inline mr-2" />
          Templates
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Slide Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Slide Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slideTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleUpdate({ type: type.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      localSlide.type === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={localSlide.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="input-field"
                placeholder="Enter slide title..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Content
              </label>
              <TextEditor
                value={localSlide.content}
                onChange={(content) => handleUpdate({ content })}
                placeholder="Enter slide content..."
                className="h-32"
              />
            </div>

            {/* Layout */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                {layoutOptions.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => handleUpdate({ layout: layout.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      localSlide.layout === layout.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{layout.icon}</div>
                    <div className="text-sm font-medium">{layout.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL (for image slides) */}
            {localSlide.type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={localSlide.imageUrl || ''}
                      onChange={(e) => handleUpdate({ imageUrl: e.target.value })}
                      className="input-field flex-1"
                      placeholder="https://example.com/image.jpg or generate with AI"
                    />
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>AI Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                  {localSlide.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={localSlide.imageUrl}
                        alt="Slide preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : activeTab === 'templates' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <SlideTemplates onSelectTemplate={(template) => handleUpdate(template)} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Background Color
              </label>
              <ColorPicker
                color={localSlide.backgroundColor}
                onChange={(color) => handleUpdate({ backgroundColor: color })}
              />
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Text Color
              </label>
              <ColorPicker
                color={localSlide.textColor}
                onChange={(color) => handleUpdate({ textColor: color })}
              />
            </div>

            {/* Preset Color Schemes */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Quick Themes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { bg: '#ffffff', text: '#1f2937', name: 'Light' },
                  { bg: '#1f2937', text: '#ffffff', name: 'Dark' },
                  { bg: '#3b82f6', text: '#ffffff', name: 'Blue' },
                  { bg: '#10b981', text: '#ffffff', name: 'Green' },
                  { bg: '#f59e0b', text: '#ffffff', name: 'Orange' },
                  { bg: '#ef4444', text: '#ffffff', name: 'Red' },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleUpdate({
                      backgroundColor: theme.bg,
                      textColor: theme.text,
                    })}
                    className="p-3 rounded-lg border border-secondary-200 hover:border-secondary-300 transition-colors"
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{ backgroundColor: theme.bg }}
                    >
                      <div
                        className="p-2 text-sm font-medium"
                        style={{ color: theme.text }}
                      >
                        Aa
                      </div>
                    </div>
                    <div className="text-xs text-secondary-600">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SlideEditor
