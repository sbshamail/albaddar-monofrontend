import CategoryDropdown from "@/common/pages/CategoryDropdown";
import { ApiError, backendFetch } from "@deep-ecommerce/shared/api/server";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

const page = async () => {
  let categories: CategoryTreeNode[] = [];
  let loadError: string | null = null;

  try {
    categories = await backendFetch<CategoryTreeNode[]>(
      "/category/list?limit=500",
    );
  } catch (err) {
    loadError =
      err instanceof ApiError ? err.message : "Failed to load categories";
  }

  return <CategoryDropdown categories={categories} loadError={loadError} />;
};

export default page;
