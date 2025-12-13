import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Room from "./Room";
import { ObjectId } from "mongodb";
import Tenant from "./Tenant";
import Additional from "./Additional";

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
