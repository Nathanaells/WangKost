import {
  BadRequest,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import Room from "@/server/models/Room";
import Rent, { rentCreateSchema } from "@/server/models/Rent";
import { IRent } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

// GET all rents for owner
export async function GET(req: NextRequest) {
  try {
    // Validations
    const day1 = dayjs()
      .tz("Asia/Jakarta")
      .add(7, "day")
      .hour(0)
      .minute(0)
      .second(0)
      .format("YYYY-MM-DD HH:mm:ss");
    const day2 = dayjs()
      .tz("Asia/Jakarta")
      .add(12, "day")
      .hour(23)
      .minute(59)
      .second(59)
      .format("YYYY-MM-DD HH:mm:ss");

    // Convert string to Date object
    const formatedDate1 = new Date(day1);
    const formatedDate2 = new Date(day2);

    // Query rents where joinAt is between formatedDate1 and formatedDate2
    const rents = await Rent.where("joinAt", ">=", formatedDate1)
      .where("joinAt", "<=", formatedDate2)
      .get();

    // console.log("Found rents:", rent.length);
    return NextResponse.json(rents);
  } catch (error: unknown) {
    console.log(error);
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST create a new rent
export async function POST(req: NextRequest) {
  try {
    const body: IRent = await req.json();
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    // Parse and body validation
    rentCreateSchema.parse({
      price: body.price,
      roomId: body.roomId.toString(),
      tenantId: body.tenantId.toString(),
      joinAt: body.joinAt ? new Date(body.joinAt) : undefined,
    });

    const roomId = new ObjectId(body.roomId);
    const tenantId = new ObjectId(body.tenantId);

    // Duplicate Check - Check if tenant already has an active rent
    const existingRent = await Rent.where("tenantId", tenantId)
      .where("leaveAt", null)
      .first();

    if (existingRent) {
      throw new BadRequest("Tenant already has an active rent");
    }

    // Create Rent
    await Rent.create({
      price: body.price,
      roomId: roomId,
      tenantId: tenantId,
      joinAt: body.joinAt ? new Date(body.joinAt) : new Date(),
    });
    return NextResponse.json({ message: "Rent created" }, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
