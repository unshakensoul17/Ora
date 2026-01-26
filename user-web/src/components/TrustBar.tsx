import { ShieldCheck, Sparkles, MapPin, RefreshCw } from '@/components/ui/Icons';

const trustItems = [
    {
        icon: ShieldCheck,
        text: '100% Hygiene Certified',
        subtext: 'Hospital-grade sanitization'
    },
    {
        icon: Sparkles,
        text: 'Dry Cleaned After Every Use',
        subtext: 'Premium care guaranteed'
    },
    {
        icon: MapPin,
        text: 'Walk-in Boutiques in Indore',
        subtext: 'Try before you rent'
    },
    {
        icon: RefreshCw,
        text: 'No Stress Return Policy',
        subtext: 'Easy returns, no questions'
    },
];

export function TrustBar() {
    return (
        <section className="bg-white/60 backdrop-blur-sm py-4 border-y border-accent-muted/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {trustItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 justify-center md:justify-start"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                                    <IconComponent size={20} className="text-accent" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-neutral-900 text-sm font-semibold leading-tight">
                                        {item.text}
                                    </p>
                                    <p className="text-neutral-600 text-xs mt-0.5">
                                        {item.subtext}
                                    </p>
                                </div>
                                <span className="sm:hidden text-neutral-900 text-xs font-semibold">
                                    {item.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

