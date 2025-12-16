import customError from "@/server/errorHandler/customError";
import Transaction from "@/server/models/Transaction";
import { NextRequest, NextResponse } from "next/server";
import { IMidTrans } from "@/types/type";
interface IProps {
  params: Promise<{ transactionId: string }>;
}

export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const { transactionId } = await props.params;

    const body: IMidTrans = await req.json();

    const transaction = await Transaction.find(transactionId);
    transaction.midTransTransactionId = body.midTransTransactionId;
    transaction.midTransOrderId = body.midTransOrderId;

    transaction.save();

    return NextResponse.json(
      { message: "Transaction updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function GET(req: NextRequest, props: IProps) {
  try {
    const { transactionId } = await props.params;

    const transaction = await Transaction.find(transactionId);

    return NextResponse.json(transaction);
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
