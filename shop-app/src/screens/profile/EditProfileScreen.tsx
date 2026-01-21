import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { updateShopProfile } from '../../api/endpoints';

export default function EditProfileScreen({ navigation }: any) {
    const { shop, setShop } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: shop?.name || '',
        ownerName: shop?.ownerName || '',
        email: shop?.email || '',
        phone: shop?.phone || '',
        locality: shop?.locality || '',
        address: shop?.address || '',
        description: shop?.description || '',
    });

    const handleSave = async () => {
        if (!shop?.id) return;

        // Validation
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Shop name is required');
            return;
        }
        if (!formData.ownerName.trim()) {
            Alert.alert('Error', 'Owner name is required');
            return;
        }
        if (!formData.locality.trim()) {
            Alert.alert('Error', 'Locality is required');
            return;
        }
        if (!formData.address.trim()) {
            Alert.alert('Error', 'Address is required');
            return;
        }

        setLoading(true);
        try {
            const updatedShop = await updateShopProfile(shop.id, {
                name: formData.name,
                ownerName: formData.ownerName,
                email: formData.email || undefined,
                locality: formData.locality,
                address: formData.address,
                description: formData.description || undefined,
            });

            // Update local state
            setShop(updatedShop);

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Shop Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Enter shop name"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Owner Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.ownerName}
                            onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                            placeholder="Enter owner name"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Enter email address"
                            placeholderTextColor="#6b7280"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={formData.phone}
                            editable={false}
                            placeholderTextColor="#6b7280"
                        />
                        <Text style={styles.helperText}>Phone number cannot be changed</Text>
                    </View>

                    <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>LOCATION</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Locality *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.locality}
                            onChangeText={(text) => setFormData({ ...formData, locality: text })}
                            placeholder="e.g., Vijay Nagar, Sapna Sangeeta"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Address *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="Enter complete address"
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>ADDITIONAL INFO</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Tell customers about your shop..."
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#022b1e" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0F0E',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 11,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        fontWeight: '600',
    },
    sectionTitleSpaced: {
        marginTop: 24,
    },
    inputGroup: {
        marginBottom: 20,
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
    },
    inputDisabled: {
        backgroundColor: '#0d1210',
        color: '#6b7280',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 6,
        fontStyle: 'italic',
    },
    saveButton: {
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
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#9ca3af',
        fontSize: 15,
        fontWeight: '600',
    },
});
