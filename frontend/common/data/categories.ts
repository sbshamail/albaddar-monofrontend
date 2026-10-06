import { ApiError, backendFetch } from "@deep-ecommerce/shared/api/server";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

// category/list defaults to limit=10 on the flat row count *before*
// tree-building — passing a high limit is required to get the full 3-level
// tree, not just the first 10 rows (see backend/src/api/routers/category/categoryRoute.py).
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  return backendFetch<CategoryTreeNode[]>("/category/list?limit=1000");
}

export async function getCategory(idOrSlug: number | string): Promise<CategoryTreeNode | null> {
  try {
    return await backendFetch<CategoryTreeNode>(`/category/read/${idOrSlug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function findCategoryById(
  tree: CategoryTreeNode[],
  id: number,
): CategoryTreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findCategoryById(node.children, id);
    if (found) return found;
  }
  return null;
}

// A product's own `category` field only carries {id, name, root_id} — no
// ancestor chain — so a breadcrumb (Clothes > Men > T-Shirt Half Sleeve)
// has to be built by walking the full tree instead.
export function findCategoryPath(
  tree: CategoryTreeNode[],
  id: number,
  trail: CategoryTreeNode[] = [],
): CategoryTreeNode[] | null {
  for (const node of tree) {
    const nextTrail = [...trail, node];
    if (node.id === id) return nextTrail;
    const found = findCategoryPath(node.children, id, nextTrail);
    if (found) return found;
  }
  return null;
}
