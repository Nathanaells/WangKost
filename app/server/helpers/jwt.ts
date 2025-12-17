import jwt from "jsonwebtoken";
import { IJWTPayload } from "@/types/type";

const JWT_SECRET: string = process.env.JWT_SECRET as string;


const signToken = (payload: IJWTPayload) => {
  return jwt.sign(payload, JWT_SECRET);
};

const verifyToken = (token: string): IJWTPayload => {
  return jwt.verify(token, JWT_SECRET) as IJWTPayload;
};

export { signToken, verifyToken };
