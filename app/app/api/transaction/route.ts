import customError from "@/server/errorHandler/customError";
import Additional from "@/server/models/Additional";
import Rent from "@/server/models/Rent";
import Transaction from "@/server/models/Transaction";
import { ITransaction, TransactionStatus } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body: ITransaction = await req.json();

    const tenantId = new ObjectId(body.tenantId);
    const rentId = new ObjectId(body.rentId);

    const transaction = await Transaction.create({
      tenantId,
      status: TransactionStatus.unpaid,
      amount: body.amount,
      dueDate: new Date(body.dueDate),
      rentId,
    });

    return NextResponse.json(
      {
        message: "Transaction Successfully Created",
        transactionId: transaction._id,
      },
      { status: 201 }
    );
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const transactions = await Transaction.get()


    // Should return a list of transactions of Owner WITH pagination...
    return NextResponse.json({
      transactions
    })
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
