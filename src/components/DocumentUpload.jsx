import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, File, Image, X, CheckCircle, Link as LinkIcon, Clipboard } from 'lucide-react'
import { presentationAPI } from '../services/api'
import toast from 'react-hot-toast'

const DocumentUpload = ({ onPresentationGenerated, onClose }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [documentContent, setDocumentContent] = useState(null)
  const [activeTab, setActiveTab] = useState('file') // file | url | paste
  const [inputUrl, setInputUrl] = useState('')
  const [inputText, setInputText] = useState('')

  const supportedFormats = ['.pdf', '.pptx', '.ppt', '.txt']
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    // Validate file type
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!supportedFormats.includes(fileExt)) {
      toast.error(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`)
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const uploadDocument = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await presentationAPI.uploadDocument(formData)
      setDocumentContent(response)
      toast.success('Document processed successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const ingestUrl = async () => {
    if (!inputUrl.trim()) return
    setIsProcessing(true)
    try {
      const response = await presentationAPI.ingestUrl(inputUrl.trim())
      setDocumentContent(response)
      toast.success('URL ingested successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to fetch URL')
    } finally {
      setIsProcessing(false)
    }
  }

  const ingestText = async () => {
    if (!inputText.trim()) return
    setIsProcessing(true)
    try {
      const response = await presentationAPI.ingestText(inputText.trim(), 'pasted_text')
      setDocumentContent(response)
      toast.success('Text ingested successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to ingest text')
    } finally {
      setIsProcessing(false)
    }
  }

  const generatePresentation = async () => {
    if (!documentContent) return

    setIsProcessing(true)
    try {
      const presentation = await presentationAPI.summarizeDocument({
        content: documentContent.content.raw_content,
        filename: documentContent.filename
      })

      onPresentationGenerated(presentation)
      toast.success('Presentation generated from document!')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate presentation. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    switch (ext) {
      case '.pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      case '.pptx':
      case '.ppt':
        return <File className="w-8 h-8 text-orange-500" />
      default:
        return <FileText className="w-8 h-8 text-blue-500" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">Upload Document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'file' && !uploadedFile && (
            /* Upload Area */
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-300 hover:border-secondary-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Drop your document here
              </h3>
              <p className="text-secondary-600 mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                onChange={handleFileInput}
                accept={supportedFormats.join(',')}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="btn-primary cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose File</span>
              </label>
              <p className="text-sm text-secondary-500 mt-4">
                Supported formats: PDF, PPTX, PPT, TXT (max 10MB)
              </p>
            </div>
          )}
          {activeTab === 'file' && uploadedFile && (
            /* File Preview and Processing */
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                {getFileIcon(uploadedFile.name)}
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900">{uploadedFile.name}</h4>
                  <p className="text-sm text-secondary-600">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null)
                    setDocumentContent(null)
                  }}
                  className="p-2 hover:bg-secondary-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-secondary-500" />
                </button>
              </div>

              {!documentContent ? (
                /* Upload Button */
                <div className="text-center">
                  <button
                    onClick={uploadDocument}
                    disabled={isProcessing}
                    className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Document...
                      </>
                    ) : (
                      'Process Document'
                    )}
                  </button>
                </div>
              ) : (
                /* Document Content Preview */
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Document processed successfully!</span>
                  </div>
                  
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h4 className="font-medium text-secondary-900 mb-2">Document Summary</h4>
                    <div className="text-sm text-secondary-600 space-y-1">
                      <p>Words: {documentContent.word_count.toLocaleString()}</p>
                      <p>Characters: {documentContent.char_count.toLocaleString()}</p>
                      <p>Sections: {documentContent.content.sections.length}</p>
                    </div>
                  </div>

                  <div className="bg-secondary-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                    <h4 className="font-medium text-secondary-900 mb-2">Preview</h4>
                    <p className="text-sm text-secondary-600">
                      {documentContent.content.summary}
                    </p>
                  </div>

                  <button
                    onClick={generatePresentation}
                    disabled={isProcessing}
                    className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Presentation...
                      </>
                    ) : (
                      <>
                        <Image className="w-5 h-5 mr-2" />
                        Generate Presentation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-secondary-400" />
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 input-field"
                />
                <button onClick={ingestUrl} disabled={isProcessing} className="btn-primary px-6">
                  {isProcessing ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Clipboard className="w-5 h-5 mt-2 text-secondary-400" />
                <textarea
                  rows={8}
                  placeholder="Paste text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 input-field"
                />
              </div>
              <div className="text-right">
                <button onClick={ingestText} disabled={isProcessing} className="btn-primary px-6">
                  {isProcessing ? 'Processing...' : 'Process'}
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div className="px-6 pb-6 flex items-center gap-3 border-t">
          <button onClick={() => setActiveTab('file')} className={`px-3 py-2 rounded ${activeTab==='file'?'bg-primary-50 text-primary-700':'text-secondary-600 hover:bg-secondary-50'}`}>File</button>
          <button onClick={() => setActiveTab('url')} className={`px-3 py-2 rounded ${activeTab==='url'?'bg-primary-50 text-primary-700':'text-secondary-600 hover:bg-secondary-50'}`}>URL</button>
          <button onClick={() => setActiveTab('paste')} className={`px-3 py-2 rounded ${activeTab==='paste'?'bg-primary-50 text-primary-700':'text-secondary-600 hover:bg-secondary-50'}`}>Paste Text</button>
        </div>
      </motion.div>
    </div>
  )
}

export default DocumentUpload
