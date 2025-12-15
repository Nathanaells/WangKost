import { NotFoundError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Room from "@/server/models/Room";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomId: string }>;
}

// GET single room
export async function GET(req: NextRequest, props: IProps) {
  try {
    const { roomId } = await props.params;
    const roomObjectId = new ObjectId(roomId);

    const room = await Room.where("_id", roomObjectId).first();
    if (!room) throw new NotFoundError("Room not found");

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
