import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Additional from "@/server/models/Additional";
import Rent from "@/server/models/Rent";
import {
  IRentObject,
  IRespAdditional,
  IRentWithAdditionals,
} from "@/types/type";
import { ObjectId } from "mongodb";
import { DB } from "mongoloquent";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ rentId: string }>;
}

export async function GET(req: NextRequest, props: IProps) {
  try {
    const { rentId } = await props.params;
    const rentObjectId = new ObjectId(rentId);

    // Check if rent exists
    const rentExists = await Rent.find(rentObjectId);
    if (!rentExists) throw new NotFoundError("Rent not found");

    // Aggregate rent with additionals - menggunakan generic type
    const rentWithAdditionals = await DB.collection<
      IRentObject<IRespAdditional[]>
    >("rents")
      .raw({
        $match: {
          _id: rentObjectId,
        },
      })
      .lookup({
        from: "additional_rent",
        localField: "_id",
        foreignField: "rent_id",
        as: "rentAdditional",
      })
      .lookup({
        from: "additionals",
        localField: "rentAdditional.additional_id",
        foreignField: "_id",
        as: "additionals",
      })
      .raw({
        $unset: ["createdAt", "updatedAt", "rentAdditional"],
      })
      .first();

    if (!rentWithAdditionals) {
      throw new NotFoundError("Rent not found");
    }

    // Response dengan type IRentWithAdditionals
    const response: IRentWithAdditionals = {
      _id: rentWithAdditionals._id,
      roomId: rentWithAdditionals.roomId,
      tenantId: rentWithAdditionals.tenantId,
      price: rentWithAdditionals.price,
      joinAt: rentWithAdditionals.joinAt,
      additionals: rentWithAdditionals.additionals,
      ...(rentWithAdditionals.leaveAt && {
        leaveAt: rentWithAdditionals.leaveAt,
      }),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

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
