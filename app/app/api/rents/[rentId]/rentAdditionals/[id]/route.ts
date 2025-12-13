import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent from "@/server/models/Rent";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ rentId: string; id: string }>;
}

// PATCH update specific additional in rent
export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { rentId, id } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new NotFoundError("Rent not found");

    // Find and update the specific additional
    const additionals = rent.additionals || [];
    const index = additionals.findIndex(
      (add: any) => add._id?.toString() === id
    );

    if (index === -1) {
      throw new NotFoundError("Additional not found in rent");
    }

    additionals[index] = { ...additionals[index], ...body };

    await Rent.where("_id", rentObjectId).update({ additionals });

    return NextResponse.json({ message: "Rent additional updated" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// DELETE specific additional from rent
export async function DELETE(req: NextRequest, props: IProps) {
  try {
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { rentId, id } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new NotFoundError("Rent not found");

    // Remove the specific additional
    const additionals = rent.additionals || [];
    const filteredAdditionals = additionals.filter(
      (add: any) => add._id?.toString() !== id
    );

    if (additionals.length === filteredAdditionals.length) {
      throw new NotFoundError("Additional not found in rent");
    }

    await Rent.where("_id", rentObjectId).update({
      additionals: filteredAdditionals,
    });

    return NextResponse.json({ message: "Rent additional deleted" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
