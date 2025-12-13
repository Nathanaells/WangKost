// Looksup rents via lookup
import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import Room from "@/server/models/Room";
import Rent from "@/server/models/Rent";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Validations
        const id = req.headers.get('x-owner-id')
        if (!id) throw new UnauthorizedError()
        const _id = new ObjectId(id)
        
        // Get owner's hostels
        const hostels = await Hostel.where("ownerId", _id).get()
        const hostelIds = hostels.map(hostel => hostel._id)

        // Get rooms for those hostels
        const rooms = await Room.whereIn("hostelId", hostelIds).get()
        const roomIds = rooms.map(room => room._id)

        // Get rents for those rooms
        const rents = await Rent.whereIn("roomId", roomIds).get()

        return NextResponse.json(rents)

    } catch (error: unknown) {
        const {message, status} = customError(error)
        return NextResponse.json({message}, {status})
    }
}