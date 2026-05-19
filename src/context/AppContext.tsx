import React, { createContext, useContext, useReducer } from "react";
import {
  categories as mockCategories,
  flashcards as mockFlashcards,
  reviewSessions as mockSessions,
} from "../data/mockData";
import { Category } from "../types/Category";
import { Flashcard } from "../types/Flashcard";
import { ReviewSession } from "../types/Session";

export interface AppState {
  categories: Category[];
  flashcards: Flashcard[];
  sessions: ReviewSession[];
}

export type AppAction =
  | { type: "MARK_LEARNED"; id: string }
  | { type: "UPDATE_SESSION"; session: ReviewSession };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "MARK_LEARNED":
      return {
        ...state,
        flashcards: state.flashcards.map((f) =>
          f.id === action.id ? { ...f, learned: true } : f,
        ),
      };
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: [...state.sessions, action.session],
      };
    default:
      return state;
  }
}

interface AppContextData {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Aliases para retrocompatibilidade com outros branches
  categories: Category[];
  flashcards: Flashcard[];
  sessions: ReviewSession[];
}

const AppContext = createContext<AppContextData>({} as AppContextData);

const initialState: AppState = {
  categories: mockCategories,
  flashcards: mockFlashcards,
  sessions: mockSessions,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        categories: state.categories,
        flashcards: state.flashcards,
        sessions: state.sessions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
