import { getAdminFromCookies } from "@/tenants/fullstack/lib/admin-auth";
import { AdminDashboard, AdminView } from "@/tenants/fullstack/components/AdminDashboard";
import { AdminLogin } from "@/tenants/fullstack/components/AdminLogin";

export async function AdminRoute({ view }: { view: AdminView }) {
  const admin = await getAdminFromCookies();

  return admin ? <AdminDashboard admin={admin} view={view} /> : <AdminLogin />;
}
