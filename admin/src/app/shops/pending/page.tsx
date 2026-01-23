'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getPendingShops, approveShop, rejectShop, Shop } from '@/lib/api';

export default function PendingApprovalsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadPendingShops();
    }, []);

    async function loadPendingShops() {
        try {
            setLoading(true);
            const data = await getPendingShops();
            setShops(data);
        } catch (error) {
            console.error('Failed to load pending shops:', error);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(shopId: string) {
        try {
            setProcessingId(shopId);
            await approveShop(shopId);
            setShops(shops.filter(s => s.id !== shopId));
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve shop. Check if backend is running.');
        } finally {
            setProcessingId(null);
        }
    }

    async function handleReject(shopId: string) {
        if (!confirm('Are you sure you want to reject this shop?')) return;

        try {
            setProcessingId(shopId);
            await rejectShop(shopId);
            setShops(shops.filter(s => s.id !== shopId));
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Failed to reject shop. Check if backend is running.');
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Pending Approvals</h1>
                <p className="text-sm text-gray-400 mt-1">Review and approve new shop registrations ({shops.length} pending)</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading from backend...</div>
            ) : shops.length === 0 ? (
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">All Caught Up!</h2>
                    <p className="text-gray-500 text-sm">No pending shop approvals at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shops.map((shop) => (
                        <div key={shop.id} className="bg-[#151b23] border border-gray-800 rounded-lg p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-base font-semibold text-white">{shop.name}</h3>
                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-medium rounded">
                                            Pending
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 mb-1">Owner</p>
                                            <p className="text-xs text-gray-300">{shop.ownerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 mb-1">Phone</p>
                                            <p className="text-xs text-gray-300">{shop.ownerPhone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 mb-1">Location</p>
                                            <p className="text-xs text-gray-300">{shop.locality}, {shop.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 mb-1">Applied</p>
                                            <p className="text-xs text-gray-300">{new Date(shop.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-6">
                                    <button
                                        onClick={() => handleApprove(shop.id)}
                                        disabled={!!processingId}
                                        className="px-4 py-2 bg-emerald-500 text-black text-xs font-medium rounded hover:bg-emerald-400 transition disabled:opacity-50"
                                    >
                                        {processingId === shop.id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(shop.id)}
                                        disabled={!!processingId}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-medium rounded hover:bg-red-500/30 transition disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
