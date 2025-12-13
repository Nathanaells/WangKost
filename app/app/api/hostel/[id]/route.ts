import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, props: IProps) {
  try {
    // Validations
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    // Mutating to Object ID
    const ownerObjectId = new ObjectId(ownerId);
    const { id } = await props.params;

    const hostelId = new ObjectId(id);
    const hostel = await Hostel.where("ownerId", ownerObjectId)
      .where("_id", hostelId)
      .first();

    if (!hostel) {
      throw new NotFoundError("Hostel not found");
    }

    return NextResponse.json(hostel);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
