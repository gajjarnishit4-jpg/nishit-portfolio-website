import { AdminRoute } from "@/tenants/fullstack/admin/AdminRoute";

export const dynamic = "force-dynamic";

export default async function AdminChatsPage() {
  return <AdminRoute view="chats" />;
}
