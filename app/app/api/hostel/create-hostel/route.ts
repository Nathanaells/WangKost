import { BadRequest, UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel, { hostelCreateSchema } from "@/server/models/Hostel";
import { IHostel } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body: IHostel = await req.json();
        // Validations
        //! Missing: Token validations from cookie?

        const id = req.headers.get('x-owner-id')
        if (!id) throw new UnauthorizedError()
        const _id = new ObjectId(id)

        // Parse and body validation
        hostelCreateSchema.parse({
            name: body.name,
            address: body.address,
        })

        // Duplicate Check
        const hostel = await Hostel.where({ name: body.name, ownerId: _id }).first();

        if (hostel) {
            throw new BadRequest("Hostel already exists")
        }

        // Create Hostel
        await Hostel.create({
            name: body.name,
            description: body.description,
            address: body.address,
            maxRoom: body.maxRoom,
            ownerId: _id,
        })
        return NextResponse.json(
            {message: "Hostel created"},
            {status: 201}
        )
    } catch (error: unknown) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})
    }
}