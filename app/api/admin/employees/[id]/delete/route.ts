import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const db = supabaseAdmin();

  if (db) {
    await db.from("sessions").delete().eq("employee_id", params.id);
    await db
      .from("employees")
      .update({
        active: false,
        pin_hash: null,
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq("id", params.id);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/employees");
  revalidatePath("/login");

  return NextResponse.redirect(new URL("/admin/employees?deleted=1", request.url));
}
