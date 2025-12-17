"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ITenant {
  _id: string;
  name: string;
  email: string;
  birthday: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<ITenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenants() {
      try {
        setLoading(true);
        const response = await fetch("/api/tenants", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tenants");
        }

        const data: ITenant[] = await response.json();
        setTenants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tenants");
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, []);

  const activeTenants = tenants.filter((t) => t.isActive);
  const inactiveTenants = tenants.filter((t) => !t.isActive);

  return (
    <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Tenants</h1>
            <p className="text-gray-500">Manage your tenants information</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Tenants</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {tenants.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-blue-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Tenants</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {activeTenants.length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Inactive Tenants
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {inactiveTenants.length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-red-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tenants Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Tenant List
              </h2>

              {tenants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">No tenants found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Phone Number
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Birthday
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Joined Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant, index) => (
                        <motion.tr
                          key={tenant._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {tenant.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {tenant.email}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {tenant.phoneNumber}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(tenant.birthday).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tenant.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tenant.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(tenant.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
