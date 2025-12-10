import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IRoom {
    _id?: ObjectId;
    fixedCost: number;
    hostelId: ObjectId;
    isAvailable: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export default class Room {
    static getCollection(): Collection<IRoom> {
        const db = getDb();
        const collection = db.collection<IRoom>("rooms");
        return collection;
    }

    static async getRooms(): Promise<WithId<IRoom>[]> {
        const collection = this.getCollection();
        const rooms = await collection.find().toArray();
        return rooms;
    }
}