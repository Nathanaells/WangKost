import customError from '@/server/errorHandler/customError';
import Room from '@/server/models/Room';
import { IRoom } from '@/types/type';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface IProps {
    params: Promise<{ hostelId: string }>;
}

// GET all rooms for a hostel
export async function GET(req: NextRequest, props: IProps) {
    try {
        const { hostelId } = await props.params;
        const hostelObjectId = new ObjectId(hostelId);

        const rooms = await Room.where('hostelId', hostelObjectId).get();

        return NextResponse.json(rooms);
    } catch (error: unknown) {
        const { message, status } = customError(error);
        return NextResponse.json({ message }, { status });
    }
}

// POST create a new room for a hostel
export async function POST(req: NextRequest, props: IProps) {
    try {
        const body: IRoom = await req.json();
        const { hostelId } = await props.params;
        const hostelObjectId = new ObjectId(hostelId);

        await Room.create({
            roomNumber: body.roomNumber,
            fixedCost: body.fixedCost,
            isAvailable: true,
            hostelId: hostelObjectId,
        });

        return NextResponse.json({ message: 'Room added successfully' }, { status: 201 });
    } catch (error: unknown) {
        const { message, status } = customError(error);
        return NextResponse.json({ message }, { status });
    }
}
