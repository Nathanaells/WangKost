import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import { comparePassword } from "@/server/helpers/bcrypt";
import { signToken } from "@/server/helpers/jwt";
import Owner, { ownerLoginSchema } from "@/server/models/Owner";
import { ILogin } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // console.log("tes <>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    const body: ILogin = await req.json();

    ownerLoginSchema.parse({
      phoneNumber: body.phoneNumber,
      password: body.password,
    });

    const owner = await Owner.where("phoneNumber", body.phoneNumber).first();

    if (!owner) {
      throw new UnauthorizedError("Invalid Phone number/password");
    }

    const isValidPassword = await comparePassword(
      body.password,
      owner?.password as string
    );

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid Phone number/password");
    }

    const access_token = signToken({
      userId: owner._id,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
    });

    return NextResponse.json({ access_token });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
