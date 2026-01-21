'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { getAttributionEvents } from '@/lib/api';

interface LeadsChartProps {
    data?: { shop: string; leads: number }[];
}

const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'];

export default function LeadsChart({ data: propData }: LeadsChartProps) {
    const [data, setData] = useState<{ shop: string; leads: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (propData) {
            setData(propData);
            setLoading(false);
        } else {
            loadLeadsData();
        }
    }, [propData]);

    async function loadLeadsData() {
        try {
            setLoading(true);

            // Fetch attribution events
            const events = await getAttributionEvents(1, 100);

            // Group by shop and count leads
            const leadsByShop: Record<string, number> = {};

            events.forEach((event: any) => {
                const shopName = event.booking?.inventoryItem?.shop?.name || 'Unknown Shop';

                if (!leadsByShop[shopName]) {
                    leadsByShop[shopName] = 0;
                }
                leadsByShop[shopName] += 1;
            });

            // Convert to array, sort by leads, and take top 5
            const chartData = Object.entries(leadsByShop)
                .map(([shop, leads]) => ({ shop, leads }))
                .sort((a, b) => b.leads - a.leads)
                .slice(0, 5);

            // If no data, show empty state
            if (chartData.length === 0) {
                chartData.push({ shop: 'No data', leads: 0 });
            }

            setData(chartData);
        } catch (error) {
            console.error('Failed to load leads data:', error);
            setData([{ shop: 'No data', leads: 0 }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="mb-6">
                <h3 className="text-base font-medium text-white">Leads by Shop</h3>
                <p className="text-sm text-zinc-500 mt-1">Top performing shops</p>
            </div>
            <div className="h-[280px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-zinc-500 text-sm">Loading leads data...</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="shop"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                width={100}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                }}
                                labelStyle={{ color: '#a1a1aa', fontSize: 12 }}
                                itemStyle={{ color: '#f59e0b', fontSize: 14, fontWeight: 500 }}
                                formatter={(value: number) => [value, 'Leads']}
                            />
                            <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
