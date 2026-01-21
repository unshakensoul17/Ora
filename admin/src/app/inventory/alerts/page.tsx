'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getInventoryItems } from '@/lib/api';

interface LowStockAlert {
    id: string;
    shopName: string;
    itemName: string;
    currentStock: number;
    threshold: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
}

function UrgencyBadge({ urgency }: { urgency: string }) {
    const colors: Record<string, string> = {
        critical: 'bg-red-500/20 text-red-400 border-red-500/30',
        high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${colors[urgency]}`}>
            {urgency.toUpperCase()}
        </span>
    );
}

export default function LowStockAlertsPage() {
    const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    });

    useEffect(() => {
        loadAlerts();
    }, []);

    async function loadAlerts() {
        try {
            setLoading(true);
            // Fetch all inventory items - in a real scenario, backend should return low stock items directly
            const items = await getInventoryItems();

            // For now, since we don't have stock tracking, show message
            // TODO: Backend needs to add stock quantity field and low stock threshold
            setAlerts([]);
            setStats({ critical: 0, high: 0, medium: 0, low: 0 });
        } catch (error) {
            console.error('Failed to load low stock alerts:', error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Low Stock Alerts</h1>
                <p className="text-sm text-gray-400 mt-1">Items requiring immediate restocking attention</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-xs mb-1">Critical</p>
                    <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-amber-400 text-xs mb-1">High Priority</p>
                    <p className="text-2xl font-bold text-amber-400">{stats.high}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-400 text-xs mb-1">Medium</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.medium}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-xs mb-1">Low</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.low}</p>
                </div>
            </div>

            {/* Alerts Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="px-4 py-12 text-center text-gray-500">
                        Loading alerts...
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-white font-medium mb-2">No Low Stock Alerts</h3>
                        <p className="text-gray-500 text-sm">
                            All inventory levels are healthy. Stock tracking coming soon!
                        </p>
                        <p className="text-gray-600 text-xs mt-4">
                            Note: Stock quantity tracking will be added in the next update.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800 bg-[#0d1117]">
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Shop</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Item</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Current Stock</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Threshold</th>
                                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Urgency</th>
                                <th className="text-right px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {alerts.map((alert) => (
                                <tr key={alert.id} className={`hover:bg-gray-800/30 transition ${alert.urgency === 'critical' ? 'bg-red-500/5' : ''}`}>
                                    <td className="px-4 py-3 text-xs text-gray-300">{alert.shopName}</td>
                                    <td className="px-4 py-3 text-xs text-white font-medium">{alert.itemName}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium ${alert.currentStock <= 1 ? 'text-red-400' : alert.currentStock <= 2 ? 'text-amber-400' : 'text-gray-300'}`}>
                                            {alert.currentStock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{alert.threshold}</td>
                                    <td className="px-4 py-3"><UrgencyBadge urgency={alert.urgency} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="px-2 py-1 text-[10px] bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition">
                                            Notify Shop
                                        </button>
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
