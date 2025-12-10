import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface ITenant {
    _id?: ObjectId;
    name: string;
    email: string;
    birthday: Date;
    phoneNumber: string;
    status: string;
}

export default class Tenant {
    static getCollection(): Collection<ITenant> {
        const db = getDb();
        const collection = db.collection<ITenant>("tenants");
        return collection;
    }

    static async getRooms(): Promise<WithId<ITenant>[]> {
        const collection = this.getCollection();
        const tenants = await collection.find().toArray();
        return tenants;
    }
}