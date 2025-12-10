import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IRent {
    _id?: ObjectId;
    RoomId: ObjectId;
    TenantId: ObjectId;
    price: number;
    joinedAt: Date;
    leaveAt: Date;
}

export default class Rent {
    static getCollection(): Collection<IRent> {
        const db = getDb();
        const collection = db.collection<IRent>("rents");
        return collection;
    }

    static async getRooms(): Promise<WithId<IRent>[]> {
        const collection = this.getCollection();
        const rooms = await collection.find().toArray();
        return rooms;
    }
}