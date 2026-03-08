import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.title}>⚠️ Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            The app encountered an error and couldn't continue.
                        </Text>

                        <ScrollView style={styles.errorContainer}>
                            <Text style={styles.errorTitle}>Error Details:</Text>
                            <Text style={styles.errorText}>
                                {this.state.error?.toString()}
                            </Text>
                            {this.state.errorInfo && (
                                <>
                                    <Text style={styles.errorTitle}>Stack Trace:</Text>
                                    <Text style={styles.errorText}>
                                        {this.state.errorInfo.componentStack}
                                    </Text>
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorContainer: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        maxHeight: 400,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 8,
        marginTop: 12,
    },
    errorText: {
        fontSize: 12,
        color: '#D1D5DB',
        fontFamily: 'monospace',
        lineHeight: 18,
    },
    button: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
