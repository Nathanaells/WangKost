"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import url from "@/components/constant";
import { showError, showSuccess } from "@/components/toast";
import { getCookies } from "@/app/(home)/feendue/actions";
import { motion, AnimatePresence } from "framer-motion";

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

export default function AddTenantButton({
  roomId,
  slug,
  fixedCost,
  allAdditionals,
}: AddTenantButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomAdditional, setShowCustomAdditional] = useState(false);
  const [localAdditionals, setLocalAdditionals] = useState<IAdditional[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthday: "",
    phoneNumber: "",
    isActive: true,
    additionalIds: [] as string[],
  });

  const allAvailableAdditionals = [...allAdditionals, ...localAdditionals];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format phone number with +62 prefix
      let formattedPhone = formData.phoneNumber.trim();

      // Remove leading 0 if exists
      if (formattedPhone.startsWith("0")) {
        formattedPhone = formattedPhone.substring(1);
      }

      // Remove +62 or 62 if already exists
      if (formattedPhone.startsWith("+62")) {
        formattedPhone = formattedPhone.substring(3);
      } else if (formattedPhone.startsWith("62")) {
        formattedPhone = formattedPhone.substring(2);
      }

      formattedPhone = "+62" + formattedPhone;

      const token = await getCookies();

      const response = await fetch(`${url}/api/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `access_token=${token}`,
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: formattedPhone,
          roomId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(response);
        showError(data.message || "Failed to add tenant");
        return;
      }

      showSuccess("Tenant added successfully!");
      setShowModal(false);
      router.refresh();
    } catch (error: unknown) {
      showError((error as Error).message || "Failed to add tenant");
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
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        + Add Tenant
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Add New Tenant
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tenant name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birthday *
                    </label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) =>
                        setFormData({ ...formData, birthday: e.target.value })
                      }
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">+62</span>
                      </div>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full text-black pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8123456789"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Active Tenant
                    </label>
                  </div>

                  {/* Additional Services */}
                  <div className="border-t pt-4">
                    {showCustomAdditional && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2"></div>
                    )}

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {allAvailableAdditionals.map((additional) => (
                        <div
                          key={additional._id}
                          className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              id={`additional-${additional._id}`}
                              checked={formData.additionalIds.includes(
                                additional._id
                              )}
                              onChange={() =>
                                handleAdditionalToggle(additional._id)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`additional-${additional._id}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {additional.name}
                            </label>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            Rp {additional.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Room Price:</span>
                      <span className="font-semibold text-gray-600">
                        Rp {fixedCost.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {totalAdditionalCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Additional Services:
                        </span>
                        <span className="font-semibold">
                          Rp {totalAdditionalCost.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base border-t pt-2">
                      <span className="font-semibold text-gray-900">
                        Total Monthly Cost:
                      </span>
                      <span className="font-bold text-blue-600">
                        Rp {totalCost.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Adding..." : "Add Tenant"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
