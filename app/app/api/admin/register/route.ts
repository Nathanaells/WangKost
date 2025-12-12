import { BadRequest } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import { hashPassword } from "@/server/helpers/bcrypt";
import Owner, { ownerSchema } from "@/server/models/Owner";
import { IOwner } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body: IOwner = await req.json();
    console.log(body);

    if (!body.name) {
      throw new BadRequest("Name required");
    }

    if (!body.email) {
      throw new BadRequest("Email required");
    }

    if (!body.password) {
      throw new BadRequest("Password required");
    }

    if (!body.phoneNumber) {
      throw new BadRequest("Phone number required");
    }

    ownerSchema.parse({
      name: body.name,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
    });

    body.password = await hashPassword(body.password);

    await Owner.create({
      name: body.name,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
      hostels: [],
    });

    return NextResponse.json(
      { message: "Success Registering" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
