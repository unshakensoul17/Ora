import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { createSupportTicket } from '../../api/support-notifications';

const COLORS = {
    background: '#0B0F0D',
    card: '#101814',
    border: '#1F2A23',
    primary: '#1DB954',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
};

const SPACING = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

export default function SupportScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<'GENERAL' | 'TECHNICAL' | 'BILLING' | 'OTHER'>('GENERAL');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Missing Information', 'Please fill in both subject and message');
            return;
        }

        if (!shop?.id) {
            Alert.alert('Error', 'Shop information not found');
            return;
        }

        setSubmitting(true);
        try {
            await createSupportTicket(shop.id, {
                category,
                subject: subject.trim(),
                message: message.trim(),
            });

            Alert.alert(
                'Message Sent! ✓',
                'Our support team will get back to you within 24 hours.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );

            // Clear form
            setSubject('');
            setMessage('');
            setCategory('GENERAL');
        } catch (error: any) {
            console.error('Failed to create support ticket:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const ContactMethod = ({ icon, title, subtitle, onPress }: any) => (
        <TouchableOpacity style={styles.contactMethod} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.contactIcon}>{icon}</Text>
            <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{title}</Text>
                <Text style={styles.contactSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
        </TouchableOpacity>
    );

    const CategoryChip = ({ label, value }: { label: string; value: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'OTHER' }) => (
        <TouchableOpacity
            style={[styles.chip, category === value && styles.chipActive]}
            onPress={() => setCategory(value)}
            activeOpacity={0.7}
        >
            <Text style={[styles.chipText, category === value && styles.chipTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Contact Support</Text>
                <Text style={styles.subtitle}>We're here to help 24/7</Text>
            </View>

            {/* Quick Contact Methods */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Quick Contact</Text>
                <ContactMethod
                    icon="📧"
                    title="Email Support"
                    subtitle="support@fashcycle.com"
                    onPress={() => Linking.openURL('mailto:support@fashcycle.com')}
                />
                <ContactMethod
                    icon="📞"
                    title="Call Us"
                    subtitle="+91 9876543210"
                    onPress={() => Linking.openURL('tel:+919876543210')}
                />
                <ContactMethod
                    icon="💬"
                    title="WhatsApp"
                    subtitle="Chat with us instantly"
                    onPress={() => Linking.openURL('https://wa.me/919876543210')}
                />
            </View>

            {/* Contact Form */}
            <Text style={styles.sectionTitle}>SEND US A MESSAGE</Text>
            <View style={styles.card}>
                {/* Category */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipContainer}>
                    <CategoryChip label="General" value="GENERAL" />
                    <CategoryChip label="Technical" value="TECHNICAL" />
                    <CategoryChip label="Billing" value="BILLING" />
                    <CategoryChip label="Other" value="OTHER" />
                </View>

                {/* Subject */}
                <Text style={styles.label}>Subject</Text>
                <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Brief description of your issue"
                    placeholderTextColor={COLORS.textTertiary}
                />

                {/* Message */}
                <Text style={styles.label}>Message</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Describe your issue in detail..."
                    placeholderTextColor={COLORS.textTertiary}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? 'Sending...' : 'Send Message'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.responseTime}>
                    💡 Average response time: 2-4 hours
                </Text>
            </View>

            {/* Office Hours */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Support Hours</Text>
                <View style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>Monday - Friday</Text>
                    <Text style={styles.hoursTime}>9:00 AM - 6:00 PM</Text>
                </View>
                <View style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>Saturday</Text>
                    <Text style={styles.hoursTime}>10:00 AM - 4:00 PM</Text>
                </View>
                <View style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>Sunday</Text>
                    <Text style={styles.hoursTime}>Closed</Text>
                </View>
            </View>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    sectionTitle: {
        fontSize: 11,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: SPACING.sm,
        fontWeight: '600',
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    contactMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    contactIcon: {
        fontSize: 24,
        marginRight: SPACING.md,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    contactArrow: {
        fontSize: 24,
        color: COLORS.primary,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 8,
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    chipTextActive: {
        color: COLORS.primary,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 15,
    },
    textArea: {
        height: 120,
        paddingTop: SPACING.md,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.lg,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.textTertiary,
        opacity: 0.6,
    },
    submitButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    responseTime: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
    },
    hoursDay: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    hoursTime: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
});
