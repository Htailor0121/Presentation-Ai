import React from 'react'
import { motion } from 'framer-motion'

const SlideTemplates = ({ onSelectTemplate }) => {
  const templates = [
    // Title Slides
    {
      name: 'Classic Title',
      preview: '🎯',
      template: {
        type: 'title',
        title: 'Your Title Here',
        content: 'Subtitle or description',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        layout: 'center'
      }
    },
    {
      name: 'Minimal Title',
      preview: '📄',
      template: {
        type: 'title',
        title: 'Clean & Simple',
        content: 'Minimalist design approach',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        layout: 'center'
      }
    },
    {
      name: 'Dark Title',
      preview: '🌙',
      template: {
        type: 'title',
        title: 'Dark Theme',
        content: 'Professional dark design',
        backgroundColor: '#1f2937',
        textColor: '#ffffff',
        layout: 'center'
      }
    },

    // Content Slides
    {
      name: 'Bullet Points',
      preview: '📝',
      template: {
        type: 'content',
        title: 'Key Points',
        content: '• First important point\n• Second key insight\n• Third main idea\n• Fourth crucial detail',
        backgroundColor: '#f8fafc',
        textColor: '#1f2937',
        layout: 'left'
      }
    },
    {
      name: 'Two Column',
      preview: '📊',
      template: {
        type: 'content',
        title: 'Comparison',
        content: 'Left side content\n\nRight side content\n\nCompare and contrast',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        layout: 'two-column'
      }
    },
    {
      name: 'Quote Slide',
      preview: '💬',
      template: {
        type: 'quote',
        title: 'Inspirational Quote',
        content: '"The only way to do great work is to love what you do."\n\n- Steve Jobs',
        backgroundColor: '#f0f9ff',
        textColor: '#1e40af',
        layout: 'center'
      }
    },

    // Image Slides
    {
      name: 'Image Focus',
      preview: '🖼️',
      template: {
        type: 'image',
        title: 'Visual Impact',
        content: 'Supporting text for your image',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        layout: 'two-column',
        imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop'
      }
    },
    {
      name: 'Hero Image',
      preview: '🎨',
      template: {
        type: 'image',
        title: 'Hero Section',
        content: 'Make a bold statement with a powerful image',
        backgroundColor: '#1f2937',
        textColor: '#ffffff',
        layout: 'center',
        imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop'
      }
    },

    // Chart Slides
    {
      name: 'Data Visualization',
      preview: '📈',
      template: {
        type: 'chart',
        title: 'Data Insights',
        content: 'Present your data clearly and effectively\n\n• Chart 1: Growth trends\n• Chart 2: Market analysis\n• Chart 3: Performance metrics',
        backgroundColor: '#f0fdf4',
        textColor: '#166534',
        layout: 'left'
      }
    },

    // Special Layouts
    {
      name: 'Timeline',
      preview: '⏰',
      template: {
        type: 'content',
        title: 'Project Timeline',
        content: 'Phase 1: Planning (Q1)\nPhase 2: Development (Q2)\nPhase 3: Testing (Q3)\nPhase 4: Launch (Q4)',
        backgroundColor: '#fef3c7',
        textColor: '#92400e',
        layout: 'left'
      }
    },
    {
      name: 'Process Flow',
      preview: '',
      template: {
        type: 'content',
        title: 'Process Overview',
        content: 'Step 1 → Step 2 → Step 3\n\nEach step builds upon the previous one to create a comprehensive solution.',
        backgroundColor: '#e0e7ff',
        textColor: '#3730a3',
        layout: 'center'
      }
    },
    {
      name: 'Team Introduction',
      preview: '👥',
      template: {
        type: 'content',
        title: 'Meet Our Team',
        content: 'John Doe - CEO\nJane Smith - CTO\nMike Johnson - Lead Developer\nSarah Wilson - Designer',
        backgroundColor: '#fdf2f8',
        textColor: '#be185d',
        layout: 'left'
      }
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Choose a Template</h3>
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {templates.map((template, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => onSelectTemplate(template.template)}
            className="p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="text-2xl mb-2">{template.preview}</div>
            <div className="text-sm font-medium text-secondary-900 group-hover:text-primary-700">
              {template.name}
            </div>
            <div className="text-xs text-secondary-500 mt-1">
              {template.template.type} • {template.template.layout}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default SlideTemplates
