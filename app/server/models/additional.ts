import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IAdditional {
    _id?: ObjectId;
    name: string;
    price: number;
}

export default class Additional {
    static getCollection(): Collection<IAdditional> {
        const db = getDb();
        const collection = db.collection<IAdditional>("additionals");
        return collection;
    }

    static async getRooms(): Promise<WithId<IAdditional>[]> {
        const collection = this.getCollection();
        const rooms = await collection.find().toArray();
        return rooms;
    }
}