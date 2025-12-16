'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/server/helpers/jwt';
import Rent from '@/server/models/Rent';
import Tenant from '@/server/models/Tenant';
import Hostel from '@/server/models/Hostel';
import Room from '@/server/models/Room';
import Additional from '@/server/models/Additional';
import { ObjectId } from 'mongodb';
import type { IHostel, IRoom, ITenant, IRent, IRespAdditional } from '@/types/type';

interface HostelWithId extends IHostel {
    _id: ObjectId;
}

interface RoomWithId extends IRoom {
    _id: ObjectId;
}

interface TenantWithId extends ITenant {
    _id: ObjectId;
}

interface RentWithId extends IRent {
    _id: ObjectId;
}

interface RoomWithHostelInfo extends RoomWithId {
    hostelName: string;
    hostelSlug: string;
}

export async function fetchTransactionsData() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token');

        if (!token) {
            return { success: false, message: 'Not authenticated' };
        }

        const decoded = verifyToken(token.value);
        const ownerId = new ObjectId(decoded.userId);

        // Fetch hostels owned by this owner
        const hostels = (await Hostel.where('ownerId', ownerId).get()) as HostelWithId[];

        if (hostels.length === 0) {
            return { success: true, payments: [] };
        }

        const hostelIds = hostels.map((h) => new ObjectId(h._id));

        // Fetch rooms for these hostels
        const rooms = (await Room.whereIn('hostelId', hostelIds).get()) as RoomWithId[];

        if (rooms.length === 0) {
            return { success: true, payments: [] };
        }

        const roomIds = rooms.map((r) => new ObjectId(r._id));

        // Create hostel map
        const hostelMap = new Map<string, HostelWithId>();
        hostels.forEach((hostel) => {
            hostelMap.set(hostel._id.toString(), hostel);
        });

        // Create room map with hostel info
        const roomMap = new Map<string, RoomWithHostelInfo>();
        rooms.forEach((room) => {
            const hostel = hostelMap.get(room.hostelId.toString());
            roomMap.set(room._id.toString(), {
                ...room,
                hostelName: hostel?.name || 'Unknown',
                hostelSlug: hostel?.slug || '',
            });
        });

        // Fetch rents for these rooms
        const rents = (await Rent.whereIn('roomId', roomIds).get()) as RentWithId[];

        if (rents.length === 0) {
            return { success: true, payments: [] };
        }

        // Fetch all tenants
        const tenantIds = rents.map((r) => new ObjectId(r.tenantId));
        const tenants = (await Tenant.whereIn('_id', tenantIds).get()) as TenantWithId[];

        // Create tenant map
        const tenantMap = new Map<string, TenantWithId>();
        tenants.forEach((tenant) => {
            tenantMap.set(tenant._id.toString(), tenant);
        });

        // Fetch additionals for each rent using direct database query
        const rentAdditionals = new Map<string, IRespAdditional[]>();
        for (const rent of rents) {
            try {
                const rentObjectId = new ObjectId(rent._id);

                // Query pivot table and join with additionals
                const DB = (await import('mongoloquent')).DB;

                const result = await DB.collection('rents')
                    .raw({
                        $match: {
                            _id: rentObjectId,
                        },
                    })
                    .lookup({
                        from: 'additional_rent',
                        localField: '_id',
                        foreignField: 'rent_id',
                        as: 'rentAdditional',
                    })
                    .lookup({
                        from: 'additionals',
                        localField: 'rentAdditional.additional_id',
                        foreignField: '_id',
                        as: 'additionals',
                    })
                    .first();

                rentAdditionals.set(rent._id.toString(), result?.additionals || []);
            } catch (error) {
                console.error('Error fetching additionals for rent:', error);
                rentAdditionals.set(rent._id.toString(), []);
            }
        }

        // Map rents to payment format
        const mappedPayments = rents.map((rent) => {
            const tenant = tenantMap.get(rent.tenantId.toString());
            const room = roomMap.get(rent.roomId.toString());
            const additionals = rentAdditionals.get(rent._id.toString()) || [];

            // Calculate total amount (fixed cost + additionals)
            const additionalTotal = additionals.reduce((sum: number, add) => sum + (add.price || 0), 0);
            const totalAmount = (rent.price || 0) + additionalTotal;

            // Get month from joinAt
            const joinDate = new Date(rent.joinAt);
            const month = joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            // For now, status is unpaid since no transaction exists yet
            const status: 'paid' | 'unpaid' | 'pending' = 'unpaid';

            return {
                _id: rent._id.toString(),
                tenantName: tenant?.name || 'Unknown Tenant',
                hostelName: room?.hostelName || 'Unknown Hostel',
                roomNumber: room?.roomNumber || room?._id?.toString().slice(-3) || 'N/A',
                amount: totalAmount,
                status,
                dueDate: rent.joinAt,
                paidDate: undefined,
                month,
            };
        });

        return { success: true, payments: mappedPayments };
    } catch (error) {
        console.error('Error fetching transactions data:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}
