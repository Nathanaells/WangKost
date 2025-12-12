import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Hostel from "./hostel";
import z from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

interface IOwner extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export const ownerRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().refine((value) => {
    const phone = parsePhoneNumberFromString(value, "ID");
    return phone?.isValid();
  }, "Invalid phone number"),
});

export const ownerLoginSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().refine((value) => {
    const phone = parsePhoneNumberFromString(value, "ID");
    return phone?.isValid();
  }, "Invalid phone number"),
});

export default class Owner extends Model<IOwner> {
  public static $schema: IOwner;
  protected $collection: string = "owners";

  public hostel() {
    this.hasMany(Hostel);
  }
}
