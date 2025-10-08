import React, { createContext, useContext, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  presentations: [],
  currentPresentation: null,
  isLoading: false,
  error: null,
};

function presentationReducer(state, action) {
  switch (action.type) {
    case "CREATE_PRESENTATION": {
      const newPresentation = {
        ...action.payload,
        id: uuidv4(),
        slides: action.payload.slides || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        presentations: [...state.presentations, newPresentation],
        currentPresentation: newPresentation,
        error: null,
      };
    }

    case "UPDATE_PRESENTATION":
      return {
        ...state,
        presentations: state.presentations.map((p) =>
          p.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date() }
            : p
        ),
        currentPresentation:
          state.currentPresentation?.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date() }
            : state.currentPresentation,
        error: null,
      };

    case "DELETE_PRESENTATION":
      return {
        ...state,
        presentations: state.presentations.filter(
          (p) => p.id !== action.payload
        ),
        currentPresentation:
          state.currentPresentation?.id === action.payload
            ? null
            : state.currentPresentation,
        error: null,
      };

    case "SET_CURRENT_PRESENTATION":
      return {
        ...state,
        currentPresentation: action.payload,
        error: null,
      };

    case "ADD_SLIDE": {
      const { presentationId, slide } = action.payload;
      const updated = state.presentations.map((p) => {
        if (p.id !== presentationId) return p;
        return {
          ...p,
          slides: [...(p.slides || []), { ...slide, id: uuidv4() }],
          updatedAt: new Date(),
        };
      });

      const current =
        state.currentPresentation?.id === presentationId
          ? updated.find((p) => p.id === presentationId)
          : state.currentPresentation;

      return { ...state, presentations: updated, currentPresentation: current };
    }

    case "UPDATE_SLIDE": {
      const { presentationId, slide } = action.payload;
      const updated = state.presentations.map((p) => {
        if (p.id !== presentationId) return p;
        return {
          ...p,
          slides: p.slides.map((s) => (s.id === slide.id ? slide : s)),
          updatedAt: new Date(),
        };
      });

      const current =
        state.currentPresentation?.id === presentationId
          ? updated.find((p) => p.id === presentationId)
          : state.currentPresentation;

      return { ...state, presentations: updated, currentPresentation: current };
    }

    case "DELETE_SLIDE": {
      const { presentationId, slideId } = action.payload;
      const updated = state.presentations.map((p) => {
        if (p.id !== presentationId) return p;
        return {
          ...p,
          slides: p.slides.filter((s) => s.id !== slideId),
          updatedAt: new Date(),
        };
      });

      const current =
        state.currentPresentation?.id === presentationId
          ? updated.find((p) => p.id === presentationId)
          : state.currentPresentation;

      return { ...state, presentations: updated, currentPresentation: current };
    }

    case "REORDER_SLIDES": {
      const { presentationId, slides } = action.payload;
      const updated = state.presentations.map((p) =>
        p.id === presentationId
          ? { ...p, slides, updatedAt: new Date() }
          : p
      );

      const current =
        state.currentPresentation?.id === presentationId
          ? updated.find((p) => p.id === presentationId)
          : state.currentPresentation;

      return { ...state, presentations: updated, currentPresentation: current };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const PresentationContext = createContext(null);

export function PresentationProvider({ children }) {
  const [state, dispatch] = useReducer(presentationReducer, initialState);

  return (
    <PresentationContext.Provider value={{ state, dispatch }}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error("usePresentation must be used within a PresentationProvider");
  }
  return context;
}
