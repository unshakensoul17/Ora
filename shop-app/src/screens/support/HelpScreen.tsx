import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const COLORS = {
    background: '#121212',
    card: '#1C1C1E',
    border: '#2C2C2E',
    primary: '#D4AF37',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
};

const SPACING = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

export default function HelpScreen({ navigation }: any) {
    const faqs = [
        {
            question: 'How do I add a new item to my inventory?',
            answer: 'Go to the Inventory tab, tap the + button at the top right, fill in the item details including photos, and save.',
        },
        {
            question: 'How does the QR code system work?',
            answer: 'When a customer makes a booking, they receive a unique QR code. Scan it using the Scanner tab to verify pickup or return.',
        },
        {
            question: 'How do I manage holds?',
            answer: 'View all pending holds from the Dashboard or Holds screen. Scan QR codes to confirm pickups and convert holds to active rentals.',
        },
        {
            question: 'What happens when a hold expires?',
            answer: 'Holds automatically expire after 24 hours if not picked up. The item becomes available for other bookings.',
        },
        {
            question: 'How do I set my shop location?',
            answer: 'Go to Profile → Business Details → Exact Location (GPS). You can use your current location or enter coordinates manually.',
        },
        {
            question: 'Can I edit item details after adding?',
            answer: 'Yes, go to Inventory, tap on any item, and you can edit all details including photos, price, and availability.',
        },
        {
            question: 'How do customers find my shop?',
            answer: 'They can view your location in the app and get directions via Google Maps or Apple Maps directly from their booking.',
        },
        {
            question: 'What is the verified walk-ins feature?',
            answer: 'Track customers who visit your shop through the app. You earn ₹50 per verified customer who makes a successful booking.',
        },
    ];

    const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
        <View style={styles.faqItem}>
            <Text style={styles.question}>Q: {question}</Text>
            <Text style={styles.answer}>A: {answer}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Help & FAQ</Text>
                <Text style={styles.subtitle}>Find answers to common questions</Text>
            </View>

            {/* Quick Links */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Quick Links</Text>
                <TouchableOpacity
                    style={styles.linkRow}
                    onPress={() => navigation.navigate('Support')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.linkIcon}>📧</Text>
                    <Text style={styles.linkText}>Contact Support</Text>
                    <Text style={styles.linkArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.linkRow}
                    onPress={() => Linking.openURL('https://ora.com/guide')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.linkIcon}>📖</Text>
                    <Text style={styles.linkText}>User Guide</Text>
                    <Text style={styles.linkArrow}>↗</Text>
                </TouchableOpacity>
            </View>

            {/* FAQs */}
            <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
            <View style={styles.card}>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
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
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    linkIcon: {
        fontSize: 20,
        marginRight: SPACING.md,
    },
    linkText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    linkArrow: {
        fontSize: 20,
        color: COLORS.primary,
    },
    faqItem: {
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    question: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
        lineHeight: 22,
    },
    answer: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});
