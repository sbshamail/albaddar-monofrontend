import HomeLayoutManager from "@/common/home/HomeLayoutManager";
import { getAccessToken } from "@/providers/auth/session";
import {
  ApiError,
  backendFetch,
} from "@deep-ecommerce/shared/api/server";
import { HomeSectionRead } from "@deep-ecommerce/shared/types/home_types";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

const page = async () => {
  const token = await getAccessToken();
  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage the homepage.
      </p>
    );
  }

  let sections: HomeSectionRead[] = [];
  let loadError: string | null = null;
  try {
    sections = await backendFetch<HomeSectionRead[]>("/home-section/list", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (err) {
    loadError =
      err instanceof ApiError ? err.message : "Failed to load the homepage layout";
  }

  let categories: CategoryTreeNode[] = [];
  try {
    categories = await backendFetch<CategoryTreeNode[]>(
      "/category/list?limit=500",
    );
  } catch {
    // Non-fatal — the category scope picker just has nothing to offer.
  }

  return (
    <HomeLayoutManager
      sections={sections}
      categories={categories}
      loadError={loadError}
    />
  );
};

export default page;
