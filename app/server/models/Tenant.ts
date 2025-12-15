import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Room from "./Room";
import Rent from "./Rent";
import z from "zod";
import parsePhoneNumberFromString from "libphonenumber-js";

interface ITenant extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  email: string;
  birthday: Date;
  phoneNumber: string;
  isActive: boolean;
}

export const tenantCreateSchema = z.object({
  name: z.string().min(3, "Tenant name is required"),
  email: z.string().email("Invalid email address"),
  birthday: z.date("Invalid birth date"),
  phoneNumber: z.string().refine((value) => {
    const phone = parsePhoneNumberFromString(value, "ID");
    return phone?.isValid();
  }, "Invalid phone number"),
});

export default class Tenant extends Model<ITenant> {
  public static $schema: ITenant;
  protected $collection: string = "tenants";

  public rent() {
    return this.hasMany(Rent);
  }
}
