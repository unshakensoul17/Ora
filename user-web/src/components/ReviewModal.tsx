import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { FaStar, FaCamera, FaTimes } from 'react-icons/fa';
import { createReview, apiClient } from '@/lib/api';

interface ReviewModalProps {
    bookingId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReviewModal({ bookingId, isOpen, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Limit to 3 images
        if (images.length + files.length > 3) {
            setError('You can only upload up to 3 images');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                // Using generic upload endpoint handled via proxy or direct backend route
                // If using 'apiClient' which is axios instance:
                const response = await apiClient.post('/reviews/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedUrls.push(response.data.url);
            }
            setImages(prev => [...prev, ...uploadedUrls]);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        try {
            setLoading(true);
            await createReview({
                bookingId,
                rating,
                comment,
                images,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-heading font-bold text-white mb-2 text-center">
                    Rate Your Experience
                </h2>
                <p className="text-gray-300 text-center mb-6 text-sm">
                    How was your rental? Upload a photo to inspire others!
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        className="hidden"
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <FaStar
                                        className="transition-all duration-200"
                                        size={40}
                                        color={ratingValue <= (hover || rating) ? "#D4AF37" : "#4b5563"}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-3">
                            {images.map((url, index) => (
                                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20 group">
                                    <img src={url} alt="Review" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))}

                            {images.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-20 h-20 rounded-lg border border-dashed border-white/30 flex flex-col items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaCamera size={20} className="mb-1" />
                                            <span className="text-[10px]">Add Photo</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Comment Area */}
                    <div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about the fit, quality, and service..."
                            className="w-full h-32 p-4 glass-input rounded-xl text-white placeholder-gray-500 resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full py-4 bg-gradient-to-r from-accent to-accent-hover text-primary font-bold rounded-xl shadow-lg hover:shadow-accent/50 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
