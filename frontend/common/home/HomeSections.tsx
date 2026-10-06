import { getFeaturedProducts, getProductList } from "@/common/data/products";
import ProductListClient from "@/common/product/ProductListClient";
import { HomeSectionRead } from "@deep-ecommerce/shared/types/home_types";

import BannerCarousel from "./BannerCarousel";
import BannerItem from "./BannerItem";
import BannerRow from "./BannerRow";
import FeaturedProducts from "./FeaturedProducts";
import HeroBanner from "./HeroBanner";

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-primary" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
  );
}

async function HeroSection({ section }: { section: HomeSectionRead }) {
  // A failed fetch just hides the hero — the rest of the page still renders.
  const products = await getFeaturedProducts(section.product_limit ?? 6).catch(
    () => [],
  );
  return <HeroBanner products={products} autoplay={section.autoplay} />;
}

async function FeaturedSection({ section }: { section: HomeSectionRead }) {
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let loadError: string | null = null;
  try {
    products = await getFeaturedProducts(section.product_limit ?? 8);
  } catch {
    loadError = "Couldn't load featured products right now.";
  }
  return (
    <FeaturedProducts
      products={products}
      loadError={loadError}
      title={section.title ?? "Exclusive Products"}
    />
  );
}

async function ProductListSection({ section }: { section: HomeSectionRead }) {
  const limit = section.product_limit ?? 12;
  const filters = section.category_id ? { categoryId: section.category_id } : {};

  let result: Awaited<ReturnType<typeof getProductList>> | null = null;
  try {
    result = await getProductList({ ...filters, limit });
  } catch {
    // falls through to the inline error banner below
  }

  return (
    <section>
      <SectionHeading title={section.title ?? "Shop Products"} />
      {result ? (
        <ProductListClient
          initialProducts={result.data}
          initialTotal={result.total}
          filters={filters}
          limit={limit}
        />
      ) : (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t load products right now.
        </p>
      )}
    </section>
  );
}

function CarouselSection({
  section,
  priority,
}: {
  section: HomeSectionRead;
  priority: boolean;
}) {
  return (
    <section>
      {section.title && <SectionHeading title={section.title} />}
      <BannerCarousel
        autoplay={section.autoplay}
        maxWidth={section.width}
        slides={section.banners.map((banner, i) => (
          <BannerItem
            key={banner.id}
            banner={banner}
            width={section.width}
            height={section.height}
            // Without a configured size: tall-ish on phones, wide on desktop.
            fallbackClassName="aspect-video md:aspect-21/9"
            priority={priority && i === 0}
          />
        ))}
      />
    </section>
  );
}

function renderSection(section: HomeSectionRead, isFirst: boolean) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;
    case "carousel":
      return <CarouselSection section={section} priority={isFirst} />;
    case "banner_row":
      return (
        <section>
          {section.title && <SectionHeading title={section.title} />}
          <BannerRow section={section} />
        </section>
      );
    case "featured_products":
      return <FeaturedSection section={section} />;
    case "product_list":
      return <ProductListSection section={section} />;
    default:
      // A section type this build doesn't know (backend ahead of frontend)
      // is skipped rather than crashing the whole homepage.
      return null;
  }
}

/** Renders the admin-configured homepage, top to bottom. */
export default function HomeSections({
  sections,
}: {
  sections: HomeSectionRead[];
}) {
  return (
    <>
      {sections.map((section, i) => {
        const content = renderSection(section, i === 0);
        if (!content) return null;
        // full_width sections escape the page container (<main> itself has
        // none) — only hero/carousel expose that setting.
        const bleed =
          section.full_width &&
          (section.type === "hero" || section.type === "carousel");
        return (
          <div
            key={section.id}
            className={bleed ? "w-full" : "mx-auto w-full max-w-7xl px-4"}
          >
            {content}
          </div>
        );
      })}
    </>
  );
}
