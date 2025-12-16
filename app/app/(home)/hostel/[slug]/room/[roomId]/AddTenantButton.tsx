'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import url from '@/components/constant';
import { showError, showSuccess } from '@/components/toast';

interface IAdditional {
    _id: string;
    name: string;
    price: number;
}

interface AddTenantButtonProps {
    roomId: string;
    slug: string;
    fixedCost: number;
    allAdditionals: IAdditional[];
}

export default function AddTenantButton({ roomId, slug, fixedCost, allAdditionals }: AddTenantButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showCustomAdditional, setShowCustomAdditional] = useState(false);
    const [localAdditionals, setLocalAdditionals] = useState<IAdditional[]>([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        birthday: '',
        phoneNumber: '',
        isActive: true,
        additionalIds: [] as string[],
    });

    const allAvailableAdditionals = [...allAdditionals, ...localAdditionals];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`${url}/api/tenants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    roomId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.message || 'Failed to add tenant');
                return;
            }

            showSuccess('Tenant added successfully!');
            setShowModal(false);
            router.refresh();
        } catch (error: unknown) {
            showError((error as Error).message || 'Failed to add tenant');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdditionalToggle = (additionalId: string) => {
        setFormData((prev) => ({
            ...prev,
            additionalIds: prev.additionalIds.includes(additionalId)
                ? prev.additionalIds.filter((id) => id !== additionalId)
                : [...prev.additionalIds, additionalId],
        }));
    };

    const totalAdditionalCost = formData.additionalIds.reduce((sum, id) => {
        const additional = allAvailableAdditionals.find((a) => a._id === id);
        return sum + (additional?.price || 0);
    }, 0);

    const totalCost = fixedCost + totalAdditionalCost;

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                + Add Tenant
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Add New Tenant</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter tenant name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthday *</label>
                                    <input
                                        type="date"
                                        value={formData.birthday}
                                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                        Active Tenant
                                    </label>
                                </div>

                                {/* Additional Services */}
                                <div className="border-t pt-4">
                                    {showCustomAdditional && (
                                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                                            <input
                                                type="text"
                                                value={customAdditional.name}
                                                onChange={(e) => setCustomAdditional({ ...customAdditional, name: e.target.value })}
                                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Additional service name"
                                            />
                                            <input
                                                type="number"
                                                value={customAdditional.price || ''}
                                                onChange={(e) =>
                                                    setCustomAdditional({ ...customAdditional, price: parseInt(e.target.value) || 0 })
                                                }
                                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Price (Rp)"
                                                min="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomAdditional}
                                                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                Create & Add
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {allAvailableAdditionals.map((additional) => (
                                            <div
                                                key={additional._id}
                                                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center flex-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`additional-${additional._id}`}
                                                        checked={formData.additionalIds.includes(additional._id)}
                                                        onChange={() => handleAdditionalToggle(additional._id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label
                                                        htmlFor={`additional-${additional._id}`}
                                                        className="ml-2 text-sm text-gray-700 cursor-pointer flex-1">
                                                        {additional.name}
                                                    </label>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    Rp {additional.price.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cost Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Room Price:</span>
                                        <span className="font-semibold">Rp {fixedCost.toLocaleString('id-ID')}</span>
                                    </div>
                                    {totalAdditionalCost > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Additional Services:</span>
                                            <span className="font-semibold">Rp {totalAdditionalCost.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base border-t pt-2">
                                        <span className="font-semibold text-gray-900">Total Monthly Cost:</span>
                                        <span className="font-bold text-blue-600">Rp {totalCost.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {submitting ? 'Adding...' : 'Add Tenant'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
