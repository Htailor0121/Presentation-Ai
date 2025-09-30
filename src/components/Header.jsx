import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, FileText, Home } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">Presentation AI</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/editor"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.startsWith('/editor')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Editor</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
