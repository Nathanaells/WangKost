import { NotFoundError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Room from "@/server/models/Room";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Get ID From params
        const roomId = new ObjectId(params.id);

        const room = await Room.where("_id", roomId).first()
        if (!room) throw new NotFoundError("Room not found")

        return NextResponse.json(room);
    } catch (error: unknown) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})
    }
}