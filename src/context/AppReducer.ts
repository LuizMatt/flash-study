import { Category } from '../types/Category';
import { Flashcard } from '../types/Flashcard';
import { ReviewSession } from '../types/Session';
import { categories, flashcards, reviewSessions } from '../data/mockData';
import { ADD_CATEGORY, ADD_CARD, MARK_LEARNED, UPDATE_SESSION } from './actions';

export interface AppState {
  categories: Category[];
  flashcards: Flashcard[];
  sessions: ReviewSession[];
}

export const initialState: AppState = {
  categories,
  flashcards,
  sessions: reviewSessions,
};

export function appReducer(state: AppState, action: { type: string; payload: any }): AppState {
  switch (action.type) {
    case ADD_CATEGORY:
      return { ...state, categories: [...state.categories, action.payload] };
    case ADD_CARD:
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case MARK_LEARNED:
      return {
        ...state,
        flashcards: state.flashcards.map((card) =>
          card.id === action.payload ? { ...card, learned: true } : card
        ),
      };
    case UPDATE_SESSION:
      return { ...state, sessions: [...state.sessions, action.payload] };
    default:
      return state;
  }
}
