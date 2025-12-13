import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Additional from "@/server/models/Additional";
import Rent from "@/server/models/Rent";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ rentId: string }>;
}

// GET all additionals for a rent
export async function GET(req: NextRequest, props: IProps) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { rentId } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).get();
    if (!rent) throw new NotFoundError("Rent not found");

    return NextResponse.json(rent);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST add additional to rent
export async function POST(req: NextRequest, props: IProps) {
  try {
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { additionalId } = await req.json();
    const { rentId } = await props.params;

    const rent = (await Rent.find(rentId)) as Rent;
    if (!rent) throw new NotFoundError("Rent not found");

    const additional = await Additional.find(additionalId);
    if (!additional) throw new NotFoundError("Additional not found");

    // ORM Mongoloquent — attach by ID
    await rent.additionals().attach(additional._id);

    return NextResponse.json(
      { message: "Additional added to rent" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
