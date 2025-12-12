import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Room from "./Room";
import Rent from "./Rent";

interface ITenant extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  email: string;
  birthday: Date;
  phoneNumber: string;
  isActive: boolean;
  rents: Rent[];
}

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
