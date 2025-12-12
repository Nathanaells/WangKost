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
}

export interface IWishlist {
  userId: ObjectId;
  productId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  wishlist: {
    _id: string;
    slug: string;
    name: string;
    price: number;
    thumbnail: string;
    excerpt: string;
    description: string;
    tags: string[];
    images: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface IloginPayload {
  username: string;
  password: string;
}

export interface IJWTPayload {
  userId: ObjectId;
  username: string;
  email: string;
}

export interface IOptions {
  params: Promise<{ slug: string }>;
}
