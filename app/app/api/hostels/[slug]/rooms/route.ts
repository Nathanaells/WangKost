import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import Room from "@/server/models/Room";
import { IRoom } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { NotFoundError } from "@/server/errorHandler/classError";

interface IProps {
  params: Promise<{ slug: string }>;
}

// GET all rooms for a hostel
export async function GET(req: NextRequest, props: IProps) {
  try {
    const { slug } = await props.params;
    const hostelSlug = slug;
    
    // Get hostel by slug to retrieve hostelId
    const hostel = await Hostel.where("slug", hostelSlug).first();
    if (!hostel) {
      throw new NotFoundError("Hostel not found");
    }
    const hostelId = hostel?._id // Can be null...


    // Get rooms using the hostelId from the hostel
    const rooms = await Room.where("hostelId", hostel._id).get();

    return NextResponse.json(rooms);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST create a new room for a hostel
export async function POST(req: NextRequest, props: IProps) {
  try {
    const body: IRoom = await req.json();
    const { slug } = await props.params;
    const hostelSlug = slug;

    // Get hostel by slug to retrieve hostelId
    const hostel = await Hostel.where("slug", hostelSlug).first();
    if (!hostel) {
      throw new NotFoundError("Hostel not found");
    }
    const hostelId = hostel?._id

    // Create room using the hostelId from the hostel
    await Room.create({
      fixedCost: body.fixedCost,
      isAvailable: true,
      hostelId: hostelId,
    });

    return NextResponse.json(
      { message: "Room added successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
