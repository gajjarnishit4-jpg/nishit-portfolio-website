import { AdminRoute } from "@/tenants/fullstack/admin/AdminRoute";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  return <AdminRoute view="leads" />;
}
