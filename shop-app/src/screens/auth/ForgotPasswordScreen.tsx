import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { forgotPassword, resetPassword } from '../../api/endpoints';
import { Ionicons } from '@expo/vector-icons';


export default function ForgotPasswordScreen({ navigation }: any) {
    const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState({
        hasLength: false,
        hasNumber: false,
        hasSpecial: false,
    });

    const validatePassword = (password: string) => {
        setPasswordStrength({
            hasLength: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const handlePasswordChange = (text: string) => {
        setNewPassword(text);
        validatePassword(text);
    };

    const handleSendOTP = async () => {
        if (phone.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const result = await forgotPassword(phone);
            setMaskedEmail(result.maskedEmail);
            // Extract actual email from masked email for API call
            setEmail(result.maskedEmail); // We'll need the full email from user
            setStep('otp');
            Alert.alert('OTP Sent', `Verification code sent to ${result.maskedEmail}`);
        } catch (error: any) {
            console.error('Forgot password error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Phone number not found');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }
        setStep('password');
    };

    const handleResetPassword = async () => {
        if (!passwordStrength.hasLength || !passwordStrength.hasNumber || !passwordStrength.hasSpecial) {
            Alert.alert('Error', 'Password does not meet strength requirements');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // We need to prompt for full email since we only have masked version
            Alert.prompt(
                'Confirm Email',
                `Please enter your full email address (${maskedEmail})`,
                async (fullEmail) => {
                    try {
                        await resetPassword(fullEmail, otp, newPassword);
                        Alert.alert(
                            'Success',
                            'Password reset successfully! You can now login with your new password.',
                            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                        );
                    } catch (error: any) {
                        console.error('Reset password error:', error);
                        Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
                    } finally {
                        setLoading(false);
                    }
                },
                'plain-text',
                '',
                'email-address'
            );
        } catch (error) {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                {step === 'phone' && (
                    <>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Enter your phone number and we'll send a verification code to your registered email
                        </Text>

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

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#022b1e" />
                                ) : (
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>← Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        <Text style={styles.title}>Enter OTP</Text>
                        <Text style={styles.subtitle}>
                            We've sent a 6-digit code to{'\n'}
                            <Text style={styles.email}>{maskedEmail}</Text>
                        </Text>

                        <View style={styles.form}>
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
                                onPress={handleVerifyOTP}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setStep('phone')}>
                                <Text style={styles.linkText}>← Change Phone Number</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {step === 'password' && (
                    <>
                        <Text style={styles.title}>Set New Password</Text>
                        <Text style={styles.subtitle}>
                            Choose a strong password for your account
                        </Text>

                        <View style={styles.form}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={newPassword}
                                    onChangeText={handlePasswordChange}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#6b7280"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.strengthIndicator}>
                                <View style={styles.strengthRow}>
                                    <Ionicons name={passwordStrength.hasLength ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordStrength.hasLength ? '#4ade80' : '#6b7280'} />
                                    <Text style={[styles.strengthItem, passwordStrength.hasLength && styles.strengthMet]}>8+ characters</Text>
                                </View>
                                <View style={styles.strengthRow}>
                                    <Ionicons name={passwordStrength.hasNumber ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordStrength.hasNumber ? '#4ade80' : '#6b7280'} />
                                    <Text style={[styles.strengthItem, passwordStrength.hasNumber && styles.strengthMet]}>1 number</Text>
                                </View>
                                <View style={styles.strengthRow}>
                                    <Ionicons name={passwordStrength.hasSpecial ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordStrength.hasSpecial ? '#4ade80' : '#6b7280'} />
                                    <Text style={[styles.strengthItem, passwordStrength.hasSpecial && styles.strengthMet]}>1 special char</Text>
                                </View>
                            </View>

                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#6b7280"
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleResetPassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#022b1e" />
                                ) : (
                                    <Text style={styles.buttonText}>Reset Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 32,
        lineHeight: 20,
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
        marginBottom: 24,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121917',
        borderWidth: 1,
        borderColor: '#1a1f1e',
        borderRadius: 12,
        marginBottom: 12,
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
    strengthIndicator: {
        marginBottom: 24,
        gap: 4,
    },
    strengthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    strengthItem: {
        fontSize: 12,
        color: '#6b7280',
    },
    strengthMet: {
        color: '#4ade80',
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
    linkText: {
        color: '#D4AF37',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    email: {
        color: '#D4AF37',
        fontWeight: '600',
    },
});
