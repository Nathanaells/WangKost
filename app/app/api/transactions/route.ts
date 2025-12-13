import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Transaction from "@/server/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

// GET all transactions
export async function GET(req: NextRequest) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    // Get all transactions - you might want to filter by owner's rents
    const transactions = await Transaction.get();

    return NextResponse.json(transactions);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
