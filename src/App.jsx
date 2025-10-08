import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CreatePage from "./pages/CreatePage";
import GeneratePage from "./pages/GeneratePage";
import Outline from "./pages/OutlinePage";
import EditorPage from "./pages/EditorPage";
import ImportPage from "./pages/ImportPage";
import { PresentationProvider } from "./context/PresentationContext";

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9fafb] to-[#dbeafe]">
      <main>
        <Routes>
          <Route path="/" element={<CreatePage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/outline" element={<Outline />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <PresentationProvider>
      <Router>
        <AppContent />
      </Router>
    </PresentationProvider>
  );
}

export default App;
