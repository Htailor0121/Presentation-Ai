import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, FileText, Zap, Palette, Download, Share2, Upload } from 'lucide-react'
import { usePresentation } from '../context/PresentationContext'
import { presentationAPI } from '../services/api'
import ModelSelector from '../components/ModelSelector'
import DocumentUpload from '../components/DocumentUpload'
import toast from 'react-hot-toast'

const HomePage = () => {
  const navigate = useNavigate()
  const { dispatch } = usePresentation()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false)

  const handleGeneratePresentation = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to generate your presentation')
      return
    }

    setIsGenerating(true)
    
    try {
      // Call FastAPI backend to generate presentation
      const generatedPresentation = await presentationAPI.generatePresentation(prompt, selectedModel)
      
      // Convert API response to our internal format
      const newPresentation = {
        title: generatedPresentation.title,
        description: generatedPresentation.description,
        slides: generatedPresentation.slides.map(slide => ({
          ...slide,
          type: slide.type,
          layout: slide.layout,
        })),
        theme: generatedPresentation.theme,
      }

      dispatch({ type: 'CREATE_PRESENTATION', payload: newPresentation })
      toast.success('Presentation generated successfully!')
      navigate('/editor')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate presentation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDocumentPresentationGenerated = (presentation) => {
    // Convert API response to our internal format
    const newPresentation = {
      title: presentation.title,
      description: presentation.description,
      slides: presentation.slides.map(slide => ({
        ...slide,
        type: slide.type,
        layout: slide.layout,
      })),
      theme: presentation.theme,
    }

    dispatch({ type: 'CREATE_PRESENTATION', payload: newPresentation })
    setIsDocumentUploadOpen(false)
    navigate('/editor')
  }

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Generation',
      description: 'Create stunning presentations from simple text prompts using advanced AI technology.'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Beautiful Templates',
      description: 'Choose from a variety of professionally designed templates and themes.'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Easy Editing',
      description: 'Drag, drop, and customize your slides with our intuitive editor.'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Export Options',
      description: 'Export your presentations to PDF, PowerPoint, and other formats.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Create Stunning
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                {' '}Presentations{' '}
              </span>
              with AI
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Transform your ideas into professional presentations in seconds. 
              Just describe what you want, and our AI will create it for you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="space-y-4 mb-8">
              {/* Model Selection */}
              <div className="max-w-md mx-auto">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
              
              {/* Prompt Input */}
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your presentation... (e.g., 'A presentation about climate change solutions')"
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleGeneratePresentation()}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGeneratePresentation}
                    disabled={isGenerating || !prompt.trim()}
                    className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate from Text</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setIsDocumentUploadOpen(true)}
                    className="btn-secondary px-8 py-3 text-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center space-x-4 text-sm text-secondary-500"
          >
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Powered by AI
            </span>
            <span>•</span>
            <span>Free to use</span>
            <span>•</span>
            <span>No signup required</span>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose Presentation AI?
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Everything you need to create professional presentations quickly and easily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your First Presentation?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who are already creating amazing presentations with AI.
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <FileText className="w-5 h-5" />
            <span>Start Creating</span>
          </button>
        </div>
      </section>

      {/* Document Upload Modal */}
      {isDocumentUploadOpen && (
        <DocumentUpload
          onPresentationGenerated={handleDocumentPresentationGenerated}
          onClose={() => setIsDocumentUploadOpen(false)}
        />
      )}
    </div>
  )
}

export default HomePage
