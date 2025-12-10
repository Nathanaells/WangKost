import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IRentAddition {
    _id?: ObjectId;
    RentId: ObjectId;
    AdditionalId: ObjectId;
}

export default class RentAddition {
    static getCollection(): Collection<IRentAddition> {
        const db = getDb();
        const collection = db.collection<IRentAddition>("rentAdditions");
        return collection;
    }

    static async getRooms(): Promise<WithId<IRentAddition>[]> {
        const collection = this.getCollection();
        const rooms = await collection.find().toArray();
        return rooms;
    }
}