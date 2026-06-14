export interface Flashcard {
  id: string;
  categoryId: string;
  front: string;
  back: string;
  learned: boolean;
  createdAt: Date;
}
