import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import {
    getInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    toggleInventoryStatus,
    uploadInventoryImage,
} from '../../api/endpoints';
import { InventoryItem } from '../../api/types';

export default function EditItemScreen({ route, navigation }: any) {
    const { itemId } = route.params;
    const shop = useAuthStore((state) => state.shop);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [item, setItem] = useState<InventoryItem | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('LEHENGA');
    const [size, setSize] = useState('');
    const [rentalPrice, setRentalPrice] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadItem();
    }, [itemId]);

    const loadItem = async () => {
        try {
            setLoading(true);
            const data = await getInventoryItem(itemId);
            setItem(data);

            // Pre-populate form
            setName(data.name || '');
            setDescription(data.description || '');
            setCategory(data.category || 'LEHENGA');
            setSize(data.size || '');
            setRentalPrice(((data.rentalPrice || 0) / 100).toString());
            setSecurityDeposit(((data.securityDeposit || 0) / 100).toString());
            setImages(data.images || []);
            setIsActive(data.status === 'ACTIVE');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load item');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled && shop?.id) {
            try {
                const uploadedImage = await uploadInventoryImage(shop.id, result.assets[0].uri);
                setImages([...images, uploadedImage.path]);
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to upload image');
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter item name');
            return;
        }

        if (images.length === 0) {
            Alert.alert('Error', 'Please add at least one image');
            return;
        }

        setSaving(true);
        try {
            const data = {
                name: name.trim(),
                description: description.trim(),
                category,
                size,
                rentalPrice: Math.round(parseFloat(rentalPrice || '0') * 100),
                securityDeposit: Math.round(parseFloat(securityDeposit || '0') * 100),
                images,
                status: isActive ? 'ACTIVE' : 'INACTIVE',
            };

            await updateInventoryItem(itemId, data);
            Alert.alert('Success', 'Item updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update item');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleInventoryStatus(itemId);
            setIsActive(!isActive);
            Alert.alert('Success', `Item ${!isActive ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to toggle status');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteInventoryItem(itemId);
                            Alert.alert('Success', 'Item deleted', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete item');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Status Toggle */}
            <View style={styles.statusCard}>
                <View>
                    <Text style={styles.statusLabel}>Item Status</Text>
                    <Text style={styles.statusSubtext}>
                        {isActive ? 'Available for rent' : 'Hidden from marketplace'}
                    </Text>
                </View>
                <Switch
                    value={isActive}
                    onValueChange={handleToggleStatus}
                    trackColor={{ false: '#2a2a2a', true: '#D4AF37' }}
                    thumbColor={isActive ? '#fff' : '#888'}
                />
            </View>

            {/* Images */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    {images.map((img, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image
                                source={{ uri: img.startsWith('http') ? img : `https://zkmkapeuqbyvjxdkiljx.supabase.co/storage/v1/object/public/inventory-images/${img}` }}
                                style={styles.image}
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => handleRemoveImage(index)}
                            >
                                <Text style={styles.removeImageText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
                        <Text style={styles.addImageText}>+</Text>
                        <Text style={styles.addImageLabel}>Add Photo</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <Text style={styles.label}>Item Name *</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Red Bridal Lehenga"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the item..."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Size *</Text>
                <TextInput
                    style={styles.input}
                    value={size}
                    onChangeText={setSize}
                    placeholder="e.g., M, L, XL"
                    placeholderTextColor="#666"
                />
            </View>

            {/* Pricing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing</Text>

                <Text style={styles.label}>Rental Price (₹) *</Text>
                <TextInput
                    style={styles.input}
                    value={rentalPrice}
                    onChangeText={setRentalPrice}
                    placeholder="2000"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Security Deposit (₹) *</Text>
                <TextInput
                    style={styles.input}
                    value={securityDeposit}
                    onChangeText={setSecurityDeposit}
                    placeholder="5000"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                />
            </View>

            {/* Actions */}
            <TouchableOpacity
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#022b1e" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>🗑️ Delete Item</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    statusCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    statusLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusSubtext: {
        color: '#888',
        fontSize: 13,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    imageScroll: {
        marginBottom: 8,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 12,
    },
    image: {
        width: 120,
        height: 160,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    addImageButton: {
        width: 120,
        height: 160,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2a2a2a',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageText: {
        color: '#D4AF37',
        fontSize: 32,
        marginBottom: 4,
    },
    addImageLabel: {
        color: '#888',
        fontSize: 12,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
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
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
});
