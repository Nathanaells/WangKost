import url from "@/components/constant";
import { cookies } from "next/headers";
import Link from "next/link";

interface IRoom {
    _id: string;
    roomNumber?: string;
    fixedCost: number;
    isAvailable: boolean;
}

interface IHostel {
    _id: string;
    name: string;
    slug: string;
    address: string;
    description: string;
    maxRoom?: number;
    rooms: IRoom[];
}

interface IProps {
    params: Promise<{ slug: string }>;
}

async function getHostelDetail(slug: string): Promise<IHostel | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token");

        const response = await fetch(`${url}/api/hostels/${slug}`, {
            headers: {
                Cookie: `access_token=${token?.value}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Failed to fetch hostel:", response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching hostel:", error);
        return null;
    }
}

export default async function HostelDetailPage(props: IProps) {
    const { slug } = await props.params;
    console.log("Slug yang diakses:", slug);

    const hostel = await getHostelDetail(slug);

    if (!hostel) {
        return (
            <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto pt-6">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Hostel Not Found
                        </h1>
                        <Link href="/hostel" className="text-blue-600 hover:underline">
                            Back to Hostels
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const rooms = hostel.rooms || [];
    const occupiedRooms = rooms.filter((r) => !r.isAvailable).length;
    const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-6">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/hostel"
                        className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                        Back to Hostels
                    </Link>
                </div>

                {/* Hostel Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {hostel.name}
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                    />
                                </svg>
                                {hostel.address}
                            </p>
                        </div>
                        <Link
                            href={`/hostel/${slug}/add-room`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + Add Room
                        </Link>
                    </div>

                    {hostel.description && (
                        <p className="text-gray-600 mb-4">{hostel.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-blue-600 text-sm font-medium mb-1">
                                Total Rooms
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {rooms.length}
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-green-600 text-sm font-medium mb-1">
                                Occupied
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {occupiedRooms}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-purple-600 text-sm font-medium mb-1">
                                Occupancy Rate
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {occupancyRate}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rooms Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Rooms</h2>

                    {rooms.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">
                                No rooms found. Add your first room!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {rooms.map((room) => (
                                <div
                                    key={room._id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-900">
                                            Room {room.roomNumber || "N/A"}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                room.isAvailable
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {room.isAvailable ? "Available" : "Occupied"}
                                        </span>
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        <div className="flex justify-between">
                                            <span>Price:</span>
                                            <span className="font-semibold">
                                                Rp {room.fixedCost.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}