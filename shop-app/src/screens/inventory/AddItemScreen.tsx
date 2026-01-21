import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { createInventoryItem, uploadInventoryImage } from '../../api/endpoints';
import { Category } from '../../api/types';

const categories: Category[] = ['LEHENGA', 'SHERWANI', 'SAREE', 'ANARKALI', 'INDO_WESTERN', 'GOWN'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free'];

export default function AddItemScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [name, setName] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [size, setSize] = useState('');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.8,
            aspect: [3, 4],
        });

        if (!result.canceled && result.assets[0]) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your camera.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            aspect: [3, 4],
        });

        if (!result.canceled && result.assets[0]) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleAddImage = () => {
        Alert.alert(
            'Add Image',
            'Choose an option',
            [
                { text: 'Camera', onPress: takePhoto },
                { text: 'Gallery', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleSave = async () => {
        if (!shop?.id) {
            Alert.alert('Error', 'Shop not found');
            return;
        }

        if (!name || !category || !size || !price) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            // Upload images to Supabase Storage first
            const uploadedImagePaths: string[] = [];
            for (const imageUri of images) {
                try {
                    const result = await uploadInventoryImage(shop.id, imageUri);
                    // Store path instead of full URL - frontend will construct URL
                    uploadedImagePaths.push(result.path);
                    console.log('✅ Image uploaded:', result.path);
                } catch (uploadError) {
                    console.warn('Failed to upload image:', uploadError);
                    // Continue with other images even if one fails
                }
            }

            console.log('📸 Total images uploaded:', uploadedImagePaths.length);

            await createInventoryItem(shop.id, {
                name,
                category: category as Category,
                size,
                description: description || undefined,
                rentalPrice: parseInt(price) * 100,
                securityDeposit: parseInt(deposit || '0') * 100,
                images: uploadedImagePaths,
            });
            Alert.alert('Success', 'Item added successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
                {/* Images */}
                <View style={styles.field}>
                    <Text style={styles.label}>Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageBtn}
                                    onPress={() => removeImage(index)}
                                >
                                    <Text style={styles.removeImageText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                            <Text style={styles.addImageIcon}>📷</Text>
                            <Text style={styles.addImageText}>Add Photo</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Item Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Royal Red Bridal Lehenga"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Category */}
                <View style={styles.field}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.chips}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, category === cat && styles.chipActive]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                                    {cat.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Size */}
                <View style={styles.field}>
                    <Text style={styles.label}>Size *</Text>
                    <View style={styles.chips}>
                        {sizes.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.chip, size === s && styles.chipActive]}
                                onPress={() => setSize(s)}
                            >
                                <Text style={[styles.chipText, size === s && styles.chipTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Price */}
                <View style={styles.row}>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.label}>Rental Price (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="3500"
                            placeholderTextColor="#666"
                            keyboardType="number-pad"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.label}>Deposit (₹)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="10000"
                            placeholderTextColor="#666"
                            keyboardType="number-pad"
                            value={deposit}
                            onChangeText={setDeposit}
                        />
                    </View>
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Add details about the item..."
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#022b1e" />
                    ) : (
                        <Text style={styles.saveButtonText}>Add Item</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    form: {
        padding: 16,
    },
    field: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 12,
        color: '#D4AF37',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    chipActive: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
    },
    chipText: {
        color: '#888',
        fontSize: 12,
    },
    chipTextActive: {
        color: '#022b1e',
        fontWeight: '600',
    },
    imageScroll: {
        flexDirection: 'row',
    },
    imageContainer: {
        marginRight: 12,
        position: 'relative',
    },
    imagePreview: {
        width: 100,
        height: 133,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addImageBtn: {
        width: 100,
        height: 133,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    addImageText: {
        color: '#888',
        fontSize: 11,
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '600',
    },
});
