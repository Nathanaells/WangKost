import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Room from "./Room";
import Owner from "./Owner";
import { ObjectId } from "mongodb";
import z from "zod";

interface IHostel extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  address: string;
  maxRoom?: number;
  description?: string;
  ownerId: ObjectId;
}

export const hostelCreateSchema = z.object({
  name: z.string().min(3, "Name is required"),
  address: z.string().min(6, "Address is required"),
})

export default class Hostel extends Model<IHostel> {
  public static $schema: IHostel;
  protected $collection: string = "hostels";

  public admin() {
    return this.belongsTo(Owner);
  }
  public room() {
    return this.hasMany(Room);
  }
}
