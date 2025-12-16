import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import Rent from "./Rent";
import { ObjectId } from "mongodb";
import Additional from "./Additional";

interface IAdditionalRent extends IMongoloquentSchema, IMongoloquentTimestamps {
  _id: ObjectId;
  rent_id: ObjectId;
  additional_id: ObjectId;
}

export default class AdditionalRent extends Model<IAdditionalRent> {
  public static $schema: IAdditionalRent;
  protected $collection: string = "additional_rent";

  public rent() {
    return this.belongsTo(Rent, "rent_id", "_id");
  }

  public additional() {
    return this.belongsTo(Additional, "additional_id", "_id");
  }
}
