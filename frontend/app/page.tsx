import { getHomeLayout } from "@/common/data/home";
import HomeSections from "@/common/home/HomeSections";

// The homepage is admin-controlled: which blocks appear, in what order, and
// how each is configured all come from the backend's home sections
// (admin → Homepage). See common/home/HomeSections.tsx for the registry.
export default async function Home() {
  const sections = await getHomeLayout();

  return (
    <div className="flex flex-col gap-10 py-6">
      <HomeSections sections={sections} />
    </div>
  );
}
