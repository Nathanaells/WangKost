import Owner from "@/server/models/Owner";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const body = await req.json();

    const transaction = await Owner

  } catch (error) {}
}
