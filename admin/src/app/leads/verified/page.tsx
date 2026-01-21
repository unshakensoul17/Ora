'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';

const verifiedLeads = [
    { id: '1', customerName: 'Priya Sharma', shop: 'Bridal Elegance', product: 'Red Lehenga', amount: 4500, date: 'Jan 9, 2026' },
    { id: '2', customerName: 'Rahul Singh', shop: 'Style Studio', product: 'Sherwani Set', amount: 5500, date: 'Jan 8, 2026' },
    { id: '3', customerName: 'Meera Joshi', shop: 'Fashion Hub', product: 'Designer Saree', amount: 3800, date: 'Jan 7, 2026' },
];

export default function VerifiedLeadsPage() {
    return (
        <AdminLayout title="Verified Leads" subtitle="Confirmed customer conversions">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Customer</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Shop</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Product</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Date</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {verifiedLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-zinc-800/50">
                                <td className="px-6 py-4 text-sm font-medium text-white">{lead.customerName}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{lead.shop}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{lead.product}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">₹{lead.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{lead.date}</td>
                                <td className="px-6 py-4"><StatusBadge status="verified" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
