'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAttributionEvents, type AttributionEvent } from '@/lib/api';

export default function LeadsPage() {
    const [leads, setLeads] = useState<AttributionEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        loadLeads();
    }, []);

    async function loadLeads() {
        try {
            setLoading(true);
            const data = await getAttributionEvents();
            setLeads(data);
        } catch (error) {
            console.error('Failed to load leads:', error);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }

    const totalRevenue = leads.reduce((sum, lead) => sum + lead.amount, 0);

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-500">Leads Tracking</h1>
                        <p className="text-gray-400 text-sm">All verified walk-ins and attribution events</p>
                    </div>
                    <nav className="flex gap-6">
                        <Link href="/" className="text-gray-300 hover:text-amber-500 transition">Dashboard</Link>
                        <Link href="/admin/shops" className="text-gray-300 hover:text-amber-500 transition">Shops</Link>
                        <Link href="/admin/leads" className="text-amber-500 border-b-2 border-amber-500 pb-1">Leads</Link>
                        <Link href="/admin/billing" className="text-gray-300 hover:text-amber-500 transition">Billing</Link>
                    </nav>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 border border-green-500/30">
                        <p className="text-green-400 text-sm mb-1">Total Leads</p>
                        <p className="text-4xl font-bold text-white">{leads.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/30">
                        <p className="text-blue-400 text-sm mb-1">Total Revenue</p>
                        <p className="text-4xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-6 border border-purple-500/30">
                        <p className="text-purple-400 text-sm mb-1">Avg per Lead</p>
                        <p className="text-4xl font-bold text-white">
                            ₹{leads.length > 0 ? Math.round(totalRevenue / leads.length) : 0}
                        </p>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-amber-500/5 to-transparent">
                        <h2 className="text-lg font-semibold text-white">All Verified Leads</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading leads...</div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No leads found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="text-left p-4 text-gray-300 text-sm font-medium">Customer</th>
                                        <th className="text-left p-4 text-gray-300 text-sm font-medium">Shop</th>
                                        <th className="text-left p-4 text-gray-300 text-sm font-medium">Item</th>
                                        <th className="text-left p-4 text-gray-300 text-sm font-medium">Date</th>
                                        <th className="text-right p-4 text-gray-300 text-sm font-medium">Revenue</th>
                                        <th className="text-center p-4 text-gray-300 text-sm font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition">
                                            <td className="p-4">
                                                <p className="text-white font-medium">{lead.booking.user.name}</p>
                                                <p className="text-gray-400 text-xs">{lead.booking.user.phone}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-white">{lead.booking.inventoryItem.shop.name}</p>
                                                <p className="text-gray-400 text-xs">{lead.booking.inventoryItem.shop.locality}</p>
                                            </td>
                                            <td className="p-4 text-gray-300">{lead.booking.inventoryItem.name}</td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {new Date(lead.verifiedAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="text-green-400 font-bold text-lg">₹{lead.amount}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
                                                    Verified
                                                </span>
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
