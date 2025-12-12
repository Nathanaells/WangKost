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
  rents: Rent[];
}

export const tenantCreateSchema = z.object({
  name: z.string().min(3, "Tenant name is required"),
  email: z.email("Invalid email address"),
  birthay: z.date("Invalid birth date"),
  phoneNumber: z.string().refine((value) => {
    const phone = parsePhoneNumberFromString(value, "ID");
    return phone?.isValid();
  }, "Invalid phone number"),
})

export default class Tenant extends Model<ITenant> {
  public static $schema: ITenant;
  protected $collection: string = "tenants";

  public room() {
    return this.belongsTo(Room);
  }
  public rent() {
    return this.hasMany(Rent);
  }
}
