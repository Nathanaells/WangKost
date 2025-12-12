import customError from "@/server/errorHandler/customError";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest){
    try {
        
    } catch (error) {
        const { message, status} = customError(error);
        return NextResponse.json({message}, {status})  
    }
}