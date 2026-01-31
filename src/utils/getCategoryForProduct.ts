import type { Product } from '../api/Admin/products';

interface CategoryLike {
  id: string;
  name: string;
  imageUrl?: string;
}

/** Resolve category for a product from product.category or categories map */
export function getCategoryForProduct(
  product: Product,
  categoriesMap: Record<string, CategoryLike>
): { id: string; name: string; imageUrl?: string } | null {
  if (product.category?.name) {
    return {
      id: product.category.id ?? '',
      name: product.category.name,
      imageUrl: product.category.imageUrl,
    };
  }
  const cat = categoriesMap[product.categoryId];
  return cat ? { id: cat.id, name: cat.name, imageUrl: cat.imageUrl } : null;
}
