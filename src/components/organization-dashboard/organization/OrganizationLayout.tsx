import { Outlet } from "react-router-dom";

export default function OrganizationLayout() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
