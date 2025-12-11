import { Model, IMongoloquentSchema, IMongoloquentTimestamps } from "mongoloquent";
import Rent from "./rent";


interface IAdditional extends IMongoloquentSchema, IMongoloquentTimestamps {
    name: string;
    price: number
}

export default class Additional extends Model<IAdditional> {
    public static $schema: IAdditional
    protected $collection: string = "additionals";

    public rent() {
        this.belongsToMany(Rent)
    }
 }
