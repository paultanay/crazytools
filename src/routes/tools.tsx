import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";

export const Route = createFileRoute("/tools")({
  component: ToolsLayout,
});

function ToolsLayout() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
