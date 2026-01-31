const CATEGORY_COLORS = ['#EAEFEF', '#BFC9D1', '#25343F', '#FF9B51'];

/** Returns a consistent color for a category id (for fallback placeholders) */
export function getCategoryColor(str: string): string {
  if (!str) return CATEGORY_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}
