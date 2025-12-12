import { BadRequest } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Tenant, { tenantCreateSchema } from "@/server/models/Tenant";
import { ITenant } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const body: ITenant = await req.json();

        // Validation check
        tenantCreateSchema.parse({
            name: body.name,
            email: body.email,
            birthday: body.birthday,
            phoneNumber: body.phoneNumber
        });

        // Duplicate check
        const tenant = await Tenant.where("email", body.email)
        .where("phoneNumber", body.phoneNumber)
        .first();

        if (tenant) {
            throw new BadRequest("Tenant already exists")
        }

        // Create and send data
        await Tenant.create({
            name: body.name,
            email: body.email,
            birthday: body.birthday,
            phoneNumber: body.phoneNumber,
            isActive: false, //! Default to false, but should be patch later!
            rents: []
        })

        return NextResponse.json(
            {message: "Tenant added successfully"},
            {status: 201}
        )
    } catch (error: unknown) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})  
    }
}