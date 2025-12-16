'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { showError, showSuccess } from '@/components/toast';
import { addAdditionalToRent, createCustomAdditional, fetchAdditionals } from './actions';

interface IAdditional {
    _id: string;
    name: string;
    price: number;
}

interface AddAdditionalButtonProps {
    rentId: string;
    allAdditionals: IAdditional[];
    currentAdditionals: IAdditional[];
    slug: string;
    roomId: string;
}

export default function AddAdditionalButton({ rentId, allAdditionals, currentAdditionals, slug, roomId }: AddAdditionalButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAdditionalIds, setSelectedAdditionalIds] = useState<string[]>([]);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customAdditional, setCustomAdditional] = useState({ name: '', price: 0 });
    const [localAdditionals, setLocalAdditionals] = useState<IAdditional[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    
    // Filter out additionals that are already added
    const currentAdditionalIds = currentAdditionals.map((a) => a._id);
    const allAvailableAdditionals = [...allAdditionals, ...localAdditionals];
    const availableAdditionals = allAvailableAdditionals.filter((a) => !currentAdditionalIds.includes(a._id));

    // Get selected additional objects
    const selectedAdditionals = selectedAdditionalIds
        .map((id) => availableAdditionals.find((a) => a._id === id))
        .filter(Boolean) as IAdditional[];

    const handleRemoveSelected = (additionalId: string) => {
        setSelectedAdditionalIds((prev) => prev.filter((id) => id !== additionalId));
    };

    const handleClearAll = () => {
        setSelectedAdditionalIds([]);
    };

    const handleCreateCustom = async () => {
        if (!customAdditional.name || customAdditional.price <= 0) {
            showError('Please enter valid name and price');
            return;
        }

        try {
            const result = await createCustomAdditional(customAdditional.name, customAdditional.price);

            if (!result.success) {
                showError(result.message || 'Failed to create additional');
                return;
            }

            // Fetch updated list
            const additionalsResult = await fetchAdditionals();
            if (additionalsResult.success && additionalsResult.data) {
                const newAdditional = additionalsResult.data.find(
                    (a: IAdditional) => a.name === customAdditional.name && a.price === customAdditional.price
                );

                if (newAdditional) {
                    setLocalAdditionals([...localAdditionals, newAdditional]);
                    setSelectedAdditionalIds([...selectedAdditionalIds, newAdditional._id]);
                }
            }

            showSuccess('Custom additional created!');
            setCustomAdditional({ name: '', price: 0 });
            setShowCustomForm(false);
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to create additional';
            showError(errorMsg);
            console.error('Error creating custom additional:', error);
        }
    };

    const handleToggleAdditional = (additionalId: string) => {
        setSelectedAdditionalIds((prev) =>
            prev.includes(additionalId) ? prev.filter((id) => id !== additionalId) : [...prev, additionalId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedAdditionalIds.length === 0) {
            showError('Please select at least one additional service');
            return;
        }

        setSubmitting(true);

        try {
            // Add all selected additionals one by one
            let successCount = 0;
            let failedCount = 0;
            const errors: string[] = [];

            for (const additionalId of selectedAdditionalIds) {
                try {
                    const result = await addAdditionalToRent(rentId, additionalId, slug, roomId);

                    if (!result.success) {
                        failedCount++;
                        const additional = allAvailableAdditionals.find((a) => a._id === additionalId);
                        errors.push(`${additional?.name || 'Service'}: ${result.message || 'Failed'}`);
                    } else {
                        successCount++;
                    }
                } catch (err) {
                    failedCount++;
                    const additional = allAvailableAdditionals.find((a) => a._id === additionalId);
                    const errorMsg = err instanceof Error ? err.message : 'Network error';
                    errors.push(`${additional?.name || 'Service'}: ${errorMsg}`);
                    console.error('Error adding additional:', err);
                }
            }

            // Show results
            if (successCount > 0) {
                showSuccess(`${successCount} additional service(s) added successfully!`);
            }

            if (failedCount > 0) {
                showError(`Failed to add ${failedCount} service(s): ${errors.join(', ')}`);
            }

            // Only close modal if all succeeded
            if (failedCount === 0) {
                setShowModal(false);
                setSelectedAdditionalIds([]);
                setShowDropdown(false);
            }

            router.refresh();
        } catch (error: unknown) {
            showError((error as Error).message || 'Failed to add additional services');
        } finally {
            setSubmitting(false);
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setSelectedAdditionalIds([]);
        setShowCustomForm(false);
        setShowDropdown(false);
        setCustomAdditional({ name: '', price: 0 });
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                + Add Additional
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Additional Services *
                                            </label>

                                            {/* Multi-select input with chips */}
                                            <div
                                                className="min-h-[48px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-pointer bg-white"
                                                onClick={() => setShowDropdown(!showDropdown)}>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {/* Selected chips */}
                                                    {selectedAdditionals.map((additional) => (
                                                        <span
                                                            key={additional._id}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                                            {additional.name}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveSelected(additional._id);
                                                                }}
                                                                className="hover:bg-blue-200 rounded-full p-0.5">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 16 16"
                                                                    fill="currentColor"
                                                                    className="w-3 h-3">
                                                                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    ))}

                                                    {selectedAdditionals.length === 0 && (
                                                        <span className="text-gray-400 text-sm">Choose services...</span>
                                                    )}

                                                    {/* Clear all and dropdown button */}
                                                    <div className="ml-auto flex items-center gap-1">
                                                        {selectedAdditionals.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClearAll();
                                                                }}
                                                                className="p-1 hover:bg-gray-100 rounded">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 16 16"
                                                                    fill="currentColor"
                                                                    className="w-4 h-4 text-gray-500">
                                                                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 16 16"
                                                            fill="currentColor"
                                                            className={`w-4 h-4 text-gray-500 transition-transform ${
                                                                showDropdown ? 'rotate-180' : ''
                                                            }`}>
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dropdown list */}
                                            {showDropdown && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {availableAdditionals.length === 0 ? (
                                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                            No additional services available
                                                        </div>
                                                    ) : (
                                                        availableAdditionals.map((additional) => {
                                                            const isSelected = selectedAdditionalIds.includes(additional._id);
                                                            const isDisabled = currentAdditionalIds.includes(additional._id);

                                                            return (
                                                                <div
                                                                    key={additional._id}
                                                                    onClick={() => {
                                                                        if (!isDisabled) {
                                                                            handleToggleAdditional(additional._id);
                                                                        }
                                                                    }}
                                                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                                                                        isDisabled
                                                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                            : isSelected
                                                                            ? 'bg-blue-50 text-blue-900'
                                                                            : 'hover:bg-gray-50 text-gray-900'
                                                                    }`}>
                                                                    <span className="text-sm font-medium">{additional.name}</span>
                                                                    <span className="text-sm">
                                                                        Rp {additional.price.toLocaleString('id-ID')}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
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

