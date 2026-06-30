import React, { createContext, useContext, useReducer, useState } from "react";
import { appReducer, initialState, AppState } from "./AppReducer";
import { api } from "../services/api";
import {
  ADD_CATEGORY,
  ADD_CARD,
  MARK_LEARNED,
  SET_CARD_LEARNED,
  UPDATE_SESSION,
  RESET_CARDS_LEARNED,
  LOAD_DATA,
} from "./actions";
import { Category } from "../types/Category";
import { Flashcard } from "../types/Flashcard";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

interface AppContextType {
  state: AppState;
  isLoading: boolean;
  loadData: () => Promise<void>;
  addCategory: (data: {
    name: string;
    color: string;
    icon: string;
  }) => Promise<void>;
  addCard: (data: {
    categoryId: string;
    front: string;
    back: string;
  }) => Promise<void>;
  markLearned: (id: string) => Promise<void>;
  setCardLearned: (id: string, learned: boolean) => Promise<void>;
  updateSession: (data: {
    categoryId: string;
    total: number;
    correct: number;
  }) => Promise<void>;
  resetLearned: (categoryId?: string | null) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      const [catRes, cardRes] = await Promise.all([
        api.get("/categories"),
        api.get("/flashcards"),
      ]);
      const categories: Category[] = catRes.data.map((c: any) => ({
        ...c,
        createdAt: toDate(c.createdAt),
      }));
      const flashcards: Flashcard[] = cardRes.data.map((f: any) => ({
        ...f,
        createdAt: toDate(f.createdAt),
      }));
      dispatch({ type: LOAD_DATA, payload: { categories, flashcards } });
    } catch {
      // Não autenticado ainda — ignora silenciosamente
    } finally {
      setIsLoading(false);
    }
  }

  async function addCategory(data: {
    name: string;
    color: string;
    icon: string;
  }) {
    const res = await api.post("/categories", data);
    const category: Category = {
      ...res.data.category,
      createdAt: toDate(res.data.category.createdAt),
    };
    dispatch({ type: ADD_CATEGORY, payload: category });
  }

  async function addCard(data: {
    categoryId: string;
    front: string;
    back: string;
  }) {
    const res = await api.post("/flashcards", data);
    const flashcard: Flashcard = {
      ...res.data.flashcard,
      createdAt: toDate(res.data.flashcard.createdAt),
    };
    dispatch({ type: ADD_CARD, payload: flashcard });
  }

  async function markLearned(id: string) {
    await api.patch(`/flashcards/${id}/learned`, { learned: true });
    dispatch({ type: MARK_LEARNED, payload: id });
  }

  async function setCardLearned(id: string, learned: boolean) {
    await api.patch(`/flashcards/${id}/learned`, { learned });
    dispatch({ type: SET_CARD_LEARNED, payload: { id, learned } });
  }

  async function updateSession(data: {
    categoryId: string;
    total: number;
    correct: number;
  }) {
    if (!UUID_REGEX.test(data.categoryId)) return;
    const res = await api.post("/review-sessions", data);
    dispatch({ type: UPDATE_SESSION, payload: res.data.session });
  }

  async function resetLearned(categoryId?: string | null) {
    if (categoryId && UUID_REGEX.test(categoryId)) {
      await api.post(`/categories/${categoryId}/reset-learned`);
      dispatch({ type: RESET_CARDS_LEARNED, payload: { categoryId } });
    } else {
      for (const cat of state.categories) {
        await api.post(`/categories/${cat.id}/reset-learned`);
      }
      dispatch({ type: RESET_CARDS_LEARNED, payload: { categoryId: null } });
    }
  }

  return (
    <AppContext.Provider
      value={{
        state,
        isLoading,
        loadData,
        addCategory,
        addCard,
        markLearned,
        setCardLearned,
        updateSession,
        resetLearned,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
