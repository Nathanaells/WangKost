import { UnauthorizedError } from "@/server/errorHandler/classError";
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
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();
    const _id = new ObjectId(id);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Transaction.with('rent').with('room').with('hostel').where('hostel.ownerId', _id).count();

    // Get paginated transactions
    const transactions = await Transaction.with('rent')
      .with('room')
      .with('hostel')
      .where('hostel.ownerId', _id)
      .skip(skip)
      .take(limit)
      .get();

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
