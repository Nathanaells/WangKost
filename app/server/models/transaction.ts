import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface ITransaction {
    _id?: ObjectId;
    fixedCost: number;
    tenantId: ObjectId;
    amount: number;
    status: "paid" | "unpaid" | "pending";
    dueDate: Date;
    paidAt?: Date;
    midTransTransactionId?: string;
    midTransOrderId?: string;
    rentId: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export default class Transaction {
    static getCollection(): Collection<ITransaction> {
        const db = getDb();
        const collection = db.collection<ITransaction>("transactions");
        return collection;
    }

    static async getTransactions(): Promise<WithId<ITransaction>[]> {
        const collection = this.getCollection();
        const transactions = await collection.find().toArray();
        return transactions;
    }
}