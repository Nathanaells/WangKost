// import customError from "@/server/errorHandler/customError";
// import Additional from "@/server/models/Additional";
// import Rent from "@/server/models/Rent";
// import { ObjectId } from "mongodb";
// import { NextRequest, NextResponse } from "next/server";

// interface IRespon {
//   rentId: string;
// }
// export async function GET(req: NextRequest) {
//   try {

//     const data = await Rent.where("_id", rentId).addLookup(Additional).first();
//     console.log(data);
//     return NextResponse.json(data);
//   } catch (error) {
//     // console.log(error);
//     const { message, status } = customError(error);
//     return NextResponse.json({ message }, { status });
//   }
// }
