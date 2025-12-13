import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Additional from "@/server/models/Additional";
import { NextRequest, NextResponse } from "next/server";

// GET all additionals
export async function GET(req: NextRequest) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const additionals = await Additional.get();

    return NextResponse.json(additionals);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST create a new additional
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    await Additional.create(body);

    return NextResponse.json(
      { message: "Additional created" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
