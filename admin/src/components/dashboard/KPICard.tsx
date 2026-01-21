'use client';

// Simple sparkline chart component
interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
}

export function Sparkline({ data, color = '#10b981', height = 24 }: SparklineProps) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = ((max - value) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="80" height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
            />
        </svg>
    );
}

interface KPICardProps {
    label: string;
    value: string;
    sparkData?: number[];
    sparkColor?: string;
}

export default function KPICard({ label, value, sparkData, sparkColor = '#10b981' }: KPICardProps) {
    const defaultData = [20, 45, 35, 60, 50, 75, 65, 80, 70, 90];

    return (
        <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
            </div>
            <Sparkline data={sparkData || defaultData} color={sparkColor} />
        </div>
    );
}
