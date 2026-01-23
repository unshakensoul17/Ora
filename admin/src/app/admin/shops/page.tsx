'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllShops, approveShop, suspendShop, type Shop } from '@/lib/api';

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED'>('ALL');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadShops();
    }, []);

    async function loadShops() {
        try {
            setLoading(true);
            const data = await getAllShops();
            setShops(data);
        } catch (error) {
            console.error('Failed to load shops:', error);
            // Mock data fallback
            setShops([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(shopId: string) {
        try {
            setActionLoading(shopId);
            await approveShop(shopId);
            await loadShops();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve shop');
        } finally {
            setActionLoading(null);
        }
    }

    async function handleSuspend(shopId: string) {
        const reason = prompt('Enter reason for suspension:');
        if (!reason) return;

        try {
            setActionLoading(shopId);
            await suspendShop(shopId, reason);
            await loadShops();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to suspend shop');
        } finally {
            setActionLoading(null);
        }
    }

    const filteredShops = filter === 'ALL' ? shops : shops.filter(s => s.status === filter);

    const getStatusBadge = (status: string) => {
        const styles = {
            ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
            PENDING_APPROVAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return styles[status as keyof typeof styles] || styles.ACTIVE;
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-500">Shops Management</h1>
                        <p className="text-gray-400 text-sm">Manage all registered shops</p>
                    </div>
                    <nav className="flex gap-6">
                        <Link href="/" className="text-gray-300 hover:text-amber-500 transition">Dashboard</Link>
                        <Link href="/admin/shops" className="text-amber-500 border-b-2 border-amber-500 pb-1">Shops</Link>
                        <Link href="/admin/leads" className="text-gray-300 hover:text-amber-500 transition">Leads</Link>
                        <Link href="/admin/billing" className="text-gray-300 hover:text-amber-500 transition">Billing</Link>
                    </nav>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto">
                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    {['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Shops Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading shops...</div>
                ) : filteredShops.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No shops found</div>
                ) : (
                    <div className="grid gap-4">
                        {filteredShops.map((shop) => (
                            <div key={shop.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-amber-500/30 transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{shop.name}</h3>
                                        <p className="text-gray-400 text-sm">{shop.ownerName} • {shop.ownerPhone}</p>
                                        <p className="text-gray-500 text-sm mt-1">{shop.locality} • {shop.address}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(shop.status)}`}>
                                        {shop.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {shop._count && (
                                    <div className="flex gap-6 mb-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Inventory:</span>
                                            <span className="text-white font-medium ml-2">{shop._count.inventoryItems}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Leads:</span>
                                            <span className="text-white font-medium ml-2">{shop._count.attributions}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {shop.status === 'PENDING_APPROVAL' && (
                                        <button
                                            onClick={() => handleApprove(shop.id)}
                                            disabled={actionLoading === shop.id}
                                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {shop.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleSuspend(shop.id)}
                                            disabled={actionLoading === shop.id}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition disabled:opacity-50"
                                        >
                                            Suspend
                                        </button>
                                    )}
                                    <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
