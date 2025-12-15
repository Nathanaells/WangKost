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
}

//! Gak pake array of tenant karena nanti kita bisa dapetin tenant pake collection konjungsion rent
//! ada Room id dan tenant id disitu

export default class Room extends Model<IRoom> {
  public static $schema: IRoom;
  protected $collection: string = "rooms";

  public hostel() {
    return this.belongsTo(Hostel);
  }
  public rent() {
    return this.hasMany(Rent);
  }
  //!! Fixing relation Liat Diagaram, Room gaada tenant id
}
