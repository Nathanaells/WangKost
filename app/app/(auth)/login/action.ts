'use server';

import { cookies } from 'next/headers';

export async function setCookie(key: string, value: string): Promise<string> {
    const cookieStore = await cookies();

    cookieStore.set({
        name: key,
        value: value,
    });

    return 'success';
}

export async function getCookie(key: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(key);
    return cookie?.value;
}

export async function deleteCookie(key: string): Promise<string> {
    const cookieStore = await cookies();
    cookieStore.delete(key);
    return 'success';
}
