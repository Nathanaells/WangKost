import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IAdmin {
    _id?: ObjectId;
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    
}

export default class Admin {
    static getCollection(): Collection<IAdmin> {
        const db = getDb();
        const collection = db.collection<IAdmin>("admins");
        return collection;
    }

    static async getRooms(): Promise<WithId<IAdmin>[]> {
        const collection = this.getCollection();
        const admins = await collection.find().toArray();
        return admins;
    }
}