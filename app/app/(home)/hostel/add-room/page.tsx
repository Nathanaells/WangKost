'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import url from '@/components/constant';
import Link from 'next/link';

async function createHostel(formData: { name: string; address: string; description: string; maxRoom: number; fixedCost: number }) {
    try {
        // Step 1: Create the hostel
        const response = await fetch(`${url}/api/hostels`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create hostel');
        }

        // Step 2: Create rooms if maxRoom > 0
        if (formData.maxRoom > 0) {
            const slug = formData.name.toLowerCase().split(" ").join("-");
            
            const roomPromises = [];
            for (let i = 1; i <= formData.maxRoom; i++) {
                roomPromises.push(
                    fetch(`${url}/api/hostels/${slug}/rooms`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            fixedCost: formData.fixedCost,
                        }),
                    })
                );
            }
            
            await Promise.all(roomPromises);
        }

        return { success: true, message: 'Hostel created successfully!' };
    } catch (error: unknown) {
        return {
            success: false,
            message: (error as Error).message || 'Failed to create hostel',
        };
    }
}

export default function AddHostelPage() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: '',
        maxRoom: 0,
        fixedCost: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await createHostel(formData);

            if (!result.success) {
                throw new Error(result.message);
            }

            toast.success(result.message);
            router.push('/hostel');
        } catch (error: unknown) {
            toast.error((error as Error).message || 'Failed to create hostel');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto pt-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/hostel" className="text-gray-500 hover:text-gray-700">
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
                        <h2 className="text-2xl font-bold text-gray-800">Add New Hostel</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter hostel name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Rooms</label>
                            <input
                                type="number"
                                value={formData.maxRoom}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxRoom: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter max rooms"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Price (per month)</label>
                            <input
                                type="number"
                                value={formData.fixedCost}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fixedCost: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter room price"
                                min="0"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href="/hostel"
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitting ? 'Creating...' : 'Create Hostel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
