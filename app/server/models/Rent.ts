import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Room from "./Room";
import { ObjectId } from "mongodb";
import Tenant from "./Tenant";
import Additional from "./Additional";
import z from "zod";

export const rentCreateSchema = z.object({
  price: z.number().positive("Price must be positive"),
  roomId: z.string().min(1, "Room ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  joinAt: z.date().optional(),
});


interface IRent extends IMongoloquentSchema, IMongoloquentTimestamps {
  price: number;
  roomId: ObjectId;
  tenantId: ObjectId;
  additionals: Additional[]; // ?? Tidak perlu pakai key Additional
  leaveAt?: Date;
  joinAt: Date;
}

export default class Rent extends Model<IRent> {
  public static $schema: IRent;
  protected $collection: string = "rents";

  public room() {
    this.belongsTo(Room, "tenantId", "_id");
  }
  public tenant() {
    this.belongsTo(Tenant);
  }
  public additional() {
    this.hasMany(Additional);
  }
}
