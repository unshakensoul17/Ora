'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import RevenueChart from '@/components/charts/RevenueChart';
import StatusBadge from '@/components/ui/StatusBadge';
import { getPlatformStats, getAttributionEvents } from '@/lib/api';

interface BillingRow {
    id: string;
    shopName: string;
    period: string;
    leads: number;
    amount: number;
    status: 'paid' | 'pending';
}

export default function BillingPage() {
    const [period, setPeriod] = useState('current');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayments: 0,
        leadsBilled: 0,
    });
    const [billingData, setBillingData] = useState<BillingRow[]>([]);

    useEffect(() => {
        loadBillingData();
    }, [period]);

    async function loadBillingData() {
        try {
            setLoading(true);

            // Fetch platform stats
            const platformStats = await getPlatformStats();

            setStats({
                totalRevenue: platformStats.totalRevenue || 0,
                pendingPayments: platformStats.pendingBilling || 0,
                leadsBilled: platformStats.verifiedEvents || 0,
            });

            // Fetch attribution events and group by shop
            const events = await getAttributionEvents(1, 100);

            // Group events by shop
            const shopBilling = events.reduce((acc: Record<string, BillingRow>, event: any) => {
                const shopName = event.booking?.inventoryItem?.shop?.name || 'Unknown Shop';
                const shopKey = event.booking?.inventoryItem?.shop?.id || shopName;

                if (!acc[shopKey]) {
                    acc[shopKey] = {
                        id: shopKey,
                        shopName,
                        period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                        leads: 0,
                        amount: 0,
                        status: 'paid', // All fetched events are considered paid
                    };
                }

                acc[shopKey].leads += 1;
                acc[shopKey].amount += event.amount || 0;

                return acc;
            }, {});

            setBillingData(Object.values(shopBilling));
        } catch (error) {
            console.error('Failed to load billing data:', error);
            setStats({ totalRevenue: 0, pendingPayments: 0, leadsBilled: 0 });
            setBillingData([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout title="Revenue & Billing" subtitle="Track revenue and manage billing">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <p className="text-sm text-zinc-500 mb-1">Total Revenue</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-white">
                            ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <p className="text-sm text-zinc-500 mb-1">Pending Payments</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-white">
                            ₹{stats.pendingPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <p className="text-sm text-zinc-500 mb-1">Leads Billed</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-white">{stats.leadsBilled}</span>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="mb-8">
                <RevenueChart />
            </div>

            {/* Billing Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-base font-medium text-white">Billing by Shop</h3>
                    <button
                        onClick={loadBillingData}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center text-zinc-500">
                        Loading billing data...
                    </div>
                ) : billingData.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-white font-medium mb-2">No Billing Data</h3>
                        <p className="text-zinc-500 text-sm">
                            No verified leads yet. Revenue will appear once shops scan QR codes.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Shop</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Period</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Leads</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {billingData.map((row) => (
                                <tr key={row.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 text-sm font-medium text-white">{row.shopName}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{row.period}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{row.leads}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        ₹{row.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={row.status === 'paid' ? 'completed' : 'pending'} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}
