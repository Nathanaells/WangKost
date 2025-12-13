import { BadRequest, NotFoundError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Room from "@/server/models/Room";
import Tenant from "@/server/models/Tenant";
import Rent from "@/server/models/Rent";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const insertTenantSchema = z.object({
    tenantId: z.string().min(1, "Tenant ID is required"),
    price: z.number().positive("Price must be positive"),
    joinAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }){
    try {
        const body = await req.json();
        const roomId = new ObjectId(params.id);

        // Validate input
        insertTenantSchema.parse({
            tenantId: body.tenantId,
            price: body.price,
            joinAt: body.joinAt,
        });

        const tenantId = new ObjectId(body.tenantId);

        // Check if room exists
        const room = await Room.where("_id", roomId).first();
        if (!room) {
            throw new NotFoundError("Room not found");
        }

        // Check if tenant exists
        const tenant = await Tenant.where("_id", tenantId).first();
        if (!tenant) {
            throw new NotFoundError("Tenant not found");
        }

        // Check if tenant already has an active rent
        const existingRent = await Rent.where("tenantId", tenantId)
            .where("leaveAt", null)
            .first();

        if (existingRent) {
            throw new BadRequest("Tenant already has an active rent");
        }

        // Check if room is available
        if (!room.isAvailable) {
            throw new BadRequest("Room is not available");
        }

        // Create the Rent object
        await Rent.create({
            price: body.price,
            roomId: roomId,
            tenantId: tenantId,
            additionals: body.additionals || [],
            joinAt: body.joinAt ? new Date(body.joinAt) : new Date(),
        });

        // Update tenant to active
        await Tenant.where("_id", tenantId).update({
            isActive: true,
        });

        // Update room availability
        await Room.where("_id", roomId).update({
            isAvailable: false,
        });

        return NextResponse.json(
            { message: "Tenant inserted and rent created successfully" },
            { status: 200 }
        );
    } catch (error) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})  
    }
}