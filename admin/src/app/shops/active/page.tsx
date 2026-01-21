'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { getAllShops, Shop } from '@/lib/api';

export default function ActiveShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShops();
    }, []);

    async function loadShops() {
        try {
            setLoading(true);
            const data = await getAllShops();
            // Filter for APPROVED status (active shops)
            const activeShops = data.filter((s) => s.status === 'APPROVED');
            setShops(activeShops);
        } catch (error) {
            console.error('Failed to load active shops:', error);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout title="Active Shops" subtitle="Currently active and verified shops">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Shop Name</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Owner</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Area</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Leads</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Revenue</th>
                            <th className="text-right px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Loading...</td></tr>
                        ) : shops.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No active shops</td></tr>
                        ) : shops.map((shop) => (
                            <tr key={shop.id} className="hover:bg-zinc-800/50">
                                <td className="px-6 py-4 text-sm font-medium text-white">{shop.name}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{shop.ownerName}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{shop.locality}, {shop.city}</td>
                                <td className="px-6 py-4"><StatusBadge status="Active" /></td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{shop._count?.inventoryItems || 0}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">-</td>
                                <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm">View</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
