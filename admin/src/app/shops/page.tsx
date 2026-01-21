'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { getAllShops, Shop } from '@/lib/api';

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'APPROVED': 'bg-emerald-500/10 text-emerald-400',
        'PENDING': 'bg-amber-500/10 text-amber-400',
        'SUSPENDED': 'bg-red-500/10 text-red-400',
    };
    const labels: Record<string, string> = {
        'APPROVED': 'Active',
        'PENDING': 'Pending',
        'SUSPENDED': 'Suspended',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${colors[status] || 'bg-gray-500/10 text-gray-400'}`}>
            {labels[status] || status}
        </span>
    );
}

export default function AllShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadShops();
    }, []);

    async function loadShops() {
        try {
            setLoading(true);
            const data = await getAllShops();
            setShops(data);
        } catch (error) {
            console.error('Failed to load shops from backend:', error);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }

    const filteredShops = shops.filter(shop => {
        const matchesFilter = filter === 'all' || shop.status === filter;
        const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase()) ||
            shop.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            shop.locality.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">All Shops</h1>
                <p className="text-sm text-gray-400 mt-1">Manage registered shops ({shops.length} total)</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search shops..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                >
                    <option value="all">All Status</option>
                    <option value="APPROVED">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
                <button onClick={loadShops} className="px-3 py-2 text-xs text-emerald-400 hover:text-emerald-300">
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0d1117]">
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Shop Name</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Owner</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Phone</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Location</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Inventory</th>
                            <th className="text-right px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">Loading from backend...</td>
                            </tr>
                        ) : filteredShops.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">No shops found</td>
                            </tr>
                        ) : filteredShops.map((shop) => (
                            <tr key={shop.id} className="hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-xs text-white font-medium">{shop.name}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{shop.ownerName}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{shop.ownerPhone}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{shop.locality}, {shop.city}</td>
                                <td className="px-4 py-3"><StatusBadge status={shop.status} /></td>
                                <td className="px-4 py-3 text-xs text-gray-400">{shop._count?.inventoryItems || 0} items</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/shops/${shop.id}`}>
                                        <button className="px-2 py-1 text-[10px] bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition">
                                            View
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
