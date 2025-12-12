import { ObjectId } from "mongodb";

export interface IProduct {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  excerpt: string;
  price: number;
  tags: string[];
  thumbnail: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: ObjectId | string;
  slug: string;
  name: string;
  price: number;
  thumbnail: string;
  excerpt: string;
  tags: string[];
}

export interface IProducts {
  products: IProduct[];
  total: number;
  
  totalPages: number;
}

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface IJWTPayload {
  userId: ObjectId;
  phoneNumber: string;
  email: string;
}

export interface IHostel extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  address: string;
  maxRoom?: number;
  description?: string;
  ownerId: ObjectId;
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
