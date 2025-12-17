'use server';

import url from '@/components/constant';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateHostelMaxRoom(slug: string, maxRoom: number) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token');

        const response = await fetch(`${url}/api/hostels/${slug}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `access_token=${token?.value}`,
            },
            body: JSON.stringify({ maxRoom }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update hostel');
        }

        revalidatePath(`/hostel/${slug}`);
        revalidatePath('/hostel');

        return { success: true, message: 'Max room updated successfully' };
    } catch (error) {
        console.error('Error updating hostel:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update max room',
        };
    }
}
