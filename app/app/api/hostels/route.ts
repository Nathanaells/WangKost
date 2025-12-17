import {
  BadRequest,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel, { hostelCreateSchema } from "@/server/models/Hostel";
import Room from "@/server/models/Room";
import { IHostel } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET HOSTELS (for owner)
export async function GET(req: NextRequest) {
  try {
    // Validations
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();
    const _id = new ObjectId(id);


    const hostels = await Hostel.where("ownerId", _id).get();

    return NextResponse.json(hostels);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// CREATE HOSTEL
export async function POST(req: NextRequest) {
  try {
    const body: IHostel = await req.json();
    // Validations
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();
    const ownerId = new ObjectId(id);

    // Slug Creator
    const newSlug = body.name.toLowerCase().split(" ").join("-");

    // Parse and body validation
    hostelCreateSchema.parse({
      name: body.name,
      address: body.address,
      slug: newSlug,
    });

    const hostel = await Hostel.where("slug", newSlug).first();

    if (hostel) {
      throw new BadRequest("Hostel already exists");
    } 

   const newHostel = await Hostel.create({
      name: body.name,
      address: body.address,
      slug: newSlug,
      ownerId,
    });
    return NextResponse.json({
      message: "Hostel created",
      status: 201
    })
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
