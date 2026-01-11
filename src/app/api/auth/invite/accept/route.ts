import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { token, academyName, academyDescription } = (await request.json()) as {
    token?: string;
    academyName?: string;
    academyDescription?: string | null;
  };

  if (!token) {
    return NextResponse.json(
      { error: "missing_token" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("accept_invite", {
    p_token: token,
    p_academy_name: academyName,
    p_academy_description: academyDescription ?? null,
  });

  if (error) {
    return NextResponse.json({ error: "rpc_error" }, { status: 500 });
  }

  return NextResponse.json({ result: data });
}
