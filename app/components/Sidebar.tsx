'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { deleteCookie } from '@/app/(auth)/login/action';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await deleteCookie('access_token');
        router.push('/login');
    };

    const menu = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                    />
                </svg>
            ),
        },
        {
            name: 'Hostel Management',
            href: '/hostel',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                </svg>
            ),
        },
        {
            name: 'Fee and Dues',
            href: '/feendue',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                </svg>
            ),
        }
    ];

    const getPageTitle = () => {
        const current = menu.find((item) => item.href === pathname);
        return current ? current.name : 'Dashboard';
    };

    return (
        <>
            {/* Top Navbar */}
            <nav className="fixed top-0 right-0 left-0 sm:left-64 h-20 bg-white z-30 flex items-center justify-between px-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                id="logo-sidebar"
                className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-[#5353ec]"
                aria-label="Sidebar">
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-8">
                        <span className="self-center text-3xl font-bold text-white whitespace-nowrap">WANGKOST</span>
                    </div>

                    {/* Menu */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto">
                        <ul className="space-y-2 font-medium">
                            {menu.map((item) => {
                                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center p-3 rounded-xl group transition-colors
                                                ${isActive ? 'bg-white text-[#5353ec]' : 'text-white hover:bg-white/10'}
                                            `}>
                                            <div className={isActive ? 'text-[#5353ec]' : 'text-white'}>{item.icon}</div>
                                            <span className="ms-3">{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group hover:text-[#5353ec] w-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                                />
                            </svg>
                            <span className="ms-3">Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
