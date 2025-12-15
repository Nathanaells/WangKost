import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Transaction from "@/server/models/Transaction";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ transactionId: string }>;
}

export async function GET(req: NextRequest, props: IProps) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { transactionId } = await props.params;
    const transactionObjectId = new ObjectId(transactionId);

    const transaction = await Transaction.where(
      "_id",
      transactionObjectId
    ).first();
    if (!transaction) throw new NotFoundError("Transaction not found");

    return NextResponse.json(transaction);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
