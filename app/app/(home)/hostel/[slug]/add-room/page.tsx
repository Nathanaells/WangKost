'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import url from '@/components/constant';
import Link from 'next/link';

interface RoomForm {
    id: number;
    roomName: string;
    fixedCost: number;
}

async function createRoom(slug: string, fixedCost: number) {
    try {
        const response = await fetch(`${url}/api/hostels/${slug}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fixedCost }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create room');
        }

        return { success: true, message: 'Room created successfully!' };
    } catch (error: unknown) {
        return {
            success: false,
            message: (error as Error).message || 'Failed to create room',
        };
    }
}

async function getExistingRoomsCount(slug: string): Promise<number> {
    try {
        const response = await fetch(`${url}/api/hostels/${slug}`);
        if (!response.ok) {
            return 0;
        }
        const data = await response.json();
        return data.rooms?.length || 0;
    } catch (error) {
        console.error('Error fetching existing rooms:', error);
        return 0;
    }
}

export default function AddRoomPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [rooms, setRooms] = useState<RoomForm[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [existingRoomCount, setExistingRoomCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        async function initializeRooms() {
            const count = await getExistingRoomsCount(slug);
            setExistingRoomCount(count);
            const startIndex = count + 1;
            setRooms([{ id: startIndex, roomName: `Room ${startIndex}`, fixedCost: 0 }]);
            setLoading(false);
        }
        initializeRooms();
    }, [slug]);

    const handleAddRoom = () => {
        const maxId = Math.max(...rooms.map((r) => r.id));
        const newId = maxId + 1;
        setRooms([...rooms, { id: newId, roomName: `Room ${newId}`, fixedCost: 0 }]);
    };

    const handleRemoveRoom = (id: number) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter((room) => room.id !== id));
        }
    };

    const handleFixedCostChange = (id: number, value: number) => {
        setRooms(rooms.map((room) => (room.id === id ? { ...room, fixedCost: value } : room)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Validate all rooms have fixedCost > 0
            const invalidRooms = rooms.filter((room) => room.fixedCost <= 0);
            if (invalidRooms.length > 0) {
                throw new Error('All rooms must have a fixed cost greater than 0');
            }

            // Create all rooms sequentially
            let successCount = 0;
            let failedCount = 0;

            for (const room of rooms) {
                const result = await createRoom(slug, room.fixedCost);
                if (result.success) {
                    successCount++;
                } else {
                    failedCount++;
                    toast.error(`Failed to create ${room.roomName}: ${result.message}`);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully created ${successCount} room(s)`);
            }

            if (failedCount === 0) {
                router.push(`/hostel/${slug}`);
            }
        } catch (error: unknown) {
            toast.error((error as Error).message || 'Failed to create rooms');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto pt-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto pt-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href={`/hostel/${slug}`} className="text-gray-500 hover:text-gray-700">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-800">Add Rooms</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {rooms.map((room, index) => (
                            <div key={room.id} className="border border-gray-200 rounded-lg p-4 relative">
                                {rooms.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRoom(room.id)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                    <input
                                        type="text"
                                        value={room.roomName}
                                        disabled
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Cost (per month) *</label>
                                    <input
                                        type="number"
                                        value={room.fixedCost || ''}
                                        onChange={(e) => handleFixedCostChange(room.id, parseInt(e.target.value) || 0)}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter fixed cost"
                                        min="0"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddRoom}
                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
                            + Add Another Room
                        </button>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href={`/hostel/${slug}`}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitting ? 'Creating...' : `Create ${rooms.length} Room(s)`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
