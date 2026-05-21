import React, { createContext, useContext, useReducer } from 'react';
import { categories as mockCategories, flashcards as mockFlashcards, reviewSessions as mockSessions } from '../data/mockData';
import { Category } from '../types/Category';
import { Flashcard } from '../types/Flashcard';
import { ReviewSession } from '../types/Session';

interface AppState {
  categories: Category[];
  flashcards: Flashcard[];
  sessions: ReviewSession[];
}

type AppAction =
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'ADD_CARD'; payload: Flashcard }
  | { type: 'SET_CARD_LEARNED'; payload: { id: string; learned: boolean } }
  | { type: 'TOGGLE_CARD_LEARNED'; payload: { id: string } }
  | { type: 'MARK_LEARNED'; id: string }
  | { type: 'RESET_CARDS_LEARNED'; payload: { categoryId?: string } }
  | { type: 'UPDATE_SESSION'; session: ReviewSession };

interface AppContextData {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const initialState: AppState = {
  categories: mockCategories,
  flashcards: mockFlashcards,
  sessions: mockSessions,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case 'ADD_CARD':
      return {
        ...state,
        flashcards: [...state.flashcards, action.payload],
      };
    case 'SET_CARD_LEARNED':
      return {
        ...state,
        flashcards: state.flashcards.map((flashcard) =>
          flashcard.id === action.payload.id
            ? { ...flashcard, learned: action.payload.learned }
            : flashcard
        ),
      };
    case 'TOGGLE_CARD_LEARNED':
      return {
        ...state,
        flashcards: state.flashcards.map((flashcard) =>
          flashcard.id === action.payload.id
            ? { ...flashcard, learned: !flashcard.learned }
            : flashcard
        ),
      };
    case 'MARK_LEARNED':
      return {
        ...state,
        flashcards: state.flashcards.map((flashcard) =>
          flashcard.id === action.id
            ? { ...flashcard, learned: true }
            : flashcard
        ),
      };
    case 'RESET_CARDS_LEARNED':
      return {
        ...state,
        flashcards: state.flashcards.map((flashcard) =>
          !action.payload.categoryId || flashcard.categoryId === action.payload.categoryId
            ? { ...flashcard, learned: false }
            : flashcard
        ),
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.session],
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextData | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};
