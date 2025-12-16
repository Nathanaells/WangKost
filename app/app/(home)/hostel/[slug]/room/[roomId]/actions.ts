'use server';

import { cookies } from 'next/headers';
import url from '@/components/constant';
import { verifyToken } from '@/server/helpers/jwt';
import { revalidatePath } from 'next/cache';

export async function addAdditionalToRent(rentId: string, additionalId: string, slug?: string, roomIdParam?: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token');

        if (!token) {
            return {
                success: false,
                message: 'Not authenticated',
            };
        }

        // Verify token to ensure authentication
        verifyToken(token.value);

        // Import DB and perform direct database operation
        const { DB } = await import('mongoloquent');
        const { ObjectId } = await import('mongodb');
        const Rent = (await import('@/server/models/Rent')).default;
        const Additional = (await import('@/server/models/Additional')).default;

        // Check if rent exists
        const rent = await Rent.find(rentId);
        if (!rent) {
            return {
                success: false,
                message: 'Rent not found',
            };
        }

        // Check if additional exists
        const additional = await Additional.find(additionalId);
        if (!additional) {
            return {
                success: false,
                message: 'Additional not found',
            };
        }

        // Insert into pivot table directly
        await DB.collection('additional_rent').create({
            rent_id: new ObjectId(rentId),
            additional_id: new ObjectId(additionalId),
        });

        // Revalidate the entire hostel route to refresh all related pages
        if (slug && roomIdParam) {
            revalidatePath(`/hostel/${slug}/room/${roomIdParam}`, 'page');
            revalidatePath(`/hostel/${slug}`, 'page');
        }
        revalidatePath('/hostel', 'layout');

        return {
            success: true,
            message: 'Additional added successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error',
        };
    }
}

export async function createCustomAdditional(name: string, price: number) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token');

        if (!token) {
            return {
                success: false,
                message: 'Not authenticated',
            };
        }

        // Verify token to ensure authentication
        verifyToken(token.value);

        // Import Additional model and create directly
        const Additional = (await import('@/server/models/Additional')).default;

        const additional = await Additional.create({ name, price });

        return {
            success: true,
            additionalId: additional._id,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create additional',
        };
    }
}

export async function fetchAdditionals() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token');

        if (!token) {
            return { success: false, data: [] };
        }

        // Verify token and get owner ID
        const payload = verifyToken(token.value);
        const ownerId = payload.userId;

        const response = await fetch(`${url}/api/additionals`, {
            headers: {
                'x-owner-id': ownerId,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return { success: false, data: [] };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, data: [] };
    }
}
