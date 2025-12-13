import BuildingCard from '@/components/BuildingCard';
import React from 'react';

export default function Hostel() {
    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hostel Administration</h1>
                        <p className="text-gray-500 mt-1">Manage hostel buildings and room assignments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-medium">Add Building</span>
                        <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Total Buildings */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-600 font-medium">Total buildings</span>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6 text-blue-600">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">2</div>
                    </div>

                    {/* Overall Occupancy */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-600 font-medium">Overall Occupancy</span>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6 text-blue-600">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                                    />
                                </svg>
                            </div>
                        </div>
                        {/* Mock Chart */}
                        <div className="mt-4">
                            <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-100 mb-2">
                                <div className="w-[45%] bg-blue-600"></div>
                                <div className="w-[35%] bg-pink-500"></div>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    <span className="text-gray-600">Boys</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                    <span className="text-gray-600">Girls</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Buildings */}
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">All Buildings</h2>
                    <a href="#" className="text-gray-400 text-sm hover:text-gray-600">
                        view all
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* North Wing */}
                    <BuildingCard
                        name="North Wing"
                        type="Boys"
                        totalRooms={45}
                        occupancy={67}
                        facilities={['WiFi', 'Gym', 'Common Room', 'Security']}
                        color="blue"
                    />
                    {/* South Wing */}
                    <BuildingCard
                        name="South Wing"
                        type="Girls"
                        totalRooms={38}
                        occupancy={79}
                        facilities={['WiFi', 'Study Room', 'Laundry', 'Security']}
                        color="pink"
                    />
                </div>
            </div>
        </div>
    );
}
