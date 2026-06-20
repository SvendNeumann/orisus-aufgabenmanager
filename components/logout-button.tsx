import { LogOut } from "lucide-react";
import { currentUser } from "@/lib/orisus";

export async function LogoutButton() {
  const user = await currentUser();
  if (!user) return null;

  return <form action="/api/auth/logout" method="post"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-danger shadow-sm"><LogOut className="h-4 w-4" />Abmelden</button></form>;
}
