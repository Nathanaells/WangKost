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

// GET all additionals for a rent
export async function GET(req: NextRequest, props: IProps) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { rentId } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new NotFoundError("Rent not found");

    return NextResponse.json(rent.additionals || []);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST add additional to rent
export async function POST(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { rentId } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new NotFoundError("Rent not found");

    // Add additional to rent's additionals array
    const additionals = rent.additionals || [];
    additionals.push(body);

    await Rent.where("_id", rentObjectId).update({ additionals });

    return NextResponse.json(
      { message: "Additional added to rent" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
