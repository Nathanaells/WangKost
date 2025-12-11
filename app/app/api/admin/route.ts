import Admin from "@/server/models/Admin";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  } catch (error) {}
}
