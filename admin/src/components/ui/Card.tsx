interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
    return (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
}

// Sub-components for card structure
Card.Header = function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`text-base font-medium text-white ${className}`}>{children}</h3>;
};

Card.Subtitle = function CardSubtitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`text-sm text-zinc-500 mt-1 ${className}`}>{children}</p>;
};

Card.Body = function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
};
