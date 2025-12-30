import { NextResponse } from "next/server";

export async function GET() {
  throw new Error("Sentry API Test Error");
  return NextResponse.json({ message: "This will never be reached" });
}
