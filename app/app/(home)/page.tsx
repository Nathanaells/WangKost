import url from '@/components/constant';
import { cookies } from 'next/headers';

interface IRoom {
    _id: string;
    fixedCost: number;
    isAvailable: boolean;
    hostelId: string;
}

interface IHostel {
    _id: string;
    name: string;
    slug: string;
    rooms?: IRoom[];
}

interface ITenant {
    _id: string;
    name: string;
    isActive: boolean;
}

interface IRent {
    _id: string;
    price: number;
}

async function getDashboardData() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token');

        // Fetch hostels
        const hostelsResponse = await fetch(`${url}/api/hostels`, {
            headers: {
                Cookie: `access_token=${token?.value}`,
            },
            cache: 'no-store',
        });

        // Fetch tenants
        const tenantsResponse = await fetch(`${url}/api/tenants`, {
            headers: {
                Cookie: `access_token=${token?.value}`,
            },
            cache: 'no-store',
        });

        // Fetch rents
        const rentsResponse = await fetch(`${url}/api/rents`, {
            headers: {
                Cookie: `access_token=${token?.value}`,
            },
            cache: 'no-store',
        });

        const hostels: IHostel[] = hostelsResponse.ok ? await hostelsResponse.json() : [];
        const tenants: ITenant[] = tenantsResponse.ok ? await tenantsResponse.json() : [];
        const rents: IRent[] = rentsResponse.ok ? await rentsResponse.json() : [];

        // Calculate statistics
        const totalHostels = hostels.length;
        
        // Fetch rooms for each hostel
        let allRooms: IRoom[] = [];
        for (const hostel of hostels) {
            const roomsResponse = await fetch(`${url}/api/hostels/${hostel.slug}/rooms`, {
                headers: {
                    Cookie: `access_token=${token?.value}`,
                },
                cache: 'no-store',
            });
            if (roomsResponse.ok) {
                const rooms: IRoom[] = await roomsResponse.json();
                allRooms = [...allRooms, ...rooms];
            }
        }

        const totalRooms = allRooms.length;
        const occupiedRooms = allRooms.filter(room => !room.isAvailable).length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        const totalTenants = tenants.filter(tenant => tenant.isActive).length;
        
        // Calculate monthly revenue from rents
        const monthlyRevenue = rents.reduce((sum, rent) => sum + rent.price, 0);

        return {
            totalHostels,
            totalRooms,
            occupiedRooms,
            occupancyRate,
            totalTenants,
            monthlyRevenue,
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            totalHostels: 0,
            totalRooms: 0,
            occupiedRooms: 0,
            occupancyRate: 0,
            totalTenants: 0,
            monthlyRevenue: 0,
        };
    }
}

export default async function Dashboard() {
    const data = await getDashboardData();

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Overview of your hostel management</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Hostels */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Hostels</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalHostels}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-blue-600">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Room Occupancy */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Room Occupancy</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{data.occupancyRate}%</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {data.occupiedRooms}/{data.totalRooms} rooms
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-green-600">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                                    />
                                </svg>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-4 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${data.occupancyRate}%` }}></div>
                        </div>
                    </div>

                    {/* Total Tenants */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalTenants}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-purple-600">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Revenue */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    Rp {data.monthlyRevenue.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-yellow-600">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Occupancy Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h3>
                        <div className="flex items-center justify-center h-64">
                            {/* Simple Pie Chart Representation */}
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {/* Background circle */}
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                                    {/* Occupied circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="20"
                                        strokeDasharray={`${data.occupancyRate * 2.51} 251`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-gray-900">{data.occupancyRate}%</p>
                                        <p className="text-sm text-gray-600">Occupied</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                <span className="text-sm text-gray-600">Occupied ({data.occupiedRooms})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <span className="text-sm text-gray-600">Available ({data.totalRooms - data.occupiedRooms})</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Total Properties</p>
                                    <p className="text-2xl font-bold text-blue-600">{data.totalHostels}</p>
                                </div>
                                <div className="text-blue-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-8 h-8">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Total Rooms</p>
                                    <p className="text-2xl font-bold text-green-600">{data.totalRooms}</p>
                                </div>
                                <div className="text-green-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-8 h-8">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Active Tenants</p>
                                    <p className="text-2xl font-bold text-purple-600">{data.totalTenants}</p>
                                </div>
                                <div className="text-purple-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-8 h-8">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Monthly Income</p>
                                    <p className="text-xl font-bold text-yellow-600">
                                        Rp {(data.monthlyRevenue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="text-yellow-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-8 h-8">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}