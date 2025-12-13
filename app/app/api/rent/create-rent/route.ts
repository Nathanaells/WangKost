import { BadRequest, UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent, { rentCreateSchema } from "@/server/models/Rent";
import { IRent } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const body: IRent = await req.json();
        // Validations
        //! Missing: Token validations from cookie?

        const id = req.headers.get('x-owner-id')
        if (!id) throw new UnauthorizedError()

        // Parse and body validation
        rentCreateSchema.parse({
            price: body.price,
            roomId: body.roomId.toString(),
            tenantId: body.tenantId.toString(),
            joinAt: body.joinAt ? new Date(body.joinAt) : undefined,
        })

        const roomId = new ObjectId(body.roomId);
        const tenantId = new ObjectId(body.tenantId);

        // Duplicate Check - Check if tenant already has an active rent
        const existingRent = await Rent.where("tenantId", tenantId)
            .where("leaveAt", null)
            .first();

        if (existingRent) {
            throw new BadRequest("Tenant already has an active rent")
        }

        // Create Rent
        await Rent.create({
            price: body.price,
            roomId: roomId,
            tenantId: tenantId,
            additionals: [],
            joinAt: body.joinAt ? new Date(body.joinAt) : new Date(),
        })
        return NextResponse.json(
            {message: "Rent created"},
            {status: 201}
        )
    } catch (error: unknown) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})
    }
}
