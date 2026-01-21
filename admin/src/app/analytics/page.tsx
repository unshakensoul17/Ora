'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import RevenueChart from '@/components/charts/RevenueChart';
import LeadsChart from '@/components/charts/LeadsChart';
import { getDashboardStats, getAllCustomerUsers } from '@/lib/api';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState([
        { label: 'Total Users', value: '0', change: null, positive: true },
        { label: 'Active Shops', value: '0', change: null, positive: true },
        { label: 'Total Leads', value: '0', change: null, positive: true },
        { label: 'Total Revenue', value: '₹0', change: null, positive: true },
    ]);

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const stats = await getDashboardStats();

            // Fetch customer users count
            let usersCount = 0;
            try {
                const usersData = await getAllCustomerUsers(1, 1);
                usersCount = usersData.total || usersData.pagination?.total || 0;
            } catch (err) {
                console.error('Failed to fetch users:', err);
            }

            setMetrics([
                {
                    label: 'Total Users',
                    value: usersCount.toString(),
                    change: null,
                    positive: true
                },
                {
                    label: 'Active Shops',
                    value: stats.activeShops.toString(),
                    change: null,
                    positive: true
                },
                {
                    label: 'Total Leads',
                    value: stats.totalLeads.toString(),
                    change: null,
                    positive: true
                },
                {
                    label: 'Total Revenue',
                    value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                    change: null,
                    positive: true
                },
            ]);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout title="Analytics" subtitle="Marketplace performance insights">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric) => (
                    <div key={metric.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <p className="text-sm text-zinc-500 mb-1">{metric.label}</p>
                        <div className="flex items-baseline gap-2">
                            {loading ? (
                                <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
                            ) : (
                                <>
                                    <span className="text-2xl font-semibold text-white">{metric.value}</span>
                                    {metric.change && (
                                        <span className={`text-xs ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {metric.change}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RevenueChart />
                <LeadsChart />
            </div>

            {/* Additional insights */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-base font-medium text-white mb-4">System Status</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5" />
                        <p className="text-sm text-zinc-300">
                            Platform is operational with {metrics[1].value} active shops
                        </p>
                    </div>
                    {parseInt(metrics[2].value) > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                            <p className="text-sm text-zinc-300">
                                {metrics[2].value} verified leads generated across the
                                platform
                            </p>
                        </div>
                    )}
                    {parseInt(metrics[0].value) > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5" />
                            <p className="text-sm text-zinc-300">
                                {metrics[0].value} registered users on the platform
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
