import {
  BadRequest,
  UnauthorizedError,
} from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent from "@/server/models/Rent";
import Room from "@/server/models/Room";
import Tenant, { tenantCreateSchema } from "@/server/models/Tenant";
import { ICreateTenant, ITenant } from "@/types/type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { DB } from "mongoloquent";
import Owner from "@/server/models/Owner";

export async function GET(req: NextRequest) {
  try {
    const id = req.headers.get("x-owner-id");
    // console.log(id)
    if (!id) throw new UnauthorizedError();
    const ownerId = new ObjectId(id)
    // console.log(ownerId)

    const owner = await Owner.with('rooms').where('_id', ownerId).first()
    // console.log(owner)
    const roomIds = owner?.rooms?.map(room => room._id)
    const rooms = await Room.whereIn('_id', roomIds as ObjectId[]).with('tenants').get()
    const tenants  : any[] = []
    rooms.forEach(room => {
      room.tenants.forEach(tenant => {
        tenants.push(tenant)
      })
    })
    // console.log(roomIds)
    // console.log(rooms)
    // console.log(tenants)
    return NextResponse.json(tenants);
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ICreateTenant = await req.json();

    const id = req.headers.get("x-owner-id");
    if (!id) throw new UnauthorizedError();

    tenantCreateSchema.parse({
      name: body.name,
      email: body.email,
      birthday: new Date(body.birthday),
      phoneNumber: body.phoneNumber,
    });

    await DB.transaction(async (session) => {
      const tenant = await Tenant.where("email", body.email).first();

      if (tenant) {
        throw new BadRequest("Tenant already exists");
      }

      const room = await Room.where("_id", body.roomId).first();

      if (!room) {
        throw new BadRequest("Room not found");
      }

      if (!room.isAvailable) {
        throw new BadRequest("Room is not available");
      }

      const roomId = new ObjectId(room._id);

      const newTenant = (await DB.collection("tenants").create(
        {
          name: body.name,
          email: body.email,
          birthday: new Date(body.birthday),
          phoneNumber: body.phoneNumber,
          isActive: body.isActive ?? true,
        },
        { session }
      )) as Tenant;

      const createdRent = (await DB.collection("rents").create(
        {
          roomId,
          tenantId: newTenant._id,
          price: room.fixedCost as number,
          joinAt: new Date(),
        },
        { session }
      )) as Rent;

      if (body.additionalIds && body.additionalIds.length > 0) {
        const additionalObjectIds = body.additionalIds.map(
          (id) => new ObjectId(id)
        );
        console.log(additionalObjectIds, "<<<<<<<<<<<<");

        // Insert into pivot table directly within the transaction
        const pivotDocuments = additionalObjectIds.map((additionalId) => ({
          rent_id: createdRent._id,
          additional_id: additionalId,
        }));

        await DB.collection("additional_rent").insertMany(pivotDocuments, {
          session,
        });
      }

      await Room.where("_id", body.roomId).update(
        {
          isAvailable: false,
        },
        { session }
      );
    });

    return NextResponse.json({ message: "Tenant created" }, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
