import { NextResponse } from "next/server";
import { readStyleProfile } from "@/lib/data-files";

export async function GET() {
  const styleProfile = await readStyleProfile();

  if (!styleProfile) {
    return NextResponse.json(
      { error: "스타일 프로필이 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ styleProfile });
}
