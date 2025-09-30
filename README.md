# Presentation AI

An AI-powered presentation generator similar to Gamma AI. Create stunning presentations from simple text prompts using advanced AI technology.

## Features

- 🤖 **AI-Powered Generation**: Create presentations from text prompts
- 🎨 **Beautiful Templates**: Multiple slide layouts and themes
- ✏️ **Easy Editing**: Intuitive drag-and-drop editor
- 🎯 **Multiple Slide Types**: Title, content, image, chart, and quote slides
- 🎨 **Custom Styling**: Customize colors, fonts, and layouts
- 📱 **Responsive Design**: Works on desktop and mobile
- 📤 **Export Options**: Export to PDF and other formats (coming soon)

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), Uvicorn
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons
- **API Documentation**: Automatic OpenAPI/Swagger docs

## Getting Started

### Prerequisites

- **Python 3.8+** (for FastAPI backend)
- **Node.js (v16 or higher)** (for React frontend)
- **npm or yarn**
- **pip** (Python package manager)

### Installation

**Option 1: Quick Setup (Recommended)**
```bash
git clone <repository-url>
cd presentation-ai
python setup.py
```

**Option 2: Manual Setup**

1. Clone the repository:
```bash
git clone <repository-url>
cd presentation-ai
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Development

**Option 1: Quick Start**
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

**Option 2: Manual Start**

1. Start the FastAPI backend server:
```bash
cd backend
python run.py
```

2. In a new terminal, start the React frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`
   - **API Documentation**: `http://localhost:5000/docs`

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
cd backend
python run.py
```

## Usage

1. **Create a Presentation**: Enter a prompt describing what you want your presentation to be about
2. **Edit Slides**: Use the editor to customize content, colors, and layouts
3. **Preview**: Switch to preview mode to see how your presentation looks
4. **Export**: Save your presentation (export functionality coming soon)

## Project Structure

```
presentation-ai/
├── src/
│   ├── components/          # React components
│   ├── context/            # React context for state management
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   └── main.tsx           # Entry point
├── backend/
│   ├── main.py            # FastAPI application
│   ├── run.py             # Server runner
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
└── dist/                  # Build output
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] Real AI integration (OpenAI, Claude, etc.)
- [ ] More slide templates and themes
- [ ] Export to PDF and PowerPoint
- [ ] Collaboration features
- [ ] Presentation sharing
- [ ] Advanced animations and transitions
- [ ] Image and media upload
- [ ] Chart and graph generation
