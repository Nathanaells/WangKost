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

        // Get hostel by ID from params
        const hostelId = new ObjectId(params.id)
        console.log(hostelId)
        
        const hostel = await Hostel.where("_id", hostelId).first();
        console.log(hostel, "HOSTEL", 200)
        if (!hostel) {
            throw new NotFoundError("Hostel not found")
        }

        return NextResponse.json(hostel)

    } catch (error: unknown) {
        const {message, status} = customError(error)
        return NextResponse.json({message}, {status})
    }
}