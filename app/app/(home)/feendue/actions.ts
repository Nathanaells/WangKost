'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/server/helpers/jwt';
import Rent from '@/server/models/Rent';
import Tenant from '@/server/models/Tenant';
import Hostel from '@/server/models/Hostel';
import Room from '@/server/models/Room';
import Additional from '@/server/models/Additional';
import { ObjectId } from 'mongodb';

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
        const hostels = await Hostel.where('ownerId', ownerId).get();

        if (hostels.length === 0) {
            return { success: true, payments: [] };
        }

        const hostelIds = hostels.map((h: any) => new ObjectId(h._id));

        // Fetch rooms for these hostels
        const rooms = await Room.whereIn('hostelId', hostelIds).get();

        if (rooms.length === 0) {
            return { success: true, payments: [] };
        }

        const roomIds = rooms.map((r: any) => new ObjectId(r._id));

        // Create hostel map
        const hostelMap = new Map();
        hostels.forEach((hostel: any) => {
            hostelMap.set(hostel._id.toString(), hostel);
        });

        // Create room map with hostel info
        const roomMap = new Map();
        rooms.forEach((room: any) => {
            const hostel = hostelMap.get(room.hostelId.toString());
            roomMap.set(room._id.toString(), {
                ...room,
                hostelName: hostel?.name || 'Unknown',
                hostelSlug: hostel?.slug || '',
            });
        });

        // Fetch rents for these rooms
        const rents = await Rent.whereIn('roomId', roomIds).get();

        if (rents.length === 0) {
            return { success: true, payments: [] };
        }

        // Fetch all tenants
        const tenantIds = rents.map((r: any) => new ObjectId(r.tenantId));
        const tenants = await Tenant.whereIn('_id', tenantIds).get();

        // Create tenant map
        const tenantMap = new Map();
        tenants.forEach((tenant: any) => {
            tenantMap.set(tenant._id.toString(), tenant);
        });

        // Fetch additionals for each rent
        const rentAdditionals = new Map();
        for (const rent of rents) {
            try {
                const additionals = await Additional.whereHas('rents', (query: any) => {
                    query.where('_id', new ObjectId(rent._id));
                }).get();

                rentAdditionals.set(rent._id.toString(), additionals);
            } catch (error) {
                rentAdditionals.set(rent._id.toString(), []);
            }
        }

        // Map rents to payment format
        const mappedPayments = rents.map((rent: any) => {
            const tenant = tenantMap.get(rent.tenantId.toString());
            const room = roomMap.get(rent.roomId.toString());
            const additionals = rentAdditionals.get(rent._id.toString()) || [];

            // Calculate total amount (fixed cost + additionals)
            const additionalTotal = additionals.reduce((sum: number, add: any) => sum + (add.price || 0), 0);
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
