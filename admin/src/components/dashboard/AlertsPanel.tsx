import Link from 'next/link';

interface AlertItem {
    label: string;
    count: number;
    href: string;
    type: 'warning' | 'danger' | 'info';
}

interface AlertsPanelProps {
    alerts?: AlertItem[];
}

const defaultAlerts: AlertItem[] = [
    { label: 'Pending Shop Approvals', count: 5, href: '/shops/pending', type: 'warning' },
    { label: 'Suspended Shops', count: 2, href: '/shops/suspended', type: 'danger' },
    { label: 'Unverified Leads', count: 12, href: '/leads', type: 'info' },
];

const typeStyles = {
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
};

const iconStyles = {
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-blue-500',
};

export default function AlertsPanel({ alerts = defaultAlerts }: AlertsPanelProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-base font-medium text-white mb-4">Action Required</h3>
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <Link
                        key={alert.label}
                        href={alert.href}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.01] ${typeStyles[alert.type]}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={iconStyles[alert.type]}>
                                {alert.type === 'warning' && (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                                {alert.type === 'danger' && (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {alert.type === 'info' && (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </span>
                            <span className="font-medium text-sm">{alert.label}</span>
                        </div>
                        <span className="text-lg font-semibold">{alert.count}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
