import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";

import Hostel from "./Hostel";
import { ObjectId } from "mongodb";
import Rent from "./Rent";
import Tenant from "./Tenant";

interface IRoom extends IMongoloquentSchema, IMongoloquentTimestamps {
  fixedCost: number;
  isAvailable: boolean;
  hostelId: ObjectId;
  tenants: Tenant[];
}

export default class Room extends Model<IRoom> {
  public static $schema: IRoom;
  protected $collection: string = "rooms";

  public hostel() {
    return this.belongsTo(Hostel);
  }
  public rent() {
    return this.hasMany(Rent);
  }
  public tenant() {
    return this.hasMany(Tenant);
  }
}
