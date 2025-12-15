import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Hostel from "@/server/models/Hostel";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ slug: string }>;
}

// GET single hostel by ID
export async function GET(req: NextRequest, props: IProps) {
  try {
    // Validations
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    // Mutating to Object ID
    const ownerObjectId = new ObjectId(ownerId);
    const { slug } = await props.params;

    const hostelSlug = slug
    const hostel = await Hostel.where("ownerId", ownerObjectId)
      .where("slug", hostelSlug)
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

// PATCH update hostel
export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const ownerObjectId = new ObjectId(ownerId);
    const { slug } = await props.params;
    const hostelSlug = slug

    const hostel = await Hostel.where("ownerId", ownerObjectId)
      .where("slug", hostelSlug)
      .first();

    if (!hostel) {
      throw new NotFoundError("Hostel not found");
    }

    // Update hostel
    await Hostel.where("slug", hostelSlug).update(body);

    return NextResponse.json({ message: "Hostel updated" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// DELETE hostel
export async function DELETE(req: NextRequest, props: IProps) {
  try {
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const ownerObjectId = new ObjectId(ownerId);
    const { slug } = await props.params;
    const hostelSlug = slug;

    const hostel = await Hostel.where("ownerId", ownerObjectId)
      .where("slug", hostelSlug)
      .first();

    if (!hostel) {
      throw new NotFoundError("Hostel not found");
    }

    // Delete hostel
    await Hostel.where("slug", hostelSlug).delete();

    return NextResponse.json({ message: "Hostel deleted" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
