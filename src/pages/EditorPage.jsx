import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Save, Download, Eye, ArrowLeft, X } from 'lucide-react'
import ExportModal from '../components/ExportModal'
import { usePresentation } from '../context/PresentationContext'
import SlideEditor from '../components/SlideEditor'
import SlidePreview from '../components/SlidePreview'
import DragDropSlideList from '../components/DragDropSlideList'
import toast from 'react-hot-toast'

const EditorPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = usePresentation()
  const [selectedSlideId, setSelectedSlideId] = useState(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isAllPreviewOpen, setIsAllPreviewOpen] = useState(false)

  const currentPresentation = state.currentPresentation

  useEffect(() => {
    if (id && currentPresentation?.id !== id) {
      const presentation = state.presentations.find(p => p.id === id)
      if (presentation) {
        dispatch({ type: 'SET_CURRENT_PRESENTATION', payload: presentation })
        if (presentation.slides.length > 0) {
          setSelectedSlideId(presentation.slides[0].id)
        }
      } else {
        navigate('/')
      }
    } else if (!currentPresentation) {
      // Create a new presentation if none exists
      const newPresentation = {
        title: 'Untitled Presentation',
        description: '',
        slides: [],
        theme: 'modern',
      }
      dispatch({ type: 'CREATE_PRESENTATION', payload: newPresentation })
    }
  }, [id, currentPresentation, state.presentations, dispatch, navigate])

  const handleAddSlide = () => {
    if (!currentPresentation) return

    const newSlide = {
      type: 'content',
      title: 'New Slide',
      content: 'Add your content here...',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      layout: 'left',
    }

    dispatch({
      type: 'ADD_SLIDE',
      payload: {
        presentationId: currentPresentation.id,
        slide: newSlide,
      },
    })

    // Select the new slide
    const newSlideId = currentPresentation.slides.length > 0 
      ? currentPresentation.slides[currentPresentation.slides.length - 1].id 
      : null
    setSelectedSlideId(newSlideId)
  }

  const handleUpdateSlide = (slide) => {
    if (!currentPresentation) return

    dispatch({
      type: 'UPDATE_SLIDE',
      payload: {
        presentationId: currentPresentation.id,
        slide,
      },
    })
  }

  const handleDeleteSlide = (slideId) => {
    if (!currentPresentation) return

    dispatch({
      type: 'DELETE_SLIDE',
      payload: {
        presentationId: currentPresentation.id,
        slideId,
      },
    })

    // Select another slide if the current one was deleted
    if (selectedSlideId === slideId) {
      const remainingSlides = currentPresentation.slides.filter(s => s.id !== slideId)
      setSelectedSlideId(remainingSlides.length > 0 ? remainingSlides[0].id : null)
    }
  }

  const handleReorderSlides = (slides) => {
    if (!currentPresentation) return

    dispatch({
      type: 'REORDER_SLIDES',
      payload: {
        presentationId: currentPresentation.id,
        slides,
      },
    })
  }

  const handleSavePresentation = () => {
    if (!currentPresentation) return

    dispatch({
      type: 'UPDATE_PRESENTATION',
      payload: currentPresentation,
    })
    toast.success('Presentation saved!')
  }

  const selectedSlide = currentPresentation?.slides.find(s => s.id === selectedSlideId)

  if (!currentPresentation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-secondary-900">
              {currentPresentation.title}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={() => setIsAllPreviewOpen(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview All</span>
            </button>
            <button
              onClick={handleSavePresentation}
              className="btn-secondary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Slide List Sidebar */}
        <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
          <div className="p-4 border-b border-secondary-200">
            <button
              onClick={handleAddSlide}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <DragDropSlideList
              slides={currentPresentation.slides}
              selectedSlideId={selectedSlideId}
              onSelectSlide={setSelectedSlideId}
              onDeleteSlide={handleDeleteSlide}
              onReorderSlides={handleReorderSlides}
            />
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {isPreviewMode ? (
            <div className="flex-1 flex items-center justify-center p-8">
              {selectedSlide ? (
                <SlidePreview slide={selectedSlide} />
              ) : (
                <div className="text-center text-secondary-500">
                  <p>Select a slide to preview</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex">
              {/* Slide Editor */}
              <div className="flex-1 p-8">
                {selectedSlide ? (
                  <SlideEditor
                    slide={selectedSlide}
                    onUpdateSlide={handleUpdateSlide}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-secondary-400" />
                      </div>
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        No slide selected
                      </h3>
                      <p className="text-secondary-500 mb-4">
                        Select a slide from the sidebar or add a new one
                      </p>
                      <button
                        onClick={handleAddSlide}
                        className="btn-primary"
                      >
                        Add Your First Slide
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Preview */}
              <div className="w-96 border-l border-secondary-200 p-6 bg-secondary-50">
                <h3 className="text-sm font-medium text-secondary-700 mb-4">
                  Preview
                </h3>
                {selectedSlide ? (
                  <div className="transform scale-50 origin-top-left">
                    <SlidePreview slide={selectedSlide} />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-white rounded-lg border-2 border-dashed border-secondary-300 flex items-center justify-center">
                    <p className="text-secondary-400 text-sm">No slide selected</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {currentPresentation && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          presentation={currentPresentation}
        />
      )}

      {/* Preview All Modal */}
      {isAllPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Preview All Slides</h3>
              <button onClick={() => setIsAllPreviewOpen(false)} className="p-2 hover:bg-secondary-100 rounded">
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPresentation.slides.map((s, i) => (
                <div key={s.id} id={`slide-capture-${i}`} className="bg-secondary-50 rounded-lg p-4">
                  <div className="mb-2 text-xs text-secondary-500">Slide {i + 1}</div>
                  <div className="border rounded-lg overflow-hidden">
                    <SlidePreview slide={s} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorPage
