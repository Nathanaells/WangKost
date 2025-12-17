import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Owner from "@/server/models/Owner";
import Rent from "@/server/models/Rent";
import Transaction from "@/server/models/Transaction";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const ownerId = req.headers.get("x-owner-id");
    console.log("OWNER ID", ownerId);
    if (!ownerId) throw new UnauthorizedError();
    const _id = new ObjectId(ownerId);

    const owner = await Owner.with("rooms").where("_id", _id).first();

    const roomIds = owner?.rooms?.map((room) => room._id);

    // Rent Loop
    const rents = await Rent.whereIn("roomId", roomIds as ObjectId[]).get();
    const rentIds: ObjectId[] = [];
    rents.forEach((element) => {
      rentIds.push(element._id);
    });

    const transactions = await Transaction.whereIn("rentId", rentIds)
      .where("status", "PAID")
      .get();

    return NextResponse.json(transactions);
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
