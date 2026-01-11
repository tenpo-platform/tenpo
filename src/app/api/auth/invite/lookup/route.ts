import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string };

  if (!token) {
    return NextResponse.json(
      { error: "missing_token" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invite_context", {
    p_token: token,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: "invalid_or_expired" },
      { status: 404 }
    );
  }

  return NextResponse.json({ invite: data });
}
