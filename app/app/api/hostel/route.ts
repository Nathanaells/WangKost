import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Validations
        const id = req.headers.get('x-owner-id')
        if (!id) throw new UnauthorizedError()
        const _id = new ObjectId(id)
        
        // Get & Send Data
        const hostels = await Hostel.where("ownerId", _id).get()

        return NextResponse.json(hostels)

    } catch (error: unknown) {
        const {message, status} = customError(error)
        return NextResponse.json({message}, {status})
    }
}