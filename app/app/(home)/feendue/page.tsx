'use client';

import { useState, useEffect } from 'react';
import { fetchTransactionsData } from './actions';
import { showError } from '@/components/toast';
import { motion } from 'framer-motion';

interface IPayment {
    _id: string;
    tenantName: string;
    hostelName: string;
    amount: number;
    status: 'PAID' | 'UNPAID' | 'PENDING';
    dueDate: string;
    paidDate?: string;
    month: string;
}

export default function FeenDues() {
    const [filterStatus, setFilterStatus] = useState<'all' | 'PAID' | 'UNPAID' | 'PENDING'>('all');
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const result = await fetchTransactionsData(currentPage, itemsPerPage, filterStatus === 'all' ? undefined : filterStatus);

                if (!result.success) {
                    showError(result.message || 'Failed to fetch transactions');
                    setPayments([]);
                    return;
                }

                setPayments(result.payments || []);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotalRecords(result.pagination?.total || 0);
            } catch (error) {
                showError('Failed to load payment data');
                setPayments([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [currentPage, filterStatus]);

    // Filtering is now done on the server side
    const filteredPayments = payments;

    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const totalUnpaid = payments.filter((p) => p.status === 'UNPAID').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'UNPAID':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-6">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <p className="text-gray-600">Loading payment data...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0 }}
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                                        <p className="text-2xl font-bold text-gray-900">Rp {totalPaid.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Total Unpaid</p>
                                        <p className="text-2xl font-bold text-gray-900">Rp {totalUnpaid.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Total Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">Rp {totalPending.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Filter Tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    All
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterStatus('PAID');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filterStatus === 'PAID' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    Paid
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterStatus('UNPAID');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filterStatus === 'UNPAID' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    Unpaid
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterStatus('PENDING');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filterStatus === 'PENDING'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    Pending
                                </button>
                            </div>

                            {/* Payment History Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenant</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Hostel</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Paid Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment) => (
                                            <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-900">{payment.tenantName}</td>
                                                <td className="py-3 px-4 text-gray-600">{payment.hostelName}</td>
                                                <td className="py-3 px-4 text-gray-600">{payment.month}</td>
                                                <td className="py-3 px-4 font-semibold text-gray-900">
                                                    Rp {payment.amount.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                            payment.status
                                                        )}`}>
                                                        {payment.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredPayments.length === 0 && !loading && (
                                <div className="text-center py-8 text-gray-500">No payments found for this filter.</div>
                            )}

                            {/* Pagination */}
                            {totalRecords > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-200 gap-4">
                                    <div className="text-sm text-gray-600">
                                        Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga{' '}
                                        {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} transaksi
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                                            title="Halaman Pertama">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>

                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                // Show first page, last page, current page, and pages around current
                                                const showPage =
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1);

                                                if (!showPage && page === currentPage - 2) {
                                                    return (
                                                        <span key={`ellipsis-before-${page}`} className="px-2 py-2 text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                if (!showPage && page === currentPage + 2) {
                                                    return (
                                                        <span key={`ellipsis-after-${page}`} className="px-2 py-2 text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                if (!showPage) return null;

                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`min-w-[40px] h-[40px] rounded-lg font-semibold transition-all ${
                                                            currentPage === page
                                                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:shadow-sm'
                                                        }`}>
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm">
                                            <span className="hidden sm:inline">Selanjutnya</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                                            title="Halaman Terakhir">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
