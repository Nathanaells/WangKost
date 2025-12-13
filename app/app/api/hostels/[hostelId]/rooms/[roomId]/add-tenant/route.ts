import {
  BadRequest,
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Room from "@/server/models/Room";
import Tenant from "@/server/models/Tenant";
import Rent from "@/server/models/Rent";
import Additional from "@/server/models/Additional";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ hostelId: string; roomId: string }>;
}

/**
 * POST - Add tenant to room
 * This will:
 * 1. Check if room exists and is available
 * 2. Check if tenant exists and is not already renting
 * 3. Get all additionals for the rent
 * 4. Create a new Rent record
 * 5. Update room's tenants array
 * 6. Mark room as unavailable if needed
 */
export async function POST(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { hostelId, roomId } = await props.params;
    const roomObjectId = new ObjectId(roomId);
    const tenantId = new ObjectId(body.tenantId);

    // 1. Check if room exists
    const room = await Room.where("_id", roomObjectId).first();
    if (!room) throw new NotFoundError("Room not found");

    // 2. Check if tenant exists
    const tenant = await Tenant.where("_id", tenantId).first();
    if (!tenant) throw new NotFoundError("Tenant not found");

    // 3. Check if tenant already has active rent
    const existingRent = await Rent.where("tenantId", tenantId)
      .where("leaveAt", null)
      .first();

    if (existingRent) {
      throw new BadRequest("Tenant already has an active rent");
    }

    // 4. Get all additionals to be included in the rent
    const additionals = await Additional.get();
    const additionalIds = additionals.map((add: any) => add._id);

    // 5. Calculate total price (room fixed cost + additionals)
    const totalAdditionalPrice = additionals.reduce(
      (sum: number, add: any) => sum + (add.price || 0),
      0
    );
    const totalPrice = (room.fixedCost || 0) + totalAdditionalPrice;

    // 6. Create Rent record
    const joinAt = body.joinAt ? new Date(body.joinAt) : new Date();
    
    const newRent = await Rent.create({
      price: totalPrice,
      roomId: roomObjectId,
      tenantId: tenantId,
      additionals: additionalIds,
      joinAt: joinAt,
    });

    // 7. Update room - add tenant to tenants array
    const currentTenants: any = room.tenants || [];
    currentTenants.push(tenantId);

    await Room.where("_id", roomObjectId).update({
      tenants: currentTenants,
      isAvailable: false, // Mark room as unavailable
    });

    // 8. Update tenant - add rent to rents array
    const currentRents: any = tenant.rents || [];
    currentRents.push(newRent._id);

    await Tenant.where("_id", tenantId).update({
      rents: currentRents,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Tenant added to room successfully",
        data: {
          rentId: newRent._id,
          totalPrice,
          joinAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
