import { ObjectId } from "mongodb";
import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";

export enum TransactionStatus {
  Unpaid = "UNPAID",
  Paid = "PAID",
  Pendng = "PENDING",
}

export interface IOwner {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  hostels: IHostel[];
}

export interface IJWTPayload {
  userId: ObjectId;
  username: string;
  email: string;
}

export interface IHostel extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  address: string;
  maxRoom?: number;
  description?: string;
  ownerId: ObjectId;
  rooms: IRoom[];
}

export interface IRoom {
  fixedCost: number;
  isAvailable: boolean;
  hostelId: ObjectId;
  tenants: ITenant[];
}

export interface ITenant {
  name: string;
  email: string;
  birthday: Date;
  phoneNumber: string;
  isActive: boolean;
  rents: IRent[];
}

export interface IRent {
  price: number;
  roomId: ObjectId;
  tenantId: ObjectId;
  additionals: IAdditional[];
}

export interface IAdditional {
  name: string;
  price: number;
}
