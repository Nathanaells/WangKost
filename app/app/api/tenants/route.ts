import {
  BadRequest,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Tenant, { tenantCreateSchema } from "@/server/models/Tenant";
import { ITenant } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

// GET all tenants for the owner
export async function GET(req: NextRequest) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    // Get all tenants - you might want to filter by owner if needed
    const tenants = await Tenant.get();

    return NextResponse.json(tenants);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// POST create a new tenant
export async function POST(req: NextRequest) {
  try {
    const body: ITenant = await req.json();

    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    // Parse and body validation
    tenantCreateSchema.parse({
      name: body.name,
      email: body.email,
      birthday: new Date(body.birthday),
      phoneNumber: body.phoneNumber,
    });

    // Duplicate Check
    const tenant = await Tenant.where("email", body.email).first();

    if (tenant) {
      throw new BadRequest("Tenant already exists");
    }

    // Create Tenant
    await Tenant.create({
      name: body.name,
      email: body.email,
      birthday: new Date(body.birthday),
      phoneNumber: body.phoneNumber,
      isActive: body.isActive ?? true,
      rents: [],
    });
    return NextResponse.json({ message: "Tenant created" }, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
