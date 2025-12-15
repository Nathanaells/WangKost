import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent from "@/server/models/Rent";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ rentId: string }>;
}

// GET single rent
export async function GET(req: NextRequest, props: IProps) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { rentId } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new NotFoundError("Rent not found");

    return NextResponse.json(rent);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// PATCH update rent (e.g., set leaveAt date, update price)
export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { rentId } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new NotFoundError("Rent not found");

    await Rent.where("_id", rentObjectId).update(body);

    return NextResponse.json({ message: "Rent updated" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
