export const CATEGORY_ICONS = [
  { name: 'book-outline', label: 'Estudo' },
  { name: 'globe-outline', label: 'Redes' },
  { name: 'calculator-outline', label: 'Exatas' },
  { name: 'language-outline', label: 'Idiomas' },
  { name: 'flask-outline', label: 'Ciências' },
  { name: 'code-slash-outline', label: 'Código' },
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number]['name'];

export const DEFAULT_CATEGORY_ICON: CategoryIconName = CATEGORY_ICONS[0].name;

export function getCategoryIcon(icon?: string): CategoryIconName {
  const categoryIcon = CATEGORY_ICONS.find((item) => item.name === icon);

  return categoryIcon?.name ?? DEFAULT_CATEGORY_ICON;
}
