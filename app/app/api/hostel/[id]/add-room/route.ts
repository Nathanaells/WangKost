import customError from "@/server/errorHandler/customError";
import Room from "@/server/models/Room";
import { IRoom } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body: IRoom = await req.json();
        // Validations
        //! Do we even need it? All rooms are defaulted to empty anyways.
        // Get hostelId from route params
        const hostelId = new ObjectId(params.id);

        await Room.create({
            fixedCost: body.fixedCost,
            isAvailable: true,
            hostelId,
            tenants: []
        });

        return NextResponse.json(
            { message: "Room added successfully" },
            { status: 201 }
        );
    } catch (error: unknown) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})
    }
}