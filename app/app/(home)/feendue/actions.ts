'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/server/helpers/jwt';
import Transaction from '@/server/models/Transaction';
import Rent from '@/server/models/Rent';
import Room from '@/server/models/Room';
import Hostel from '@/server/models/Hostel';
import Tenant from '@/server/models/Tenant';
import { ObjectId } from 'mongodb';

interface IPayment {
    _id: string;
    tenantName: string;
    hostelName: string;
    roomNumber: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'pending';
    dueDate: string;
    paidDate?: string;
    month: string;
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

        // Fetch hostels by owner (sesuai ERD: Admin → Hostel)
        const hostels = await Hostel.where('ownerId', ownerId).get();

        if (hostels.length === 0) {
            return { success: true, payments: [] };
        }

        const hostelIds = hostels.map((h: any) => new ObjectId(h._id));

        // Fetch rooms by hostel (sesuai ERD: Hostel → Room)
        const rooms = await Room.whereIn('hostelId', hostelIds).get();

        if (rooms.length === 0) {
            return { success: true, payments: [] };
        }

        const roomIds = rooms.map((r: any) => new ObjectId(r._id));

        // Fetch rents by room (sesuai ERD: Room → Rent)
        const rents = await Rent.whereIn('roomId', roomIds).get();

        if (rents.length === 0) {
            return { success: true, payments: [] };
        }

        const rentIds = rents.map((r: any) => new ObjectId(r._id));

        // Fetch transactions by rent (sesuai ERD: Rent → Transaction)
        const transactions = await Transaction.whereIn('rentId', rentIds).get();

        // Create maps for easy lookup
        const hostelMap = new Map(hostels.map((h: any) => [h._id.toString(), h]));
        const roomMap = new Map(rooms.map((r: any) => [r._id.toString(), r]));
        const rentMap = new Map(rents.map((r: any) => [r._id.toString(), r]));

        // Fetch all tenants referenced in rents
        const tenantIds = rents.map((r: any) => new ObjectId(r.tenantId));
        const tenants = await Tenant.whereIn('_id', tenantIds).get();
        const tenantMap = new Map(tenants.map((t: any) => [t._id.toString(), t]));

        // Map transactions to payment format (following ERD relations)
        const mappedPayments: IPayment[] = transactions.map((transaction: any) => {
            const rent = rentMap.get(transaction.rentId.toString());
            const room = rent ? roomMap.get(rent.roomId.toString()) : null;
            const hostel = room ? hostelMap.get(room.hostelId.toString()) : null;
            const tenant = rent ? tenantMap.get(rent.tenantId.toString()) : null;

            const dueDate = new Date(transaction.dueDate);
            const month = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            return {
                _id: transaction._id.toString(),
                tenantName: tenant?.name || 'Unknown Tenant',
                hostelName: hostel?.name || 'Unknown Hostel',
                roomNumber: room?.roomNumber || room?._id?.toString().slice(-3) || 'N/A',
                amount: transaction.amount,
                status: transaction.status.toLowerCase() as 'paid' | 'unpaid' | 'pending',
                dueDate: transaction.dueDate,
                paidDate: transaction.paidAt || undefined,
                month,
            };
        });

        return { success: true, payments: mappedPayments };
    } catch (error) {
        console.error('Error fetching transactions data:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}
