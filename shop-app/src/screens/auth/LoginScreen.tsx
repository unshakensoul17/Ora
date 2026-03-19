import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { loginWithPassword, loginWithEmailOTP, sendEmailOTP } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
    const [loginMethod, setLoginMethod] = useState<'password' | 'email'>('password');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const login = useAuthStore((state) => state.login);

    const handlePasswordLogin = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        setLoading(true);
        try {
            const result = await loginWithPassword(phone, password);
            await login(result.shop, result.token!);
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Invalid phone or password');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOTP = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await sendEmailOTP(email);
            setStep('otp');
            Alert.alert('OTP Sent', 'Please check your email for the verification code');
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailOTPLogin = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const result = await loginWithEmailOTP(email, otp);
            await login(result.shop, result.token!);
        } catch (error: any) {
            console.error('OTP Login error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const switchToEmailLogin = () => {
        setLoginMethod('email');
        setStep('input');
        setPhone('');
        setPassword('');
    };

    const switchToPasswordLogin = () => {
        setLoginMethod('password');
        setStep('input');
        setEmail('');
        setOtp('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="storefront-outline" size={64} color="#D4AF37" style={{ marginBottom: 16 }} />
                    <Text style={styles.title}>ORA SHOP</Text>
                    <Text style={styles.subtitle}>Login to manage your inventory</Text>
                </View>

                {loginMethod === 'password' ? (
                    <>
                        {/* Password Login Form */}
                        <View style={styles.form}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                placeholder="Enter 10-digit phone number"
                                placeholderTextColor="#6b7280"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#6b7280"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handlePasswordLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#022b1e" />
                                ) : (
                                    <Text style={styles.buttonText}>Login</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={switchToEmailLogin}
                            >
                                <Text style={styles.secondaryButtonText}>Login with Email OTP</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        {/* Email OTP Login Form */}
                        {step === 'input' ? (
                            <View style={styles.form}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleSendEmailOTP}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#022b1e" />
                                    ) : (
                                        <Text style={styles.buttonText}>Send OTP</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={switchToPasswordLogin}
                                >
                                    <Text style={styles.secondaryButtonText}>← Back to Password Login</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <Text style={styles.otpTitle}>Enter OTP</Text>
                                <Text style={styles.otpSubtitle}>
                                    Code sent to {email}
                                </Text>

                                <TextInput
                                    style={styles.otpInput}
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholder="000000"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleEmailOTPLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#022b1e" />
                                    ) : (
                                        <Text style={styles.buttonText}>Verify & Login</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStep('input')}>
                                    <Text style={styles.linkText}>← Change Email</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Register Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0F0E',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    form: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#121917',
        borderWidth: 1,
        borderColor: '#1a1f1e',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#e5e7eb',
        marginBottom: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121917',
        borderWidth: 1,
        borderColor: '#1a1f1e',
        borderRadius: 12,
        marginBottom: 8,
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        fontSize: 15,
        color: '#e5e7eb',
    },
    eyeIcon: {
        padding: 14,
    },
    forgotPassword: {
        color: '#D4AF37',
        fontSize: 14,
        textAlign: 'right',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#D4AF37',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1a1f1e',
    },
    dividerText: {
        color: '#6b7280',
        paddingHorizontal: 16,
        fontSize: 12,
    },
    otpTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 8,
        textAlign: 'center',
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 24,
        textAlign: 'center',
    },
    otpInput: {
        backgroundColor: '#121917',
        borderWidth: 2,
        borderColor: '#D4AF37',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        color: '#e5e7eb',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: 24,
    },
    linkText: {
        color: '#D4AF37',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    footer: {
        alignItems: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 8,
    },
    registerLink: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '600',
    },
});
