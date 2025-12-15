'use client';

import { useState } from 'react';

interface IPayment {
    _id: string;
    tenantName: string;
    hostelName: string;
    roomNumber: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'pending';
    dueDate: string;
    paidDate?: string;
    month: string;
}

// Hardcoded payment data
const hardcodedPayments: IPayment[] = [
    {
        _id: 'p1',
        tenantName: 'Budi Santoso',
        hostelName: 'Kost Melati',
        roomNumber: '101',
        amount: 1500000,
        status: 'paid',
        dueDate: '2024-12-01',
        paidDate: '2024-11-28',
        month: 'December 2024',
    },
    {
        _id: 'p2',
        tenantName: 'Siti Nurhaliza',
        hostelName: 'Kost Melati',
        roomNumber: '102',
        amount: 1500000,
        status: 'paid',
        dueDate: '2024-12-01',
        paidDate: '2024-11-30',
        month: 'December 2024',
    },
    {
        _id: 'p3',
        tenantName: 'Ahmad Dahlan',
        hostelName: 'Kost Melati',
        roomNumber: '201',
        amount: 1800000,
        status: 'unpaid',
        dueDate: '2024-12-01',
        month: 'December 2024',
    },
    {
        _id: 'p4',
        tenantName: 'Rina Wijaya',
        hostelName: 'Kost Mawar',
        roomNumber: 'A1',
        amount: 1200000,
        status: 'pending',
        dueDate: '2024-12-01',
        month: 'December 2024',
    },
    {
        _id: 'p5',
        tenantName: 'Denny Wirawan',
        hostelName: 'Kost Anggrek',
        roomNumber: '1A',
        amount: 2000000,
        status: 'paid',
        dueDate: '2024-12-01',
        paidDate: '2024-11-25',
        month: 'December 2024',
    },
    // Previous month data
    {
        _id: 'p6',
        tenantName: 'Budi Santoso',
        hostelName: 'Kost Melati',
        roomNumber: '101',
        amount: 1500000,
        status: 'paid',
        dueDate: '2024-11-01',
        paidDate: '2024-10-30',
        month: 'November 2024',
    },
    {
        _id: 'p7',
        tenantName: 'Siti Nurhaliza',
        hostelName: 'Kost Melati',
        roomNumber: '102',
        amount: 1500000,
        status: 'paid',
        dueDate: '2024-11-01',
        paidDate: '2024-10-29',
        month: 'November 2024',
    },
    {
        _id: 'p8',
        tenantName: 'Ahmad Dahlan',
        hostelName: 'Kost Melati',
        roomNumber: '201',
        amount: 1800000,
        status: 'paid',
        dueDate: '2024-11-01',
        paidDate: '2024-11-02',
        month: 'November 2024',
    },
];

export default function FeenDues() {
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'pending'>('all');

    const filteredPayments = filterStatus === 'all' ? hardcodedPayments : hardcodedPayments.filter((p) => p.status === filterStatus);

    const totalPaid = hardcodedPayments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalUnpaid = hardcodedPayments.filter((p) => p.status === 'unpaid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = hardcodedPayments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Fee and Due</h1>
                    <p className="text-gray-500 mt-1">Manage fee and dues</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
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
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
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
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
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
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('paid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            Paid
                        </button>
                        <button
                            onClick={() => setFilterStatus('unpaid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'unpaid' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            Unpaid
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
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
                                        <td className="py-3 px-4 text-gray-600">{payment.roomNumber}</td>
                                        <td className="py-3 px-4 text-gray-600">{payment.month}</td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">
                                            Rp {payment.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{new Date(payment.dueDate).toLocaleDateString('id-ID')}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
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

                    {filteredPayments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No payments found for this filter.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
