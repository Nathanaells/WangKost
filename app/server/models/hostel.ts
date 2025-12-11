import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";

interface IHostel extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  address: string;
  maxRoom?: number;
  description?: string;
  adminId: string;
}

export class Hostel extends Model<IHostel> {
  /**
   * The attributes of the model.
   *
   * @var IHostel
   */
  public static $schema: IHostel;

  // ...
  protected $collection: string = "hostels";
}
