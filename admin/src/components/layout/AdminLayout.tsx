'use client';

import Sidebar from './Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    showFilter?: boolean;
    title?: string;
    subtitle?: string;
}

export default function AdminLayout({ children, showFilter = false, title, subtitle }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0e14]">
            <Sidebar />

            {/* Top Bar */}
            <header className="fixed top-0 left-56 right-0 h-14 bg-[#0d1117] border-b border-gray-800 flex items-center justify-between px-6 z-30">
                <div className="flex flex-col justify-center">
                    <span className="text-white text-sm font-medium">{title || 'Fashcycle Admin - Control Tower'}</span>
                    {subtitle && <span className="text-gray-500 text-xs">{subtitle}</span>}
                </div>
                <div className="flex items-center gap-4">
                    {/* System Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">System Status:</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">HEALTHY</span>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-48 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    {/* Admin Profile */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-black">A</span>
                        </div>
                        <span className="text-xs text-gray-300">Admin Profile</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="ml-56 pt-14 min-h-screen">
                <div className={`p-6 ${showFilter ? 'mr-64' : ''}`}>
                    {children}
                </div>
            </main>

            {/* Right Filter Panel - optional */}
            {showFilter && (
                <aside className="fixed right-0 top-14 w-64 h-[calc(100vh-56px)] bg-[#0d1117] border-l border-gray-800 p-4">
                    <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </h3>

                    {/* Region Filter */}
                    <div className="mb-6">
                        <h4 className="text-xs text-gray-400 mb-3">Region</h4>
                        <div className="space-y-2">
                            {['North', 'South', 'East', 'West', 'Central'].map((region) => (
                                <label key={region} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded bg-gray-800 border-gray-600" />
                                    <span className="text-xs text-gray-300">{region}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Performance Filter */}
                    <div>
                        <h4 className="text-xs text-gray-400 mb-3">Performance</h4>
                        <div className="space-y-2">
                            {['All Rate', 'High Performers', 'Low Performers'].map((perf) => (
                                <label key={perf} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="performance" className="w-3.5 h-3.5 bg-gray-800 border-gray-600" />
                                    <span className="text-xs text-gray-300">{perf}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
