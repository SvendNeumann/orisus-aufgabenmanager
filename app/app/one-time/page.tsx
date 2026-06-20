import { redirect } from "next/navigation";
import { canUseAdminArea, requireUser } from "@/lib/orisus";

export default async function LocationLeadOneTimeTaskPage() {
  const user = await requireUser();

  if (canUseAdminArea(user)) redirect("/admin/one-time");

  redirect("/app");
}
