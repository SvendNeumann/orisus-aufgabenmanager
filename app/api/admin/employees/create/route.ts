import { NextResponse } from "next/server";
import { INSTANCE_LOCATIONS } from "@/lib/instance";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request) {
  await requireUser("admin");
  const form = await request.formData();
  const firstName = String(form.get("first_name") || "").trim();
  const lastName = String(form.get("last_name") || "").trim();
  const functionTitle = String(form.get("function_title") || "").trim();
  const locationValue = String(form.get("location_id") || "").trim();
  const worksAcrossLocations = locationValue === "__all__";
  const roleValue = String(form.get("role") || "employee");
  const role = ["admin", "location_lead", "employee"].includes(roleValue) ? roleValue : "employee";
  const db = supabaseAdmin();

  if (db && firstName && lastName && locationValue) {
    const { data: locations } = await db.from("locations").select("id, name").eq("active", true).in("name", INSTANCE_LOCATIONS);
    const fallbackLocation = locations?.find((location) => location.name === INSTANCE_LOCATIONS[0])?.id || locations?.[0]?.id;
    const validLocation = worksAcrossLocations ? fallbackLocation : locations?.find((location) => location.id === locationValue)?.id;
    if (!validLocation) return NextResponse.redirect(new URL("/admin/employees?error=location", request.url));

    await db.from("employees").insert({
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      location_id: validLocation,
      function_title: functionTitle || null,
      role,
      works_across_locations: worksAcrossLocations,
      pin_hash: null,
      active: true
    });
  }

  return NextResponse.redirect(new URL("/admin/employees", request.url));
}
