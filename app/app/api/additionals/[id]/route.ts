import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Additional from "@/server/models/Additional";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ id: string }>;
}

// PATCH update additional
export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { id } = await props.params;
    const additionalObjectId = new ObjectId(id);

    const additional = await Additional.where(
      "_id",
      additionalObjectId
    ).first();
    if (!additional) throw new NotFoundError("Additional not found");

    await Additional.where("_id", additionalObjectId).update(body);

    return NextResponse.json({ message: "Additional updated" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// DELETE additional
export async function DELETE(req: NextRequest, props: IProps) {
  try {
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { id } = await props.params;
    const additionalObjectId = new ObjectId(id);

    const additional = await Additional.where(
      "_id",
      additionalObjectId
    ).first();
    if (!additional) throw new NotFoundError("Additional not found");

    await Additional.where("_id", additionalObjectId).delete();

    return NextResponse.json({ message: "Additional deleted" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
