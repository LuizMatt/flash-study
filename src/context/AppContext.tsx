import React, { createContext, useContext, useState } from 'react';
import { categories as mockCategories, flashcards as mockFlashcards, reviewSessions as mockSessions } from '../data/mockData';
import { Category } from '../types/Category';
import { Flashcard } from '../types/Flashcard';
import { ReviewSession } from '../types/Session';

interface AppContextData {
  categories: Category[];
  flashcards: Flashcard[];
  sessions: ReviewSession[];
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories] = useState<Category[]>(mockCategories);
  const [flashcards] = useState<Flashcard[]>(mockFlashcards);
  const [sessions] = useState<ReviewSession[]>(mockSessions);

  return (
    <AppContext.Provider value={{ categories, flashcards, sessions }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
