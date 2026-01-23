'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetUserPassword, sendUserEmailOTP } from '@/lib/api';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCountdown]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword') {
            let strength = 0;
            if (value.length >= 8) strength++;
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
            if (/[0-9]/.test(value)) strength++;
            if (/[^a-zA-Z0-9]/.test(value)) strength++;
            setPasswordStrength(strength);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        if (!formData.newPassword || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength < 3) {
            setError('Password is too weak. Please use a stronger password.');
            return;
        }

        try {
            setLoading(true);
            await resetUserPassword(email, otpCode, formData.newPassword);
            setSuccess(true);

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setError('');
            await sendUserEmailOTP(email);
            setResendCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } catch (err: any) {
            setError('Failed to resend code. Please try again.');
        }
    };

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-charcoal -z-10" />

            <div className="absolute top-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-heading font-bold text-white mb-2">Reset Password</h1>
                                <p className="text-gray-300 text-sm">
                                    Enter the code sent to <span className="font-medium text-accent">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* OTP Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Verification Code
                                    </label>
                                    <div className="flex gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                className="w-full h-12 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-2 text-center">
                                        {canResend ? (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="text-accent hover:text-accent-hover text-xs transition"
                                            >
                                                Resend Code
                                            </button>
                                        ) : (
                                            <p className="text-gray-400 text-xs">Resend in {resendCountdown}s</p>
                                        )}
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    {formData.newPassword && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-600'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                Strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                        placeholder="Confirm new password"
                                        required
                                    />
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
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                            <p className="text-gray-300">Redirecting to login...</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
