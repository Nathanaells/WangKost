import customError from "@/server/errorHandler/customError";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest){
    try {
        return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
    } catch (error) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})  
    }
}