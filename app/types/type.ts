import { ObjectId } from "mongodb";

export enum TransactionStatus {
  paid = "PAID",
  unpaid = "UNPAID",
  pending = "PENDING",
}

export interface IJWTPayload {
  userId: ObjectId;
  phoneNumber: string;
  email: string;
}

export interface IHostel {
  name: string;
  address: string;
  maxRoom?: number;
  description?: string;
  ownerId: ObjectId;
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
}

export interface ITenant {
  name: string;
  email: string;
  birthday: Date;
  phoneNumber: string;
  isActive: boolean;
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
