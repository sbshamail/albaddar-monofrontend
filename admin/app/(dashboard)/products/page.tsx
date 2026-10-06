import ProductTable from "@/common/table/productTable/ProductTable";
import { getAccessToken } from "@/providers/auth/session";
import {
  ApiError,
  authorizedFetchList,
  backendFetch,
} from "@deep-ecommerce/shared/api/server";
import {
  CategoryTreeNode,
  ProductRead,
} from "@deep-ecommerce/shared/types/product_types";

interface ProductsPageProps {
  searchParams: Promise<{
    is_active?: string;
    is_featured?: string;
    is_sale?: string;
  }>;
}

const page = async ({ searchParams }: ProductsPageProps) => {
  const token = await getAccessToken();
  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage products.
      </p>
    );
  }

  const params = await searchParams;

  // All three go through deepFilters as one array — but NOT via
  // buildListQuery's usual Python-literal (True/False) encoding: is_sale is
  // a computed Product.is_sale property, and the backend pulls it out of
  // deepFilters with json.loads *before* the generic (ast.literal_eval)
  // engine ever runs, so it needs lowercase JSON true/false specifically.
  // Confirmed directly against the backend that lowercase JSON works for
  // is_active/is_featured too (both parsers tolerate it), so JSON.stringify
  // for the whole array is the one encoding that's safe for all three.
  const deepFilters: Array<[string, boolean]> = [];
  // "InActive only" — surfaces products that are currently hidden from
  // customers, which is the more useful default for this toggle.
  if (params.is_active === "true") deepFilters.push(["is_active", false]);
  if (params.is_featured === "true") deepFilters.push(["is_featured", true]);
  if (params.is_sale === "true") deepFilters.push(["is_sale", true]);

  const query = new URLSearchParams({ limit: "200" });
  if (deepFilters.length) {
    query.set("deepFilters", JSON.stringify(deepFilters));
  }

  let products: ProductRead[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const result = await authorizedFetchList<ProductRead>(
      `/product/my-products?${query}`,
      token,
      { cache: "no-store" },
    );
    products = result.data;
    total = result.total;
  } catch (err) {
    loadError =
      err instanceof ApiError ? err.message : "Failed to load products";
  }

  let categoryTree: CategoryTreeNode[] = [];
  try {
    categoryTree = await backendFetch<CategoryTreeNode[]>(
      "/category/list?limit=500",
    );
  } catch {
    // Non-fatal — the create/edit form just offers no category options.
  }

  return (
    <ProductTable
      products={products}
      total={total}
      categories={categoryTree}
      loadError={loadError}
    />
  );
};

export default page;
