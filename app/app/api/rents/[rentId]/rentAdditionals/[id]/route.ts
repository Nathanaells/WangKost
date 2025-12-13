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
  params: Promise<{ rentId: string; id: string }>;
}

// DELETE specific additional from rent
export async function DELETE(req: NextRequest, props: IProps) {
  try {
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { rentId, id } = await props.params;

    const rent = (await Rent.find(rentId)) as Rent;
    if (!rent) throw new NotFoundError("Rent not found");

    const additional = await Additional.where("_id", id).first();
    if (!additional) throw new NotFoundError("Additional not found");

    // ORM Mongoloquent — detach relation
    await rent.additionals().detach(additional._id);

    return NextResponse.json({
      message: "Additional removed from rent",
    });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
