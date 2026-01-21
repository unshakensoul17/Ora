'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBillingData, type BillingData } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BillingPage() {
    const [billingData, setBillingData] = useState<BillingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBillingData();
    }, []);

    async function loadBillingData() {
        try {
            setLoading(true);
            const data = await getBillingData();
            setBillingData(data);
        } catch (error) {
            console.error('Failed to load billing data:', error);
            setBillingData([]);
        } finally {
            setLoading(false);
        }
    }

    const totalRevenue = billingData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalPending = billingData.reduce((sum, item) => sum + item.pendingAmount, 0);
    const totalLeads = billingData.reduce((sum, item) => sum + item.totalLeads, 0);

    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-500">Billing Dashboard</h1>
                        <p className="text-gray-400 text-sm">Revenue and payment tracking</p>
                    </div>
                    <nav className="flex gap-6">
                        <Link href="/" className="text-gray-300 hover:text-amber-500 transition">Dashboard</Link>
                        <Link href="/admin/shops" className="text-gray-300 hover:text-amber-500 transition">Shops</Link>
                        <Link href="/admin/leads" className="text-gray-300 hover:text-amber-500 transition">Leads</Link>
                        <Link href="/admin/billing" className="text-amber-500 border-b-2 border-amber-500 pb-1">Billing</Link>
                    </nav>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 border border-green-500/30">
                        <p className="text-green-400 text-sm mb-1">Total Revenue</p>
                        <p className="text-4xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-6 border border-amber-500/30">
                        <p className="text-amber-400 text-sm mb-1">Pending Payments</p>
                        <p className="text-4xl font-bold text-white">₹{totalPending.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/30">
                        <p className="text-blue-400 text-sm mb-1">Total Leads Billed</p>
                        <p className="text-4xl font-bold text-white">{totalLeads}</p>
                    </div>
                </div>

                {/* Revenue by Shop Chart */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue by Shop</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={billingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="shopName"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value: number) => [`₹${value}`, 'Revenue']}
                            />
                            <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]}>
                                {billingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Billing Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-amber-500/5 to-transparent">
                        <h2 className="text-lg font-semibold text-white">Shop Billing Details</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading billing data...</div>
                    ) : billingData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No billing data found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="text-left p-4 text-gray-300 text-sm font-medium">Shop Name</th>
                                        <th className="text-center p-4 text-gray-300 text-sm font-medium">Total Leads</th>
                                        <th className="text-right p-4 text-gray-300 text-sm font-medium">Total Revenue</th>
                                        <th className="text-right p-4 text-gray-300 text-sm font-medium">Pending Amount</th>
                                        <th className="text-center p-4 text-gray-300 text-sm font-medium">Last Payment</th>
                                        <th className="text-center p-4 text-gray-300 text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billingData.map((item) => (
                                        <tr key={item.shopId} className="border-t border-gray-700 hover:bg-gray-700/30 transition">
                                            <td className="p-4 text-white font-medium">{item.shopName}</td>
                                            <td className="p-4 text-center text-gray-300">{item.totalLeads}</td>
                                            <td className="p-4 text-right">
                                                <span className="text-green-400 font-bold">₹{item.totalRevenue.toLocaleString()}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={item.pendingAmount > 0 ? 'text-amber-400 font-medium' : 'text-gray-400'}>
                                                    ₹{item.pendingAmount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-gray-400 text-sm">
                                                {item.lastPaymentDate ? new Date(item.lastPaymentDate).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition">
                                                    Generate Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
