import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import z from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Hostel from "./Hostel";
import Room from "./Room";
import { IRoom } from "@/types/type";

interface IOwner extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  rooms?: IRoom[]
}

export const ownerRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .refine((value) => value.trim().length > 0, "Password cannot be only whitespace"),
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

  public hostels() {
    return this.hasMany(Hostel);
  }
  public rooms() {
    return this.hasManyThrough(Room, Hostel, 'ownerId', 'hostelId','_id','_id')
  }
}
