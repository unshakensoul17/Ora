'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifiedMessage, setVerifiedMessage] = useState(false);

    // Show verification success message
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setVerifiedMessage(true);
            setTimeout(() => setVerifiedMessage(false), 5000);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            await login(formData.email, formData.password);

            // Redirect to return URL or home
            const returnTo = searchParams.get('returnTo') || '/';
            router.push(returnTo);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-charcoal -z-10" />

            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

            {/* Login Card */}
            <div className="w-full max-w-md">
                <div className="glass-panel rounded-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-300 text-sm">Log in to reserve and manage your outfits</p>
                    </div>

                    {/* Verification Success Message */}
                    {verifiedMessage && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm text-center">
                            ✓ Email verified successfully! You can now log in.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-gray-400"
                                placeholder="you@example.com"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-accent hover:text-accent-hover transition"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-gray-400"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="w-4 h-4 text-accent bg-white/10 border-white/20 rounded focus:ring-accent focus:ring-2"
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-primary font-semibold rounded-lg shadow-lg hover:shadow-accent/50 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-gray-400">or</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-gray-300 text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-accent hover:text-accent-hover font-medium transition">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-4 text-center">
                    <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
