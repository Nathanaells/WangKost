import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";

import { ObjectId } from "mongodb";
import { TransactionStatus } from "@/types/type";
import Tenant from "./Tenant";
import Rent from "./Rent";

interface ITransaction extends IMongoloquentSchema, IMongoloquentTimestamps {
  tenantId: ObjectId;
  amount: number;
  status: TransactionStatus;
  dueDate: Date;
  paidAt?: Date;
  midTransTransactionId?: string;
  midTransOrderId?: string;
  rentId: ObjectId;
}

export default class Transaction extends Model<ITransaction> {
  public static $schema: ITransaction;
  protected $collection: string = "transactions";

  public tenant() {
    return this.belongsTo(Tenant);
  }

  public rent() {
    return this.belongsTo(Rent);
  }
}
