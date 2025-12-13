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
}

export interface ILogin {
  phoneNumber: string;
  password: string;
}

export interface IAdditional {
  name: string;
  price: number;
}
