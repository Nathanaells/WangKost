import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError } from "./server/errorHandler/classError";
import { verifyToken } from "./server/helpers/jwt";
import Owner from "./server/models/Owner";
import { ObjectId } from "mongodb";
import customError from "./server/errorHandler/customError";

export async function proxy(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;

    const publicPaths = ["/api/rents", "/api/transaction"];

    // Check if path is public
    const isPublic = publicPaths.some((publicPath) =>
      path.startsWith(publicPath)
    );

    // If public path, skip authentication
    if (isPublic) {
      return NextResponse.next();
    }

    const protectedPaths = ["/api/hostels", "/api/tenants", "/api/additionals"];

    if (path.startsWith("/api")) {
      const isProtected = protectedPaths.some((protectedPath) =>
        path.startsWith(protectedPath)
      );

      if (isProtected) {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token");

        if (!token) throw new UnauthorizedError();

        const payload = verifyToken(token.value);
        const _id = new ObjectId(payload.userId);

        const owner = await Owner.where("_id", _id).first();

        if (!owner) throw new UnauthorizedError();

        const newHeaders = new Headers(req.headers);

        newHeaders.set("x-owner-id", owner._id.toString());
        newHeaders.set("x-owner-phoneNumber", owner.phoneNumber);

        const resposnse = NextResponse.next({
          headers: newHeaders,
        });

        return resposnse;
      }
    }
    return NextResponse.next();
  } catch (error: unknown) {
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
