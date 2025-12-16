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

        // Verify token and get owner ID
        const payload = verifyToken(token.value);
        const ownerId = payload.userId;

        const response = await fetch(`${url}/api/rents/${rentId}/rentAdditionals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-owner-id': ownerId,
            },
            cache: 'no-store',
            body: JSON.stringify({
                additionalId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to add additional',
            };
        }

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

        // Verify token and get owner ID
        const payload = verifyToken(token.value);
        const ownerId = payload.userId;

        const response = await fetch(`${url}/api/additionals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-owner-id': ownerId,
            },
            cache: 'no-store',
            body: JSON.stringify({ name, price }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to create additional',
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error',
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
