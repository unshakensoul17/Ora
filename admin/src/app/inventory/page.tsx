'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getInventoryItems, getAllShops } from '@/lib/api';

interface ShopInventoryData {
    id: string;
    shopName: string;
    totalItems: number;
    available: number;
    rented: number;
    lowStock: number;
}

function ProgressBar({ value }: { value: number }) {
    const color = value >= 90 ? 'bg-emerald-500' : value >= 80 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs text-gray-300">{value}%</span>
        </div>
    );
}

export default function InventoryPage() {
    const [loading, setLoading] = useState(true);
    const [shopInventory, setShopInventory] = useState<ShopInventoryData[]>([]);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadInventoryData();
    }, []);

    async function loadInventoryData() {
        try {
            setLoading(true);
            const [items, shops] = await Promise.all([
                getInventoryItems(),
                getAllShops()
            ]);

            setTotalItems(items.length);

            // Group inventory by shop
            const shopData = shops.map(shop => {
                const shopItems = items.filter(item => item.shop?.id === shop.id);
                return {
                    id: shop.id,
                    shopName: shop.name,
                    totalItems: shopItems.length,
                    available: shopItems.filter(i => i.status === 'ACTIVE').length,
                    rented: 0, // Would need booking data
                    lowStock: 0, // Would need low stock threshold logic
                };
            });

            setShopInventory(shopData);
        } catch (error) {
            console.error('Failed to load inventory:', error);
        } finally {
            setLoading(false);
        }
    }

    const activeItems = shopInventory.reduce((sum, s) => sum + s.available, 0);
    const lowStockCount = shopInventory.filter(s => s.totalItems > 0 && s.totalItems < 10).length;

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Inventory Intelligence</h1>
                <p className="text-sm text-gray-400 mt-1">Monitor inventory health across all shops</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Total Items</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{totalItems.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Active Items</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{activeItems}</span>
                    </div>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Low Stock Shops</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{lowStockCount}</span>
                    </div>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Total Shops</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{shopInventory.length}</span>
                    </div>
                </div>
            </div>

            {/* Shop Inventory Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white text-sm font-medium">Shop Inventory Overview</h3>
                    <button className="text-xs text-emerald-400 hover:text-emerald-300 transition">
                        Refresh
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0d1117]">
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Shop</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Total Items</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Available</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Loading inventory...</td>
                            </tr>
                        ) : shopInventory.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">No inventory data</td>
                            </tr>
                        ) : shopInventory.map((shop) => (
                            <tr key={shop.id} className="hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-xs text-white font-medium">{shop.shopName}</td>
                                <td className="px-4 py-3 text-xs text-gray-300">{shop.totalItems}</td>
                                <td className="px-4 py-3 text-xs text-emerald-400">{shop.available}</td>
                                <td className="px-4 py-3">
                                    <ProgressBar value={shop.totalItems > 0 ? Math.round((shop.available / shop.totalItems) * 100) : 0} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
