import React, { createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  presentations: [],
  currentPresentation: null,
  isLoading: false,
  error: null,
}

function presentationReducer(state, action) {
  switch (action.type) {
    case 'CREATE_PRESENTATION':
      const newPresentation = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return {
        ...state,
        presentations: [...state.presentations, newPresentation],
        currentPresentation: newPresentation,
      }

    case 'UPDATE_PRESENTATION':
      return {
        ...state,
        presentations: state.presentations.map(p =>
          p.id === action.payload.id ? { ...action.payload, updatedAt: new Date() } : p
        ),
        currentPresentation: state.currentPresentation?.id === action.payload.id ? action.payload : state.currentPresentation,
      }

    case 'DELETE_PRESENTATION':
      return {
        ...state,
        presentations: state.presentations.filter(p => p.id !== action.payload),
        currentPresentation: state.currentPresentation?.id === action.payload ? null : state.currentPresentation,
      }

    case 'SET_CURRENT_PRESENTATION':
      return {
        ...state,
        currentPresentation: action.payload,
      }

    case 'ADD_SLIDE':
      const presentationToAddSlide = state.presentations.find(p => p.id === action.payload.presentationId)
      if (!presentationToAddSlide) return state

      const newSlide = {
        ...action.payload.slide,
        id: uuidv4(),
      }

      const updatedPresentationWithSlide = {
        ...presentationToAddSlide,
        slides: [...presentationToAddSlide.slides, newSlide],
        updatedAt: new Date(),
      }

      return {
        ...state,
        presentations: state.presentations.map(p =>
          p.id === action.payload.presentationId ? updatedPresentationWithSlide : p
        ),
        currentPresentation: state.currentPresentation?.id === action.payload.presentationId
          ? updatedPresentationWithSlide
          : state.currentPresentation,
      }

    case 'UPDATE_SLIDE':
      const presentationToUpdateSlide = state.presentations.find(p => p.id === action.payload.presentationId)
      if (!presentationToUpdateSlide) return state

      const updatedPresentationWithUpdatedSlide = {
        ...presentationToUpdateSlide,
        slides: presentationToUpdateSlide.slides.map(s =>
          s.id === action.payload.slide.id ? action.payload.slide : s
        ),
        updatedAt: new Date(),
      }

      return {
        ...state,
        presentations: state.presentations.map(p =>
          p.id === action.payload.presentationId ? updatedPresentationWithUpdatedSlide : p
        ),
        currentPresentation: state.currentPresentation?.id === action.payload.presentationId
          ? updatedPresentationWithUpdatedSlide
          : state.currentPresentation,
      }

    case 'DELETE_SLIDE':
      const presentationToDeleteSlide = state.presentations.find(p => p.id === action.payload.presentationId)
      if (!presentationToDeleteSlide) return state

      const updatedPresentationWithDeletedSlide = {
        ...presentationToDeleteSlide,
        slides: presentationToDeleteSlide.slides.filter(s => s.id !== action.payload.slideId),
        updatedAt: new Date(),
      }

      return {
        ...state,
        presentations: state.presentations.map(p =>
          p.id === action.payload.presentationId ? updatedPresentationWithDeletedSlide : p
        ),
        currentPresentation: state.currentPresentation?.id === action.payload.presentationId
          ? updatedPresentationWithDeletedSlide
          : state.currentPresentation,
      }

    case 'REORDER_SLIDES':
      const presentationToReorder = state.presentations.find(p => p.id === action.payload.presentationId)
      if (!presentationToReorder) return state

      const updatedPresentationWithReorderedSlides = {
        ...presentationToReorder,
        slides: action.payload.slides,
        updatedAt: new Date(),
      }

      return {
        ...state,
        presentations: state.presentations.map(p =>
          p.id === action.payload.presentationId ? updatedPresentationWithReorderedSlides : p
        ),
        currentPresentation: state.currentPresentation?.id === action.payload.presentationId
          ? updatedPresentationWithReorderedSlides
          : state.currentPresentation,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }

    default:
      return state
  }
}

const PresentationContext = createContext(null)

export function PresentationProvider({ children }) {
  const [state, dispatch] = useReducer(presentationReducer, initialState)

  return (
    <PresentationContext.Provider value={{ state, dispatch }}>
      {children}
    </PresentationContext.Provider>
  )
}

export function usePresentation() {
  const context = useContext(PresentationContext)
  if (!context) {
    throw new Error('usePresentation must be used within a PresentationProvider')
  }
  return context
}
