import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Transaction from "@/server/models/Transaction";
import { ITransaction } from "@/types/type";
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

export async function POST(req: NextRequest) {
  try {
    const body: ITransaction = await req.json();
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    await Transaction.create({
      tenantId: body.tenantId,
      amount: body.amount,
      status: body.status,
      dueDate: new Date(body.dueDate),
      midTransTransactionId: body.midTransTransactionId,
      midTransOrderId: body.midtransOrderId,
      rentId: body.rentId,
    });

    return NextResponse.json(
      { message: "Transaction Created" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
