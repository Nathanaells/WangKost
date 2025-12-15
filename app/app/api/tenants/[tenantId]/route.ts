import {
  NotFoundError,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Tenant from "@/server/models/Tenant";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ tenantId: string }>;
}

export async function GET(req: NextRequest, props: IProps) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { tenantId } = await props.params;
    const tenantObjectId = new ObjectId(tenantId);

    const tenant = await Tenant.where("_id", tenantObjectId).first();
    if (!tenant) throw new NotFoundError("Tenant not found");

    return NextResponse.json(tenant);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}


export async function PATCH(req: NextRequest, props: IProps) {
  try {
    const body = await req.json();
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { tenantId } = await props.params;
    const tenantObjectId = new ObjectId(tenantId);

    const tenant = await Tenant.where("_id", tenantObjectId).first();
    if (!tenant) throw new NotFoundError("Tenant not found");

    await Tenant.where("_id", tenantObjectId).update(body);

    return NextResponse.json({ message: "Tenant updated" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

// DELETE tenant
export async function DELETE(req: NextRequest, props: IProps) {
  try {
    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    const { tenantId } = await props.params;
    const tenantObjectId = new ObjectId(tenantId);

    const tenant = await Tenant.where("_id", tenantObjectId).first();
    if (!tenant) throw new NotFoundError("Tenant not found");

    await Tenant.where("_id", tenantObjectId).delete();

    return NextResponse.json({ message: "Tenant deleted" });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
