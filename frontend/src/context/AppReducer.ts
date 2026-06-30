import { Category } from "../types/Category";
import { Flashcard } from "../types/Flashcard";
import { ReviewSession } from "../types/Session";
import {
  ADD_CATEGORY,
  ADD_CARD,
  MARK_LEARNED,
  SET_CARD_LEARNED,
  UPDATE_SESSION,
  RESET_CARDS_LEARNED,
  LOAD_DATA,
} from "./actions";

export interface AppState {
  categories: Category[];
  flashcards: Flashcard[];
  sessions: ReviewSession[];
}

export const initialState: AppState = {
  categories: [],
  flashcards: [],
  sessions: [],
};

export function appReducer(
  state: AppState,
  action: { type: string; payload: any },
): AppState {
  switch (action.type) {
    case LOAD_DATA:
      return {
        ...state,
        categories: action.payload.categories,
        flashcards: action.payload.flashcards,
      };
    case ADD_CATEGORY:
      return { ...state, categories: [...state.categories, action.payload] };
    case ADD_CARD:
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case MARK_LEARNED:
      return {
        ...state,
        flashcards: state.flashcards.map((card) =>
          card.id === action.payload ? { ...card, learned: true } : card,
        ),
      };
    case SET_CARD_LEARNED:
      return {
        ...state,
        flashcards: state.flashcards.map((card) =>
          card.id === action.payload.id
            ? { ...card, learned: action.payload.learned }
            : card,
        ),
      };
    case UPDATE_SESSION:
      return { ...state, sessions: [...state.sessions, action.payload] };
    case RESET_CARDS_LEARNED:
      return {
        ...state,
        flashcards: state.flashcards.map((card) => {
          if (
            !action.payload?.categoryId ||
            card.categoryId === action.payload.categoryId
          ) {
            return { ...card, learned: false };
          }
          return card;
        }),
      };
    default:
      return state;
  }
}
