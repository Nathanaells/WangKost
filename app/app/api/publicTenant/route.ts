import customError from "@/server/errorHandler/customError";
import Tenant from "@/server/models/Tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const tenant = await Tenant.get();
    return NextResponse.json(tenant);
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
