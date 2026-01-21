'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { getAllShops, reactivateShop, Shop } from '@/lib/api';

export default function SuspendedShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadShops();
    }, []);

    async function loadShops() {
        try {
            setLoading(true);
            const data = await getAllShops();
            const suspended = data.filter((s) => s.status === 'SUSPENDED');
            setShops(suspended);
        } catch (error) {
            console.error('Failed to load suspended shops:', error);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleReactivate(shopId: string) {
        if (!confirm('Are you sure you want to reactivate this shop?')) return;

        try {
            setProcessingId(shopId);
            await reactivateShop(shopId);
            // Remove from list after reactivation
            setShops(shops.filter(s => s.id !== shopId));
        } catch (error) {
            console.error('Failed to reactivate shop:', error);
            alert('Failed to reactivate shop');
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <AdminLayout title="Suspended Shops" subtitle="Shops that have been suspended">
            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading...</div>
            ) : shops.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No Suspended Shops</h2>
                    <p className="text-zinc-500">All shops are in good standing.</p>
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Shop Name</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Owner</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Area</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Suspended</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Reason</th>
                                <th className="text-right px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {shops.map((shop) => (
                                <tr key={shop.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 text-sm font-medium text-white">{shop.name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{shop.ownerName}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{shop.locality}, {shop.city}</td>
                                    <td className="px-6 py-4"><StatusBadge status="Suspended" /></td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{shop.suspendedAt ? new Date(shop.suspendedAt).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{shop.suspendReason || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleReactivate(shop.id)}
                                            disabled={processingId === shop.id}
                                        >
                                            {processingId === shop.id ? 'Processing...' : 'Reinstate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
