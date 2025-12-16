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
  leaveAt?: Date;
  joinAt: Date;

  // ?? Tidak perlu pakai key Additional
}

export default class Rent extends Model<IRent> {
  public static $schema: IRent;
  protected $collection: string = "rents";

  public room() {
    return this.belongsTo(Room, "roomId", "_id");
  }

  public tenant() {
    return this.belongsTo(Tenant, "tenantId", "_id");
  }

  public additionals() {
    // Simple belongsToMany - Mongoloquent will auto-detect pivot table "additional_rent"
    return this.belongsToMany(Additional);
  }
}
