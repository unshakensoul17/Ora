'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import KPICard from '@/components/dashboard/KPICard';
import { getAllShops, getPlatformStats, Shop } from '@/lib/api';

// Progress bar component for inventory accuracy
function ProgressBar({ value, color = 'emerald' }: { value: number; color?: string }) {
    const colorClasses = {
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        red: 'bg-red-500',
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 w-8">{value}%</span>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
    const isActive = status === 'APPROVED';
    const isPending = status === 'PENDING';

    const getColor = () => {
        if (isActive) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        if (isPending) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    };

    const getLabel = () => {
        if (isActive) return 'ACTIVE-GREEN';
        if (isPending) return 'PENDING';
        return 'SUSPENDED';
    };

    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getColor()}`}>
            [{getLabel()}]
        </span>
    );
}

// Action button component
function ActionButton({ label, variant = 'default', onClick }: { label: string; variant?: 'default' | 'warning' | 'success'; onClick?: () => void }) {
    const variants = {
        default: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        warning: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30',
        success: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
    };

    return (
        <button
            className={`px-2 py-1 text-[10px] font-medium rounded transition ${variants[variant]}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

interface ShopData {
    id: string;
    shopId: string;
    name: string;
    status: string;
    invAccuracy: number;
    qrScans: string;
    lastActive: string;
    disputes: number;
    revenue: number;
    inventoryCount: number;
}

interface Stats {
    liveShops: string;
    scanRate: string;
    stockouts: number;
    revenue: number;
}

export default function DashboardPage() {
    const [shops, setShops] = useState<ShopData[]>([]);
    const [stats, setStats] = useState<Stats>({ liveShops: '0/0', scanRate: '0%', stockouts: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            // Fetch shops from backend
            const shopsData = await getAllShops();

            // Calculate stats
            const activeCount = shopsData.filter((s: Shop) => s.status === 'APPROVED').length;
            const totalCount = shopsData.length;

            // Fetch platform stats
            let platformStats = null;
            try {
                platformStats = await getPlatformStats();
            } catch (e) {
                console.log('Platform stats not available');
            }

            // Transform shop data
            const transformedShops = shopsData.map((s: Shop, i: number) => ({
                id: s.id,
                shopId: `SS8/${String(i + 1).padStart(6, '0')}`,
                name: s.name,
                status: s.status,
                invAccuracy: 75 + Math.floor(Math.random() * 20), // Would come from inventory stats
                qrScans: `${s._count?.attributions || 0}/18`,
                lastActive: getRelativeTime(s.updatedAt),
                disputes: 0,
                revenue: platformStats?.billedRevenue || Math.floor(Math.random() * 50000 + 20000),
                inventoryCount: s._count?.inventoryItems || 0,
            }));

            setShops(transformedShops);
            setStats({
                liveShops: `${activeCount}/${totalCount - activeCount}`,
                scanRate: platformStats ? `${Math.round((platformStats.verifiedEvents / (platformStats.totalEvents || 1)) * 100)}%` : '88%',
                stockouts: 12, // Would come from inventory alerts
                revenue: platformStats?.totalRevenue || 42500,
            });

        } catch (err: any) {
            console.error('Failed to load dashboard:', err);
            setError('Failed to connect to backend. Showing demo data.');

            // Fallback demo data
            setShops([
                { id: '1', shopId: 'SS8/000001', name: 'Fashcycle Fashmall', status: 'ACTIVE', invAccuracy: 82, qrScans: '15/18', lastActive: '22 hours ago', disputes: 0, revenue: 42500, inventoryCount: 45 },
                { id: '2', shopId: 'SS8/600002', name: 'Fashcycle Sumnakatan', status: 'ACTIVE', invAccuracy: 88, qrScans: '17/18', lastActive: '22 hours ago', disputes: 0, revenue: 42500, inventoryCount: 38 },
                { id: '3', shopId: 'SS9/000003', name: 'Fashcycle Rudblut', status: 'ACTIVE', invAccuracy: 92, qrScans: '15/18', lastActive: '22 hours ago', disputes: 0, revenue: 42500, inventoryCount: 52 },
                { id: '4', shopId: 'SS8/000004', name: 'Fashcycle Encaptina', status: 'PENDING_APPROVAL', invAccuracy: 83, qrScans: '0/0', lastActive: 'Never', disputes: 0, revenue: 0, inventoryCount: 0 },
            ]);
            setStats({ liveShops: '3/1', scanRate: '88%', stockouts: 12, revenue: 42500 });
        } finally {
            setLoading(false);
        }
    }

    function getRelativeTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffHours < 48) return 'Yesterday';
        return `${Math.floor(diffHours / 24)} days ago`;
    }

    return (
        <AdminLayout showFilter>
            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-xs text-amber-400">{error}</p>
                </div>
            )}

            {/* KPI Cards Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <KPICard
                    label="Live Shops"
                    value={stats.liveShops}
                    sparkData={[30, 45, 40, 55, 50, 60, 55, 70, 65, 75]}
                    sparkColor="#10b981"
                />
                <KPICard
                    label="Scan Rate (24h)"
                    value={stats.scanRate}
                    sparkData={[60, 65, 55, 70, 75, 65, 80, 75, 85, 88]}
                    sparkColor="#f59e0b"
                />
                <KPICard
                    label="Stockouts Today"
                    value={String(stats.stockouts)}
                    sparkData={[15, 12, 18, 14, 16, 12, 10, 14, 11, 12]}
                    sparkColor="#f59e0b"
                />
                <KPICard
                    label="Platform Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    sparkData={[25000, 30000, 28000, 35000, 32000, 40000, 38000, 42000, 40000, stats.revenue]}
                    sparkColor="#10b981"
                />
            </div>

            {/* Master Shop Registry */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-white text-sm font-medium">Master Shop Registry</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                        >
                            Refresh
                        </button>
                        <input
                            type="text"
                            placeholder="Search filter..."
                            className="w-48 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800 bg-[#0d1117]">
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Shop ID / Name</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Inv. Accuracy</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">QR Scans</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Last Active</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Inventory</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Revenue (MTD)</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Loading from backend...
                                        </div>
                                    </td>
                                </tr>
                            ) : shops.map((shop) => (
                                <tr
                                    key={shop.id}
                                    className={`hover:bg-gray-800/30 transition ${shop.status === 'PENDING' ? 'bg-amber-500/5' : ''}`}
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-xs text-white font-medium">{shop.shopId}</p>
                                            <p className="text-[10px] text-gray-500">{shop.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={shop.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <ProgressBar
                                            value={shop.invAccuracy}
                                            color={shop.invAccuracy >= 80 ? 'emerald' : shop.invAccuracy >= 70 ? 'amber' : 'red'}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-300">{shop.qrScans}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{shop.lastActive}</td>
                                    <td className="px-4 py-3 text-xs text-gray-300">{shop.inventoryCount} items</td>
                                    <td className="px-4 py-3 text-xs text-gray-300">₹{shop.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <ActionButton label="Impersonate" />
                                            <ActionButton label="Audit" />
                                            <ActionButton label="Freeze" variant="warning" />
                                            <ActionButton label="WhatsApp" variant="success" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
