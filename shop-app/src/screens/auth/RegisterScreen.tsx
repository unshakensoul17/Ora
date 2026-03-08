import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { registerShop, verifyEmail } from '../../api/endpoints';
import { Ionicons } from '@expo/vector-icons';


export default function RegisterScreen({ navigation }: any) {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        ownerPhone: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        locality: '',
        pincode: '',
    });

    const [otp, setOtp] = useState('');
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
        setFormData({ ...formData, password: text });
        validatePassword(text);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Shop name is required');
            return false;
        }
        if (!formData.ownerName.trim()) {
            Alert.alert('Error', 'Owner name is required');
            return false;
        }
        if (!formData.ownerPhone.trim() || formData.ownerPhone.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }
        if (!passwordStrength.hasLength || !passwordStrength.hasNumber || !passwordStrength.hasSpecial) {
            Alert.alert('Error', 'Password does not meet strength requirements');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        if (!formData.address.trim()) {
            Alert.alert('Error', 'Address is required');
            return false;
        }
        if (!formData.locality.trim()) {
            Alert.alert('Error', 'Locality is required');
            return false;
        }
        if (!formData.pincode.trim() || formData.pincode.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await registerShop({
                name: formData.name,
                ownerName: formData.ownerName,
                ownerPhone: formData.ownerPhone,
                email: formData.email,
                password: formData.password,
                address: formData.address,
                locality: formData.locality,
                pincode: formData.pincode,
                lat: 22.7196, // Default Indore coordinates
                lng: 75.8577,
            });

            Alert.alert(
                'Success',
                'Registration successful! Please check your email for verification code.',
                [{ text: 'OK', onPress: () => setStep('verify') }]
            );
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(formData.email, otp);
            Alert.alert(
                'Success',
                'Email verified! Your account is pending admin approval. You can login once approved.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error('Verification error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'verify') {
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit code to{'\n'}
                        <Text style={styles.email}>{formData.email}</Text>
                    </Text>

                    <View style={styles.otpContainer}>
                        <TextInput
                            style={styles.otpInput}
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Enter 6-digit OTP"
                            placeholderTextColor="#6b7280"
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleVerifyEmail}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#022b1e" />
                        ) : (
                            <Text style={styles.buttonText}>Verify Email</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStep('register')}>
                        <Text style={styles.linkText}>← Back to Registration</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Register Your Shop</Text>
                <Text style={styles.subtitle}>Join Fashcycle and start renting</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SHOP DETAILS</Text>

                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Shop Name *"
                        placeholderTextColor="#6b7280"
                    />

                    <TextInput
                        style={styles.input}
                        value={formData.ownerName}
                        onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                        placeholder="Owner Name *"
                        placeholderTextColor="#6b7280"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTACT (CANNOT BE CHANGED)</Text>

                    <TextInput
                        style={styles.input}
                        value={formData.ownerPhone}
                        onChangeText={(text) => setFormData({ ...formData, ownerPhone: text.replace(/[^0-9]/g, '') })}
                        placeholder="Phone Number (10 digits) *"
                        placeholderTextColor="#6b7280"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning-outline" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text style={styles.warningText}>Cannot be changed later</Text>
                    </View>

                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="Email Address *"
                        placeholderTextColor="#6b7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning-outline" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text style={styles.warningText}>Cannot be changed later</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PASSWORD</Text>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            value={formData.password}
                            onChangeText={handlePasswordChange}
                            placeholder="Password *"
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

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            value={formData.confirmPassword}
                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                            placeholder="Confirm Password *"
                            placeholderTextColor="#6b7280"
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>LOCATION</Text>

                    <TextInput
                        style={styles.input}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        placeholder="Full Address *"
                        placeholderTextColor="#6b7280"
                        multiline
                    />

                    <TextInput
                        style={styles.input}
                        value={formData.locality}
                        onChangeText={(text) => setFormData({ ...formData, locality: text })}
                        placeholder="Locality (e.g., Vijay Nagar) *"
                        placeholderTextColor="#6b7280"
                    />

                    <TextInput
                        style={styles.input}
                        value={formData.pincode}
                        onChangeText={(text) => setFormData({ ...formData, pincode: text.replace(/[^0-9]/g, '') })}
                        placeholder="Pincode (6 digits) *"
                        placeholderTextColor="#6b7280"
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#022b1e" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>Already registered? Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0F0E',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#121917',
        borderWidth: 1,
        borderColor: '#1a1f1e',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#e5e7eb',
        marginBottom: 12,
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
        marginBottom: 12,
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
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -8,
        marginBottom: 12,
    },
    warningText: {
        fontSize: 12,
        color: '#f59e0b',
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
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
    otpContainer: {
        marginVertical: 24,
    },
    otpInput: {
        backgroundColor: '#121917',
        borderWidth: 1,
        borderColor: '#D4AF37',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        color: '#e5e7eb',
        textAlign: 'center',
        letterSpacing: 8,
    },
    email: {
        color: '#D4AF37',
        fontWeight: '600',
    },
});
