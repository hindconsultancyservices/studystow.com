import { NextResponse } from "next/server";

import { getCurrentAdminContext } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getCurrentAdminContext();

    if (!auth.ok) {
      return auth.response;
    }

    return NextResponse.json({
      success: true,
      data: {
        isOwner: auth.context.actor.isOwner,
        user: {
          id: auth.context.actor.id,
          name: auth.context.actor.name,
          email: auth.context.actor.email,
          role: auth.context.actor.role,
          adminRole: auth.context.actor.adminRole,
          status: auth.context.actor.status,
        },
        permissions: auth.context.permissions,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/permissions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load administrator permissions.",
      },
      { status: 500 }
    );
  }
}
