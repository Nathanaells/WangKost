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
    const { tenantId } = await props.params;
    const tenantObjectId = new ObjectId(tenantId);

    const tenant = await Tenant.where("_id", tenantObjectId)
      .where("isActive", true)
      .first();
    if (!tenant) throw new NotFoundError("Tenant not found");

    return NextResponse.json(tenant);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
