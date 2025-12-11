import { Model, IMongoloquentSchema, IMongoloquentTimestamps } from "mongoloquent";
import Hostel from "./Hostel";
import { ObjectId } from "mongodb";
import { TransactionStatus } from "@/types/type";
import Tenant from "./tenant";
import Rent from "./rent";

interface ITransaction extends IMongoloquentSchema, IMongoloquentTimestamps {
    amount: number;
    status: TransactionStatus;
    dueDate: Date;
    paidAt: Date;
    midTransTransactionId: string;
    midTransOrderId: string;
    rentId: ObjectId
    tenantId: ObjectId;
    
}

export default class Transactions extends Model<ITransaction> {
    public static $schema: ITransaction
    protected $collection: string = "owners";

    public tenant() {
        this.belongsTo(Tenant)
    }
    public rent() {
        this.hasOne(Rent)
    }
}
