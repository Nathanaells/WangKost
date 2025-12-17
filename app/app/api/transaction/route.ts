import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Transaction from "@/server/models/Transaction";
import { ITransaction, TransactionStatus } from "@/types/type";
import { ObjectId } from "mongodb";
import { DB } from "mongoloquent";
import { NextRequest, NextResponse } from "next/server";
import { ITransactionResponse } from "@/types/type";

interface IMatchStage {
  "hostel.ownerId": ObjectId;
  status?: string;
}

interface IAggregationResult {
  data: ITransactionResponse[];
  totalCount: Array<{ count: number }>;
}

interface IProps {
  searchParams: Promise<{ [keyword: string]: string | string[] | undefined }>;
}

// Interface untuk match stage di aggregation
interface IMatchStage {
  "hostel.ownerId": ObjectId;
  status?: string;
}

// Interface untuk Tenant
interface ITenant {
  _id: ObjectId;
  name: string;
  email?: string;
  phone?: string;
}

// Interface untuk Hostel
interface IHostel {
  _id: ObjectId;
  name: string;
  address?: string;
  ownerId: ObjectId;
}

// Interface untuk single result dari aggregation
interface IAggregationResult {
  data: ITransactionResponse[];
  totalCount: Array<{ count: number }>;
}

interface IProps {
  searchParams: Promise<{ [keyword: string]: string | string[] | undefined }>;
}

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
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();
    const _id = new ObjectId(ownerId);
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status"); // PAID | UNPAID | PENDING | null

    const skip = (page - 1) * limit;

    const matchStage: IMatchStage = {
      "hostel.ownerId": _id,
    };

    if (status && status !== "ALL") {
      matchStage.status = status;
    }

    const pipeline = [
      {
        $lookup: {
          from: "rents",
          localField: "rentId",
          foreignField: "_id",
          as: "rent",
        },
      },
      { $unwind: "$rent" },

      {
        $lookup: {
          from: "rooms",
          localField: "rent.roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },

      {
        $lookup: {
          from: "hostels",
          localField: "room.hostelId",
          foreignField: "_id",
          as: "hostel",
        },
      },
      { $unwind: "$hostel" },

      {
        $lookup: {
          from: "tenants",
          localField: "tenantId",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: "$tenant" },

      { $match: matchStage },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                tenantId: 1,
                rentId: 1,
                amount: 1,
                status: 1,
                dueDate: 1,
                paidAt: 1,
                midTransTransactionId: 1,
                midTransOrderId: 1,
                createdAt: 1,
                updatedAt: 1,
                tenant: {
                  name: 1,
                },
                hostel: {
                  name: 1,
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await DB.collection("transactions").raw(pipeline).get();

    const aggregationResult = Array.isArray(result)
      ? (result[0] as IAggregationResult)
      : null;

    const transactions: ITransactionResponse[] = aggregationResult?.data || [];
    const total: number = aggregationResult?.totalCount[0]?.count || 0;

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
