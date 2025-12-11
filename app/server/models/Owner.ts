import { Model, IMongoloquentSchema, IMongoloquentTimestamps } from "mongoloquent";
import Hostel from "./Hostel";

interface IOwner extends IMongoloquentSchema, IMongoloquentTimestamps {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    hostels: Hostel[]
}

export default class Owner extends Model<IOwner> {
    public static $schema: IOwner
    protected $collection: string = "owners";

    public hostel() {
        this.hasMany(Hostel)
    }
}
