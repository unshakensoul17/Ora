'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ShopStatusChartProps {
    data: {
        active: number;
        pending: number;
        suspended: number;
    };
}

const COLORS = {
    active: '#10b981',      // green
    pending: '#f59e0b',     // amber
    suspended: '#ef4444',   // red
};

export default function ShopStatusChart({ data }: ShopStatusChartProps) {
    const chartData = [
        { name: 'Active', value: data.active, color: COLORS.active },
        { name: 'Pending', value: data.pending, color: COLORS.pending },
        { name: 'Suspended', value: data.suspended, color: COLORS.suspended },
    ].filter(item => item.value > 0);

    const renderLabel = (entry: any) => {
        return `${entry.value}`;
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Shop Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => (
                            <span style={{ color: '#9ca3af' }}>{value} ({entry.payload.value})</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
