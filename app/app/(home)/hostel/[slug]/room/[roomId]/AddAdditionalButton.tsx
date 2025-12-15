'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import url from '@/components/constant';

interface IAdditional {
    _id: string;
    name: string;
    price: number;
}

interface AddAdditionalButtonProps {
    rentId: string;
    allAdditionals: IAdditional[];
    currentAdditionals: IAdditional[];
}

export default function AddAdditionalButton({ rentId, allAdditionals, currentAdditionals }: AddAdditionalButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAdditionalId, setSelectedAdditionalId] = useState('');
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customAdditional, setCustomAdditional] = useState({ name: '', price: 0 });
    const [localAdditionals, setLocalAdditionals] = useState<IAdditional[]>([]);
    const router = useRouter();

    // Filter out additionals that are already added
    const currentAdditionalIds = currentAdditionals.map((a) => a._id);
    const allAvailableAdditionals = [...allAdditionals, ...localAdditionals];
    const availableAdditionals = allAvailableAdditionals.filter((a) => !currentAdditionalIds.includes(a._id));

    const handleCreateCustom = async () => {
        if (!customAdditional.name || customAdditional.price <= 0) {
            toast.error('Please enter valid name and price');
            return;
        }

        try {
            const response = await fetch(`${url}/api/additionals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customAdditional),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create additional');
            }

            // Fetch updated list
            const additionalsResponse = await fetch(`${url}/api/additionals`);
            if (additionalsResponse.ok) {
                const updatedAdditionals = await additionalsResponse.json();
                const newAdditional = updatedAdditionals.find(
                    (a: IAdditional) => a.name === customAdditional.name && a.price === customAdditional.price
                );

                if (newAdditional) {
                    setLocalAdditionals([...localAdditionals, newAdditional]);
                    setSelectedAdditionalId(newAdditional._id);
                }
            }

            toast.success('Custom additional created!');
            setCustomAdditional({ name: '', price: 0 });
            setShowCustomForm(false);
        } catch (error: unknown) {
            toast.error((error as Error).message || 'Failed to create additional');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAdditionalId) {
            toast.error('Please select an additional service');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${url}/api/rents/${rentId}/rentAdditionals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    additionalId: selectedAdditionalId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add additional service');
            }

            toast.success('Additional service added successfully!');
            setShowModal(false);
            setSelectedAdditionalId('');
            router.refresh();
        } catch (error: unknown) {
            toast.error((error as Error).message || 'Failed to add additional service');
        } finally {
            setSubmitting(false);
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setSelectedAdditionalId('');
        setShowCustomForm(false);
        setCustomAdditional({ name: '', price: 0 });
    };

    if (availableAdditionals.length === 0) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                + Add Additional
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Add Additional Service</h2>
                                <button onClick={resetModal} className="text-gray-500 hover:text-gray-700">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!showCustomForm ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Additional Service *
                                            </label>
                                            <select
                                                value={selectedAdditionalId}
                                                onChange={(e) => setSelectedAdditionalId(e.target.value)}
                                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required>
                                                <option value="">Choose a service...</option>
                                                {availableAdditionals.map((additional) => (
                                                    <option key={additional._id} value={additional._id}>
                                                        {additional.name} - Rp {additional.price.toLocaleString('id-ID')}/month
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowCustomForm(true)}
                                            className="w-full px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm">
                                            + Create Custom Additional
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                                            <input
                                                type="text"
                                                value={customAdditional.name}
                                                onChange={(e) => setCustomAdditional({ ...customAdditional, name: e.target.value })}
                                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Electricity, Water, WiFi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (per month) *</label>
                                            <input
                                                type="number"
                                                value={customAdditional.price || ''}
                                                onChange={(e) =>
                                                    setCustomAdditional({ ...customAdditional, price: parseInt(e.target.value) || 0 })
                                                }
                                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter price"
                                                min="0"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomForm(false)}
                                                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreateCustom}
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                Create
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!showCustomForm && (
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetModal}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            {submitting ? 'Adding...' : 'Add Service'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
