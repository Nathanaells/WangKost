import { NotFoundError, UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Validations
        const ownerId = req.headers.get('x-owner-id')
        if (!ownerId) throw new UnauthorizedError()
        const ownerObjectId = new ObjectId(ownerId)
        
        // Get hostel by ID from params
        const hostelId = new ObjectId(params.id)


        const hostel = await Hostel.where("_id", hostelId).first()
        if (!hostel) {
            throw new NotFoundError("Hostel not found")
        }

        return NextResponse.json(hostel)

    } catch (error: unknown) {
        const {message, status} = customError(error)
        return NextResponse.json({message}, {status})
    }
}