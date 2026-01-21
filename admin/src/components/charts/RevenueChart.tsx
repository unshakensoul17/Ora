'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getAttributionEvents } from '@/lib/api';

interface RevenueChartProps {
    data?: { date: string; revenue: number }[];
}

export default function RevenueChart({ data: propData }: RevenueChartProps) {
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');
    const [data, setData] = useState<{ date: string; revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (propData) {
            setData(propData);
            setLoading(false);
        } else {
            loadRevenueData();
        }
    }, [propData, timeRange]);

    async function loadRevenueData() {
        try {
            setLoading(true);

            // Fetch attribution events
            const events = await getAttributionEvents(1, 100);

            // Group by date and sum revenue
            const revenueByDate: Record<string, number> = {};

            events.forEach((event: any) => {
                const date = new Date(event.verifiedAt || event.booking?.createdAt);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                if (!revenueByDate[dateStr]) {
                    revenueByDate[dateStr] = 0;
                }
                revenueByDate[dateStr] += event.amount || 0;
            });

            // Convert to array and sort by date
            const chartData = Object.entries(revenueByDate)
                .map(([date, revenue]) => ({ date, revenue }))
                .slice(-7); // Last 7 data points

            // If no data, show empty chart
            if (chartData.length === 0) {
                chartData.push({ date: 'Today', revenue: 0 });
            }

            setData(chartData);
        } catch (error) {
            console.error('Failed to load revenue data:', error);
            setData([{ date: 'No data', revenue: 0 }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-medium text-white">Revenue Trends</h3>
                    <p className="text-sm text-zinc-500 mt-1">Last {timeRange}</p>
                </div>
                <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                    {(['7D', '30D', '90D'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeRange === range
                                    ? 'bg-zinc-700 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[280px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-zinc-500 text-sm">Loading revenue data...</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickFormatter={(value) => value > 0 ? `₹${(value / 1000).toFixed(0)}k` : '₹0'}
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
                                formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
