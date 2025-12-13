import { BadRequest } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import { hashPassword } from "@/server/helpers/bcrypt";
import Owner, { ownerSchema } from "@/server/models/Owner";
import { IOwner } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body: IOwner = await req.json();

    ownerSchema.parse({
      name: body.name,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
    });

    const owner = await Owner.where("email", body.email)
      .where("phoneNumber", body.phoneNumber)
      .first();

    if (owner) {
      throw new BadRequest("Email or Phone Number Already used");
    }

    body.password = await hashPassword(body.password);

    await Owner.create({
      name: body.name,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
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
