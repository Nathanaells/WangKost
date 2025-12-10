import { ObjectId, Collection, WithId, Document } from "mongodb";
import { getDb } from "../mongodb/config";

export interface IHostel {
    _id?: ObjectId;
    name: string;
    address: string;
    description: string;
    maxRooms: number;
    adminId: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export default class Hostel {
    static getCollection(): Collection<IHostel> {
        const db = getDb();
        const collection = db.collection<IHostel>("hostels");
        return collection;
    }

    static async getHostels(): Promise<WithId<IHostel>[]> {
        const collection = this.getCollection();
        const hostels = await collection.find().toArray();
        return hostels;
    }
}