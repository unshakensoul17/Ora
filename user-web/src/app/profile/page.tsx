'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, updateProfile, logout } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?returnTo=/profile');
        }
    }, [user, authLoading, router]);

    // Load user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                city: user.city || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            setLoading(true);
            await updateProfile(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-charcoal">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-charcoal py-12 px-4 pb-safe pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-accent hover:text-accent-hover text-sm transition inline-block mb-4">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-white">My Profile</h1>
                    <p className="text-gray-400 mt-2">Manage your account settings and personal information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-primary-dark border border-gray-800 rounded-xl p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl font-bold text-accent">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                                <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                                {user.emailVerified && (
                                    <span className="mt-3 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                        ✓ Verified
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <button
                                    onClick={logout}
                                    className="w-full py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-primary-dark border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                        placeholder="Your full name"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-2 bg-charcoal/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                        placeholder="Indore"
                                    />
                                </div>

                                {/* Success Message */}
                                {success && (
                                    <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                                        ✓ Profile updated successfully!
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 bg-gradient-to-r from-accent to-accent-hover text-primary font-semibold rounded-lg shadow-lg hover:shadow-accent/50 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Account Stats */}
                        <div className="bg-primary-dark border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Account Activity</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-charcoal rounded-lg">
                                    <p className="text-2xl font-bold text-accent">0</p>
                                    <p className="text-xs text-gray-400 mt-1">Total Bookings</p>
                                </div>
                                <div className="text-center p-4 bg-charcoal rounded-lg">
                                    <p className="text-2xl font-bold text-accent">0</p>
                                    <p className="text-xs text-gray-400 mt-1">Active Holds</p>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <Link
                                    href="/my-holds"
                                    className="block text-center py-2 text-accent hover:bg-accent/10 rounded-lg transition text-sm font-medium"
                                >
                                    View My Holds →
                                </Link>
                                <Link
                                    href="/my-orders"
                                    className="block text-center py-2 text-accent hover:bg-accent/10 rounded-lg transition text-sm font-medium"
                                >
                                    View My Orders →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
