import { BadRequest } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import { hashPassword } from "@/server/helpers/bcrypt";
import Owner, { ownerRegisterSchema } from "@/server/models/Owner";
import { IOwner } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body: IOwner = await req.json();

    ownerRegisterSchema.parse({
      name: body.name,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
    });
    console.log(body)
    // DUPLICATE CHECK
    const existingEmail = await Owner.where("email", body.email).first();
    if (existingEmail) {
      throw new BadRequest("error: Email already registered");
    }

    const existingPhone = await Owner.where("phoneNumber", body.phoneNumber).first();
    if (existingPhone) {
      throw new BadRequest("error: Phone number already registered");
    }
    

    // OWNER CREATION
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
