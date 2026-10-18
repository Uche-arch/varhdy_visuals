import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAllMedia } from "@/lib/media";
import Dashboard from "@/components/admin/Dashboard";

async function AdminContent() {
  // Second check on top of proxy.ts: never render the dashboard without a session.
  if (!(await isAdmin())) redirect("/admin/login");

  const items = await getAllMedia();
  return <Dashboard items={items} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate">Loading...</p>}>
      <AdminContent />
    </Suspense>
  );
}
