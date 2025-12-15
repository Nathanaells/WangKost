'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import url from '@/components/constant';

interface IAdditional {
    _id: string;
    name: string;
    price: number;
}

interface ITenant {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    joinDate: string;
    status: 'active' | 'inactive';
    additionals: IAdditional[];
}

interface IRoom {
    _id: string;
    roomNumber?: string;
    fixedCost: number;
    isAvailable: boolean;
    tenant: ITenant | null;
}

interface IHostel {
    _id: string;
    name: string;
    address: string;
    description: string;
    maxRoom?: number;
    rooms: IRoom[];
}

export default function HostelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const hostelId = params.id as string;

    const [hostel, setHostel] = useState<IHostel | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddTenantModal, setShowAddTenantModal] = useState(false);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [showRoomDetailModal, setShowRoomDetailModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        joinDate: new Date().toISOString().split('T')[0],
    });
    const [roomFormData, setRoomFormData] = useState({
        roomNumber: '',
        price: '',
    });
    const [additionalFormData, setAdditionalFormData] = useState({
        name: '',
        price: '',
    });

    useEffect(() => {
        const fetchHostel = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${url}/api/hostels/${hostelId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch hostel');
                }

                const data = await response.json();
                setHostel(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load hostel details');
            } finally {
                setLoading(false);
            }
        };

        if (hostelId) {
            fetchHostel();
        }
    }, [hostelId]);

    if (loading) {
        return (
            <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto pt-6 flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!hostel) {
        return (
            <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto pt-6">
                    <p>Hostel not found</p>
                </div>
            </div>
        );
    }

    const rooms = hostel.rooms || [];
    const occupiedRooms = rooms.filter((r) => !r.isAvailable).length;
    const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

    const handleAddTenant = (room: IRoom) => {
        setSelectedRoom(room);
        setShowAddTenantModal(true);
    };

    const handleSubmitTenant = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoom) return;

        try {
            // Step 1: Create tenant
            const tenantResponse = await fetch(`${url}/api/tenants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    birthday: formData.joinDate,
                    isActive: true,
                }),
            });

            const tenantData = await tenantResponse.json();

            if (!tenantResponse.ok) {
                throw new Error(tenantData.message || 'Failed to create tenant');
            }

            // Step 2: Get the created tenant to get their ID
            const tenantsListResponse = await fetch(`${url}/api/tenants`);
            const tenantsList = await tenantsListResponse.json();
            const createdTenant = tenantsList.find((t: string) => t.email === formData.email);

            if (!createdTenant) {
                throw new Error('Failed to retrieve created tenant');
            }

            // Step 3: Create rent relationship
            const rentResponse = await fetch(`${url}/api/rents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price: selectedRoom.fixedCost,
                    roomId: selectedRoom._id,
                    tenantId: createdTenant._id,
                    joinAt: formData.joinDate,
                }),
            });

            const rentData = await rentResponse.json();

            if (!rentResponse.ok) {
                throw new Error(rentData.message || 'Failed to create rent');
            }

            // Step 4: Update room availability to false
            const roomUpdateResponse = await fetch(`${url}/api/hostels/${hostelId}/rooms/${selectedRoom._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isAvailable: false,
                }),
            });

            if (!roomUpdateResponse.ok) {
                console.error('Failed to update room availability');
            }

            toast.success('Tenant added successfully!');
            setShowAddTenantModal(false);
            setFormData({ name: '', email: '', phoneNumber: '', joinDate: new Date().toISOString().split('T')[0] });

            // Refresh hostel data
            const hostelResponse = await fetch(`${url}/api/hostels/${hostelId}`);
            if (hostelResponse.ok) {
                const updatedHostel = await hostelResponse.json();
                setHostel(updatedHostel);
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error(error.message || 'Failed to add tenant');
        }
    };

    const handleAddRoom = () => {
        setShowAddRoomModal(true);
    };

    const handleSubmitRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${url}/api/hostels/${hostelId}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomNumber: roomFormData.roomNumber,
                    fixedCost: parseInt(roomFormData.price) || 0,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add room');
            }

            toast.success('Room added successfully!');
            setShowAddRoomModal(false);
            setRoomFormData({ roomNumber: '', price: '' });

            // Refresh hostel data
            const hostelResponse = await fetch(`${url}/api/hostels/${hostelId}`);
            if (hostelResponse.ok) {
                const updatedHostel = await hostelResponse.json();
                setHostel(updatedHostel);
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error(error.message || 'Failed to add room');
        }
    };

    const handleRoomClick = (room: IRoom) => {
        if (!room.isAvailable && room.tenant) {
            setSelectedRoom(room);
            setShowRoomDetailModal(true);
        }
    };

    const handleAddAdditional = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Adding additional:', additionalFormData, 'to tenant:', selectedRoom?.tenant?.name);
        setAdditionalFormData({ name: '', price: '' });
        alert(`Additional ${additionalFormData.name} berhasil ditambahkan`);
    };

    const handleDeleteAdditional = (additionalId: string) => {
        if (confirm('Are you sure you want to delete this additional?')) {
            console.log('Deleting additional:', additionalId);
            alert('Additional berhasil dihapus');
        }
    };

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-6">
                {/* Back Button */}
                <button onClick={() => router.back()} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hostel.name}</h1>
                            <p className="text-gray-500 mb-1">{hostel.address}</p>
                            <p className="text-gray-600">{hostel.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Occupancy Rate</div>
                            <div className="text-3xl font-bold text-blue-600">{occupancyRate}%</div>
                            <div className="text-sm text-gray-500">
                                {occupiedRooms}/{rooms.length} rooms
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rooms List */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Rooms</h2>
                        <button
                            onClick={handleAddRoom}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Room
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map((room) => (
                            <div
                                key={room._id}
                                onClick={() => handleRoomClick(room)}
                                className={`border-2 rounded-lg p-4 ${
                                    room.isAvailable
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow'
                                }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber || 'N/A'}</h3>
                                        <p className="text-sm text-gray-600">Rp {room.fixedCost?.toLocaleString('id-ID') || 0}/month</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {room.isAvailable ? 'Available' : 'Occupied'}
                                    </span>
                                </div>

                                {!room.isAvailable && room.tenant ? (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-900">{room.tenant.name}</p>
                                        <p className="text-xs text-gray-600">{room.tenant.email}</p>
                                        <p className="text-xs text-gray-600">{room.tenant.phoneNumber}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Since: {new Date(room.tenant.joinDate).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                ) : room.isAvailable ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddTenant(room);
                                        }}
                                        className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                        + Add Tenant
                                    </button>
                                ) : (
                                    <div className="mt-3 pt-3 border-t border-gray-200 text-center text-sm text-gray-500">
                                        No tenant data available
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Tenant Modal */}
            {showAddTenantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Tenant to Room {selectedRoom?.roomNumber}</h3>
                        <form onSubmit={handleSubmitTenant}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddTenantModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Add Tenant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddRoomModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Room</h3>
                        <form onSubmit={handleSubmitRoom}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={roomFormData.roomNumber}
                                        onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 101, A1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price (Rp)</label>
                                    <input
                                        type="number"
                                        required
                                        value={roomFormData.price}
                                        onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 1500000"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddRoomModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Add Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Room Detail Modal */}
            {showRoomDetailModal && selectedRoom && selectedRoom.tenant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Room {selectedRoom.roomNumber}</h3>
                                <p className="text-gray-600">Rp {selectedRoom.price.toLocaleString('id-ID')}/month</p>
                            </div>
                            <button onClick={() => setShowRoomDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tenant Information */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Tenant Information</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{selectedRoom.tenant.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{selectedRoom.tenant.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{selectedRoom.tenant.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Join Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(selectedRoom.tenant.joinDate).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additionals */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Additional Charges</h4>

                            {/* List of Additionals */}
                            <div className="space-y-2 mb-4">
                                {selectedRoom.tenant.additionals.length > 0 ? (
                                    selectedRoom.tenant.additionals.map((additional) => (
                                        <div key={additional._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{additional.name}</p>
                                                <p className="text-sm text-gray-600">Rp {additional.price.toLocaleString('id-ID')}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAdditional(additional._id)}
                                                className="text-red-500 hover:text-red-700">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No additional charges yet</p>
                                )}
                            </div>

                            {/* Add Additional Form */}
                            <form onSubmit={handleAddAdditional} className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium text-gray-900 mb-3">Add New Additional</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={additionalFormData.name}
                                            onChange={(e) => setAdditionalFormData({ ...additionalFormData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., Electricity"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
                                        <input
                                            type="number"
                                            required
                                            value={additionalFormData.price}
                                            onChange={(e) => setAdditionalFormData({ ...additionalFormData, price: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 150000"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium">
                                    + Add Additional
                                </button>
                            </form>

                            {/* Total Calculation */}
                            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">Room Price</span>
                                    <span className="font-medium text-gray-900">Rp {selectedRoom.price.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">Additional Charges</span>
                                    <span className="font-medium text-gray-900">
                                        Rp{' '}
                                        {selectedRoom.tenant.additionals.reduce((sum, add) => sum + add.price, 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="border-t border-blue-200 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Total Monthly</span>
                                        <span className="font-bold text-blue-600 text-lg">
                                            Rp{' '}
                                            {(
                                                selectedRoom.price +
                                                selectedRoom.tenant.additionals.reduce((sum, add) => sum + add.price, 0)
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
