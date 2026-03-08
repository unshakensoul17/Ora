import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '../../store/authStore';
import { updateShopProfile } from '../../api/endpoints';
import { Ionicons } from '@expo/vector-icons';

export default function LocationPickerScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const updateShopData = useAuthStore((state) => state.setShop);

    const [latitude, setLatitude] = useState(shop?.lat?.toString() || '');
    const [longitude, setLongitude] = useState(shop?.lng?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const handleGetCurrentLocation = async () => {
        try {
            setGettingLocation(true);
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Please enable location permissions in your device settings');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setLatitude(location.coords.latitude.toString());
            setLongitude(location.coords.longitude.toString());

            Alert.alert('Success', 'Current location captured!');
        } catch (error) {
            Alert.alert('Error', 'Failed to get current location. Please try again.');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleOpenInMaps = () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude');
            return;
        }

        const url = Platform.select({
            ios: `maps://app?q=${lat},${lng}`,
            android: `geo:${lat},${lng}?q=${lat},${lng}`,
        });

        if (url) {
            Linking.canOpenURL(url).then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                    Linking.openURL(webUrl);
                }
            });
        }
    };

    const handleSaveLocation = async () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            Alert.alert('Invalid Input', 'Please enter valid latitude and longitude');
            return;
        }

        if (lat < -90 || lat > 90) {
            Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90');
            return;
        }

        if (lng < -180 || lng > 180) {
            Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180');
            return;
        }

        if (!shop?.id) return;

        Alert.alert(
            'Confirm Location',
            `Save this location as your shop address?\n\nLatitude: ${lat.toFixed(6)}\nLongitude: ${lng.toFixed(6)}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: async () => {
                        try {
                            setLoading(true);

                            const updatedShop = await updateShopProfile(shop.id, {
                                lat: lat,
                                lng: lng,
                            });

                            updateShopData(updatedShop);

                            Alert.alert('Success', 'Shop location updated successfully!', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to update location');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Ionicons name="location" size={24} color="#D4AF37" style={{ marginRight: 8 }} />
                    <Text style={styles.title}>Set Your Shop Location</Text>
                </View>
                <Text style={styles.subtitle}>
                    Add your exact GPS coordinates so customers can easily find you
                </Text>
            </View>

            {/* Current Location Button */}
            <TouchableOpacity
                style={[styles.currentLocationButton, gettingLocation && styles.buttonDisabled]}
                onPress={handleGetCurrentLocation}
                disabled={gettingLocation}
            >
                <View style={styles.buttonContent}>
                    {gettingLocation ? (
                        <>
                            <ActivityIndicator color="#022b1e" size="small" />
                            <Text style={styles.currentLocationText}>Getting location...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="location-outline" size={20} color="#022b1e" style={{ marginRight: 4 }} />
                            <Text style={styles.currentLocationText}>Use My Current Location</Text>
                        </>
                    )}
                </View>
                <Text style={styles.currentLocationHint}>Make sure you're at your shop</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
                <View style={styles.dividerLine} />
            </View>

            {/* Manual Input */}
            <View style={styles.inputSection}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Latitude</Text>
                    <TextInput
                        style={styles.input}
                        value={latitude}
                        onChangeText={setLatitude}
                        placeholder="e.g., 22.7196"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                    <Text style={styles.hint}>Range: -90 to 90</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Longitude</Text>
                    <TextInput
                        style={styles.input}
                        value={longitude}
                        onChangeText={setLongitude}
                        placeholder="e.g., 75.8577"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                    <Text style={styles.hint}>Range: -180 to 180</Text>
                </View>
            </View>

            {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
                <TouchableOpacity style={styles.verifyButton} onPress={handleOpenInMaps}>
                    <Ionicons name="map-outline" size={24} color="#fff" style={{ marginRight: 12 }} />
                    <View style={styles.verifyButtonContent}>
                        <Text style={styles.verifyButtonText}>Verify Location in Maps</Text>
                        <Text style={styles.verifyButtonHint}>Check if coordinates are correct</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
                <View style={styles.infoTitleContainer}>
                    <Ionicons name="bulb-outline" size={16} color="#D4AF37" style={{ marginRight: 6 }} />
                    <Text style={styles.infoTitle}>How to find your coordinates:</Text>
                </View>
                <Text style={styles.infoText}>
                    1. Go to Google Maps on your phone{'\n'}
                    2. Long press on your shop location{'\n'}
                    3. Coordinates will appear at the bottom{'\n'}
                    4. Copy and paste them here
                </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleSaveLocation}
                disabled={loading || !latitude || !longitude}
            >
                {loading ? (
                    <ActivityIndicator color="#022b1e" />
                ) : (
                    <View style={styles.saveButtonContent}>
                        <Ionicons name="checkmark" size={20} color="#022b1e" style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Save Shop Location</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.warningContainer}>
                <Ionicons name="warning-outline" size={14} color="#D4AF37" style={{ marginRight: 6 }} />
                <Text style={styles.warningText}>
                    This location will be shown to customers for navigation
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#D4AF37',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    currentLocationButton: {
        backgroundColor: '#D4AF37',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 4,
    },
    buttonIcon: {
        fontSize: 20,
    },
    currentLocationText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '700',
    },
    currentLocationHint: {
        color: 'rgba(2, 43, 30, 0.7)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2a2a2a',
    },
    dividerText: {
        color: '#666',
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 12,
        letterSpacing: 0.5,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    hint: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    verifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    verifyButtonIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    verifyButtonContent: {
        flex: 1,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    verifyButtonHint: {
        color: '#888',
        fontSize: 12,
    },
    arrow: {
        color: '#888',
        fontSize: 24,
    },
    infoBox: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderLeftWidth: 3,
        borderLeftColor: '#D4AF37',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    infoTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
    infoText: {
        color: '#ccc',
        fontSize: 13,
        lineHeight: 20,
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '700',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningText: {
        color: '#D4AF37',
        fontSize: 12,
        textAlign: 'center',
    },
});
