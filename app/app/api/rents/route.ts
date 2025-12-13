import {
  BadRequest,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import Room from "@/server/models/Room";
import Rent, { rentCreateSchema } from "@/server/models/Rent";
import { IRent } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET all rents for owner
export async function GET(req: NextRequest) {
  try {
    // Validations
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();
    const _id = new ObjectId(id);

    // Get owner's hostels
    const hostels = await Hostel.where("ownerId", _id).get();
    const hostelIds = hostels.map((hostel) => hostel._id);

    // Get rooms for those hostels
    const rooms = await Room.whereIn("hostelId", hostelIds).get();
    const roomIds = rooms.map((room) => room._id);

    // Get rents for those rooms
    const rents = await Rent.whereIn("roomId", roomIds).get();

    return NextResponse.json(rents);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST create a new rent
export async function POST(req: NextRequest) {
  try {
    const body: IRent = await req.json();

    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    // Parse and body validation
    rentCreateSchema.parse({
      price: body.price,
      roomId: body.roomId.toString(),
      tenantId: body.tenantId.toString(),
      joinAt: body.joinAt ? new Date(body.joinAt) : undefined,
    });

    const roomId = new ObjectId(body.roomId);
    const tenantId = new ObjectId(body.tenantId);

    // Duplicate Check - Check if tenant already has an active rent
    const existingRent = await Rent.where("tenantId", tenantId)
      .where("leaveAt", null)
      .first();

    if (existingRent) {
      throw new BadRequest("Tenant already has an active rent");
    }

    // Create Rent
    await Rent.create({
      price: body.price,
      roomId: roomId,
      tenantId: tenantId,
      additionals: [],
      joinAt: body.joinAt ? new Date(body.joinAt) : new Date(),
    });
    return NextResponse.json({ message: "Rent created" }, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
