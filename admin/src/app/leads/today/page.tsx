'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';

const todayLeads = [
    { id: '1', customerName: 'Priya Sharma', shop: 'Bridal Elegance', product: 'Red Lehenga', amount: 4500, time: '10:30 AM', status: 'verified' },
    { id: '2', customerName: 'Neha Gupta', shop: 'Fashion Hub', product: 'Designer Saree', amount: 3200, time: '09:15 AM', status: 'pending' },
    { id: '3', customerName: 'Kavya Patel', shop: 'Style Studio', product: 'Party Gown', amount: 2800, time: '08:45 AM', status: 'verified' },
];

export default function TodayLeadsPage() {
    return (
        <AdminLayout title="Today's Leads" subtitle="Leads generated today">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Customer</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Shop</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Product</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Time</th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {todayLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-zinc-800/50">
                                <td className="px-6 py-4 text-sm font-medium text-white">{lead.customerName}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{lead.shop}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{lead.product}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">₹{lead.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{lead.time}</td>
                                <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
