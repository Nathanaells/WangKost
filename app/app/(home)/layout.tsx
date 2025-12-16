import Sidebar from '@/components/Sidebar';
import { getCookie } from '@/app/(auth)/login/action';
import { redirect } from 'next/navigation';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
    const token = await getCookie('access_token');

    if (!token) {
        redirect('/login');
    }

    return (
        <>
            <Sidebar />
            {children}
        </>
    );
}
