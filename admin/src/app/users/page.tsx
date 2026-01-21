'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getAllCustomerUsers } from '@/lib/api';

interface User {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    isVerified: boolean;
    createdAt: string;
}

function StatusBadge({ isVerified }: { isVerified: boolean }) {
    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
            {isVerified ? 'Verified' : 'Unverified'}
        </span>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const data = await getAllCustomerUsers();
            setUsers(data.users || data);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (u.email?.toLowerCase().includes(search.toLowerCase()) || false) ||
        u.phone.includes(search)
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Users</h1>
                <p className="text-sm text-gray-400 mt-1">Customer user accounts ({users.length} total)</p>
            </div>

            {/* Search */}
            <div className="flex items-center justify-between mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-96 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500"
                />
                <button onClick={loadUsers} className="px-4 py-2 bg-emerald-500 text-black text-xs font-medium rounded hover:bg-emerald-400 transition">
                    Refresh
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-[#151b23] border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0d1117]">
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Name</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Phone</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Email</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Loading users...</td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">No users found</td>
                            </tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-gray-300">{(user.name || user.phone).charAt(0)}</span>
                                        </div>
                                        <span className="text-xs text-white font-medium">{user.name || 'Unnamed'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{user.phone}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{user.email || '-'}</td>
                                <td className="px-4 py-3"><StatusBadge isVerified={user.isVerified} /></td>
                                <td className="px-4 py-3 text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
