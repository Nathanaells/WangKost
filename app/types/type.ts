import { ObjectId } from "mongodb";

export enum TransactionStatus {
  paid = "PAID",
  unpaid = "UNPAID",
  pending = "PENDING",
}

export interface ITransaction {
  tenantId: ObjectId;
  amount: number;
  status: TransactionStatus;
  dueDate: Date;
  paidAt?: Date;
  midTransTransactionId: string;
  midtransOrderId: string;
  rentId: ObjectId;
}

export interface IJWTPayload {
  userId: ObjectId;
  phoneNumber: string;
  email: string;
}

export interface IHostel {
  name: string;
  slug: string;
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

export interface ICreateTenant {
  name: string;
  email: string;
  birthday: Date;
  phoneNumber: string;
  isActive: boolean;
  roomId: ObjectId;
  additionalIds?: string[]; // Array of additional IDs to attach to rent
}

export interface IRent {
  price: number;
  roomId: ObjectId;
  tenantId: ObjectId;
  leaveAt?: Date;
  joinAt: Date;
}

export interface IRentObject {
  _id: ObjectId;
  price: number;
  roomId: ObjectId;
  tenantId: ObjectId;
  leaveAt?: Date;
  joinAt: Date;
}

export interface ILogin {
  phoneNumber: string;
  password: string;
}

export interface IAdditional {
  name: string;
  price: number;
}
