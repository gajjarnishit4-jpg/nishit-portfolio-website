import { AdminRoute } from "@/app/admin/AdminRoute";

export const dynamic = "force-dynamic";

export default async function AdminChatsPage() {
  return <AdminRoute view="chats" />;
}
