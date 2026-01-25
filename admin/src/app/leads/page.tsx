'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getPlatformStats, getAttributionEvents } from '@/lib/api';

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'verified': 'bg-emerald-500/10 text-emerald-400',
        'pending': 'bg-amber-500/10 text-amber-400',
        'visit': 'bg-blue-500/10 text-blue-400',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${colors[status] || 'bg-gray-500/10 text-gray-400'}`}>
            {status}
        </span>
    );
}

interface Lead {
    id: string;
    customerName: string;
    shop: string;
    product: string;
    amount: number;
    time: string;
    status: string;
}

export default function AllLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadLeads();
    }, []);

    async function loadLeads() {
        try {
            setLoading(true);

            // Get platform stats
            const platformStats = await getPlatformStats();
            setStats({
                total: platformStats.totalEvents || 0,
                verified: platformStats.verifiedEvents || 0,
                pending: platformStats.pendingEvents || 0,
                revenue: platformStats.totalRevenue || 0,
            });

            // Get attribution events (leads)
            const events = await getAttributionEvents(1, 100);

            // Map events to Lead interface
            const realLeads: Lead[] = events.map((event: any) => ({
                id: event.id,
                customerName: event.booking?.user?.name || 'Walk-in Customer',
                shop: event.booking?.inventoryItem?.shop?.name || 'Unknown Shop',
                product: event.booking?.inventoryItem?.name || 'Rental Item',
                amount: event.amount || 0,
                time: event.verifiedAt || new Date().toISOString(),
                status: 'verified' // Attribution events are generally verified scans
            }));

            setLeads(realLeads);
        } catch (error) {
            console.error('Failed to load leads:', error);
            // Fallback to empty state or minimal demo data if crucial
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }

    const filteredLeads = leads.filter(lead => filter === 'all' || lead.status === filter);

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">All Leads</h1>
                <p className="text-sm text-gray-400 mt-1">Track customer leads and conversions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Total Leads</p>
                    <p className="text-xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Verified</p>
                    <p className="text-xl font-bold text-emerald-400">{stats.verified}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Pending</p>
                    <p className="text-xl font-bold text-amber-400">{stats.pending}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Revenue</p>
                    <p className="text-xl font-bold text-white">₹{stats.revenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                </select>
                <button onClick={loadLeads} className="text-xs text-emerald-400 hover:text-emerald-300">Refresh</button>
            </div>

            {/* Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0d1117]">
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Customer</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Shop</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Product</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Amount</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Time</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</td></tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No leads found</td></tr>
                        ) : filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-xs text-white font-medium">{lead.customerName}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{lead.shop}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{lead.product}</td>
                                <td className="px-4 py-3 text-xs text-gray-300">₹{lead.amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                    {new Date(lead.time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
