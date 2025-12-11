import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";

interface IAdmins extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export default class Admin extends Model<IAdmins> {
  public static $schema: IAdmins;
  protected $collection: string = "admins";
}
