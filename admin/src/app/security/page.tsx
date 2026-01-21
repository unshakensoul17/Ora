'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getAuditLogs } from '@/lib/api';

interface AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    actorType: string;
    actorId?: string;
    createdAt: string;
}

function StatusBadge({ action }: { action: string }) {
    const colors: Record<string, string> = {
        CREATE: 'bg-emerald-500/10 text-emerald-400',
        UPDATE: 'bg-blue-500/10 text-blue-400',
        DELETE: 'bg-red-500/10 text-red-400',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${colors[action] || 'bg-gray-500/10 text-gray-400'}`}>
            {action}
        </span>
    );
}

export default function SecurityPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuditLogs();
    }, []);

    async function loadAuditLogs() {
        try {
            setLoading(true);
            const data = await getAuditLogs();
            setLogs(data.logs || data);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Security & Audit Log</h1>
                <p className="text-sm text-gray-400 mt-1">System activity and changes ({logs.length} events)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Total Events</p>
                    <p className="text-2xl font-bold text-white">{logs.length}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Creates</p>
                    <p className="text-2xl font-bold text-emerald-400">{logs.filter(l => l.action === 'CREATE').length}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Updates</p>
                    <p className="text-2xl font-bold text-blue-400">{logs.filter(l => l.action === 'UPDATE').length}</p>
                </div>
                <div className="bg-[#151b23] border border-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-1">Deletes</p>
                    <p className="text-2xl font-bold text-red-400">{logs.filter(l => l.action === 'DELETE').length}</p>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white text-sm font-medium">Recent Activity</h3>
                    <button onClick={loadAuditLogs} className="text-xs text-emerald-400 hover:text-emerald-300 transition">
                        Refresh
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0d1117]">
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Entity</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Action</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Actor</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Loading audit logs...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">No audit logs yet</td>
                            </tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-xs text-white">{log.entityType} <span className="text-gray-500 font-mono">#{log.entityId.substring(0, 8)}</span></td>
                                <td className="px-4 py-3"><StatusBadge action={log.action} /></td>
                                <td className="px-4 py-3 text-xs text-gray-400">{log.actorType} {log.actorId ? `#${log.actorId.substring(0, 8)}` : ''}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
