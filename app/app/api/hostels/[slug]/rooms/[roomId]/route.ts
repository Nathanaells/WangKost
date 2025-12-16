import { BadRequest, NotFoundError, UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent from "@/server/models/Rent";
import Room from "@/server/models/Room";
import Tenant, { tenantCreateSchema } from "@/server/models/Tenant";
import { ITenant } from "@/types/type";
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
    console.log(200, "GETTING RENT", rent)
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

// ADD TENANT - Redirects to /api/tenants
export async function POST(req: NextRequest, props: IProps) {
  try {
    const { roomId } = await props.params;
    const body = await req.json();

    // Add roomId to body and forward to tenants endpoint
    const tenantData = {
      ...body,
      roomId: roomId
    };

    // Forward request to tenants endpoint
    const baseUrl = req.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-owner-id': req.headers.get('x-owner-id') || ''
      },
      body: JSON.stringify(tenantData)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
