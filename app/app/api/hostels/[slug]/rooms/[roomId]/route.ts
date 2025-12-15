import { BadRequest, NotFoundError, UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent from "@/server/models/Rent";
import Room from "@/server/models/Room";
import { tenantCreateSchema } from "@/server/models/Tenant";
import { ITenant } from "@/types/type";
import { PhoneNumber } from "libphonenumber-js";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomId: string }>;
}

// GET single room with tenants
export async function GET(req: NextRequest, props: IProps) {
  try {
    const { roomId } = await props.params;
    const roomObjectId = new ObjectId(roomId);

    const rent = await Rent.where("roomId", roomObjectId).first();
    console.log(200,"GETTING RENT",rent)
    const room = await Room.where("_id", roomObjectId).first();

    // Validation check
    if (!room) throw new NotFoundError("Room not found");

    
    if (!rent) {
      return NextResponse.json(room)
    }
    // If rent returns empty then we should just give back room data.
    // Otherwise, return with list of tenants.


    return NextResponse.json(room);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// PATCH update room
// No Function yet?
export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const { roomId } = await props.params;
    const roomObjectId = new ObjectId(roomId);

    const room = await Room.where("_id", roomObjectId).first();
    if (!room) throw new NotFoundError("Room not found");

    await Room.where("_id", roomObjectId).update(body);

    return NextResponse.json({ message: "Room updated" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// DELETE room
export async function DELETE(req: NextRequest, props: IProps) {
  try {
    const { roomId } = await props.params;
    const roomObjectId = new ObjectId(roomId);

    const room = await Room.where("_id", roomObjectId).first();
    if (!room) throw new NotFoundError("Room not found");

    await Room.where("_id", roomObjectId).delete();

    return NextResponse.json({ message: "Room deleted" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// ADD TENANT AND CREATE RENT AUTOMATICALLY
export async function POST(req: NextRequest, props: IProps) {
  try {
    // Validations
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();
    const _id = new ObjectId(id);

    // Get roomId
    const { roomId } = await props.params;
    const roomObjectId = new ObjectId(roomId);

    // Get tenant input data from body
    const body: ITenant = await req.json();
    
    // Attempt to find room
    const room = await Room.where("_id", roomObjectId).first();
    if (!room) throw new NotFoundError("Room not found");

    // Check if room is avaiable.
    if (!room?.isAvailable) throw new BadRequest("Room is not available")
    


    // Parse and body validation
    tenantCreateSchema.parse({
      name: body.name,
      email: body.email,
      birthday: body.birthday,
      phoneNumber: body.phoneNumber,
      isActive: true
    });


  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
