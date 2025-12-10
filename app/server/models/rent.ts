import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IRent {
    _id?: ObjectId;
    roomId: ObjectId;
    tenantId: ObjectId;
    price: number;
    joinedAt: Date;
    leaveAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export default class Rent {
    static getCollection(): Collection<IRent> {
        const db = getDb();
        const collection = db.collection<IRent>("rents");
        return collection;
    }

    static async getRents(): Promise<WithId<IRent>[]> {
        const collection = this.getCollection();
        const rents = await collection.find().toArray();
        return rents;
    }
}