import { ZodError } from "zod";
import { CustomError, UnauthorizedError } from "./classError";

interface IErrorResponse {
  message: string[];
  status: number;
}

export default function customError(err: unknown): IErrorResponse {
  if (err instanceof ZodError) {
    const issues = err.issues;
    let message: string[] = [];

    issues.forEach((el) => {
      message.push(`${el.path} : ${el.message}`);
    });
    return { message, status: 400 };
  } else if (err instanceof UnauthorizedError) {
    let message: string[] = [];
    message.push(err.message);
    return { message, status: err.status };
  } else if (err instanceof CustomError) {
    let message: string[] = [];
    message.push(err.message);

    return { message, status: err.status };
  } else {
    let message: string[] = [];
    message.push("Internal server Error");
    return { message, status: 500 };
  }
}
