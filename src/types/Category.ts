import { CategoryIconName } from '../constants/categoryIcons';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: CategoryIconName;
  createdAt: Date;
}
