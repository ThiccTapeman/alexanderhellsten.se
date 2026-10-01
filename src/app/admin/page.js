import { getAdmin } from "@/lib/admin";
import AdminPanel from "./panel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  title: "Admin | Alexander Hellstén",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function AdminPage() {
  // Authentication is performed here and independently in every admin API handler.
  const session = await getAdmin();
  return <AdminPanel authenticated={Boolean(session)} />;
}
