type StatusType = 'active' | 'pending' | 'suspended' | 'verified' | 'hold' | 'completed' | 'cancelled';

interface StatusBadgeProps {
    status: StatusType | string;
    size?: 'sm' | 'md';
}

const statusStyles: Record<StatusType, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    verified: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase() as StatusType;
    const style = statusStyles[normalizedStatus] || statusStyles.pending;

    return (
        <span className={`inline-flex items-center font-medium rounded-full border ${style} ${sizeStyles[size]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
    );
}
