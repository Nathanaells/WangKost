import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface ITransaction {
    _id?: ObjectId;
    fixedCost: number;
    TenantId: ObjectId;
    amount: number;
    status: string;
    dueDate: Date;
    paidAt: Date;
    midTransTransactionId: string;
    midTransOrderId: string;
    RentId: ObjectId
}

export default class Transaction {
    static getCollection(): Collection<ITransaction> {
        const db = getDb();
        const collection = db.collection<ITransaction>("transactions");
        return collection;
    }

    static async getRooms(): Promise<WithId<ITransaction>[]> {
        const collection = this.getCollection();
        const rooms = await collection.find().toArray();
        return rooms;
    }
}