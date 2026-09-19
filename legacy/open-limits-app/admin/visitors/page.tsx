import { AdminRoute } from "@/app/admin/AdminRoute";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  return <AdminRoute view="visitors" />;
}
