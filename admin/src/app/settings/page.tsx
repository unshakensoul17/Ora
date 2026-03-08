'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AdminLayout title="Settings" subtitle="Configure your admin dashboard">
            <div className="max-w-2xl space-y-6">
                {/* General Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-base font-medium text-white mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Platform Name</label>
                            <input
                                type="text"
                                defaultValue="Fashcycle"
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Support Email</label>
                            <input
                                type="email"
                                defaultValue="support@ora.com"
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Billing Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-base font-medium text-white mb-4">Billing Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Lead Price (₹)</label>
                            <input
                                type="number"
                                defaultValue="100"
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Billing Cycle</label>
                            <select className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-600">
                                <option>Monthly</option>
                                <option>Weekly</option>
                                <option>Daily</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-base font-medium text-white mb-4">Notifications</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-zinc-800 border-zinc-700" />
                            <span className="text-sm text-zinc-300">Email on new shop registration</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-zinc-800 border-zinc-700" />
                            <span className="text-sm text-zinc-300">Daily revenue summary</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded bg-zinc-800 border-zinc-700" />
                            <span className="text-sm text-zinc-300">Weekly analytics report</span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <Button variant="primary" size="lg" onClick={handleSave}>
                        Save Changes
                    </Button>
                    {saved && <span className="text-sm text-emerald-400">Settings saved!</span>}
                </div>
            </div>
        </AdminLayout>
    );
}
