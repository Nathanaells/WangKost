import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Owner from "@/server/models/Owner";
import Rent from "@/server/models/Rent";
import Transaction from "@/server/models/Transaction";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest) {
    try {
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();
    const _id = new ObjectId(ownerId);

    const owner = await Owner.with("rooms").where("_id", ownerId).first();

    const roomIds = owner?.rooms?.map((room) => room._id);
    console.log(200, "ROOMID",roomIds)
    // Rent Loop
    const rents = await Rent.whereIn("roomId", roomIds as ObjectId[])
      .get()
    const rentIds : ObjectId[] = []
    rents.forEach(element => {
      rentIds.push(element._id)
    });

    console.log(200, "RENTID",rentIds)
    const transactions = await Transaction.whereIn("rentId", rentIds).get()
    
    console.log(transactions)
    return NextResponse.json(transactions)
    } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });  
    }
}    
    
