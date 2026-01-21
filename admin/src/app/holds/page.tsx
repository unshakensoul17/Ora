'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getHolds } from '@/lib/api';

interface Hold {
    id: string;
    startDate: string;
    endDate: string;
    holdExpiresAt: string;
    createdAt: string;
    item: {
        id: string;
        name: string;
        shop: {
            id: string;
            name: string;
            locality: string;
        };
    };
    user: {
        id: string;
        name?: string;
        phone: string;
    };
}

function TimeRemaining({ expiresAt }: { expiresAt: string }) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const isExpired = diff <= 0;
    const isExpiringSoon = hours < 1 && !isExpired;

    if (isExpired) {
        return <span className="text-xs text-red-400">Expired</span>;
    }

    return (
        <span className={`text-xs ${isExpiringSoon ? 'text-amber-400' : 'text-gray-400'}`}>
            {hours}h {minutes}m left
        </span>
    );
}

export default function HoldsPage() {
    const [holds, setHolds] = useState<Hold[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expiringSoon: 0,
    });

    useEffect(() => {
        loadHolds();
    }, []);

    async function loadHolds() {
        try {
            setLoading(true);
            const data = await getHolds();
            const bookings = data.bookings || data;
            setHolds(bookings);

            // Calculate stats
            const now = new Date();
            const active = bookings.filter((h: Hold) => new Date(h.holdExpiresAt) > now);
            const expiringSoon = active.filter((h: Hold) => {
                const diff = new Date(h.holdExpiresAt).getTime() - now.getTime();
                const hours = diff / (1000 * 60 * 60);
                return hours < 1;
            });

            setStats({
                total: bookings.length,
                active: active.length,
                expiringSoon: expiringSoon.length,
            });
        } catch (error) {
            console.error('Failed to load holds:', error);
            setHolds([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Active Holds</h1>
                <p className="text-sm text-gray-400 mt-1">Dresses currently on hold ({holds.length} total)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Total Holds</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Active (Not Expired)</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Expiring Soon (&lt;1h)</p>
                    <p className="text-2xl font-bold text-amber-400">{stats.expiringSoon}</p>
                </div>
            </div>

            {/* Holds Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white text-sm font-medium">Recent Holds</h3>
                    <button onClick={loadHolds} className="text-xs text-emerald-400 hover:text-emerald-300 transition">
                        Refresh
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0d1117]">
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Item</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Shop</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Customer</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Dates</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Expires</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Loading holds...</td>
                            </tr>
                        ) : holds.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No active holds</td>
                            </tr>
                        ) : holds.map((hold) => (
                            <tr key={hold.id} className="hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-xs text-white font-medium">{hold.item.name}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                    {hold.item.shop.name}
                                    <span className="text-gray-600 ml-1">({hold.item.shop.locality})</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                    {hold.user.name || 'Unnamed'}
                                    <span className="text-gray-600 block font-mono text-[10px]">{hold.user.phone}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                    {new Date(hold.startDate).toLocaleDateString()} - {new Date(hold.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <TimeRemaining expiresAt={hold.holdExpiresAt} />
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{new Date(hold.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
