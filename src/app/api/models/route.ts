import { NextResponse } from "next/server";
import { fetchModels } from "@/lib/server/models";

export async function GET() {
  return NextResponse.json(await fetchModels());
}
