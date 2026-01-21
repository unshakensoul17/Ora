import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

export enum StorageBucket {
    INVENTORY_IMAGES = 'inventory-images',
    SHOP_PHOTOS = 'shop-photos',
    DAMAGE_PHOTOS = 'damage-photos',
    USER_AVATARS = 'user-avatars',
    REVIEW_IMAGES = 'review-images',
}

export interface UploadResult {
    url: string;
    path: string;
    bucket: string;
}

@Injectable()
export class UploadsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Upload a file to Supabase Storage
     */
    async uploadFile(
        file: Buffer,
        originalName: string,
        mimeType: string,
        bucket: StorageBucket,
        folder?: string,
    ): Promise<UploadResult> {
        const client = this.supabase.getClient();

        if (!client) {
            throw new BadRequestException('Storage service not configured');
        }

        const fileExt = originalName.split('.').pop() || 'jpg';
        const fileName = folder
            ? `${folder}/${uuidv4()}.${fileExt}`
            : `${uuidv4()}.${fileExt}`;

        const { data, error } = await client.storage
            .from(bucket)
            .upload(fileName, file, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            throw new BadRequestException(`Upload failed: ${error.message}`);
        }

        // Get public URL for public buckets
        const { data: urlData } = client.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            url: urlData.publicUrl,
            path: data.path,
            bucket,
        };
    }

    /**
     * Upload multiple files
     */
    async uploadMultiple(
        files: Array<{ buffer: Buffer; originalName: string; mimeType: string }>,
        bucket: StorageBucket,
        folder?: string,
    ): Promise<UploadResult[]> {
        return Promise.all(
            files.map((file) =>
                this.uploadFile(file.buffer, file.originalName, file.mimeType, bucket, folder),
            ),
        );
    }

    /**
     * Generate a signed URL for private files (e.g., damage photos)
     */
    async getSignedUrl(
        bucket: StorageBucket,
        path: string,
        expiresInSeconds = 3600,
    ): Promise<string> {
        const client = this.supabase.getClient();

        if (!client) {
            throw new BadRequestException('Storage service not configured');
        }

        const { data, error } = await client.storage
            .from(bucket)
            .createSignedUrl(path, expiresInSeconds);

        if (error) {
            throw new BadRequestException(`Failed to generate signed URL: ${error.message}`);
        }

        return data.signedUrl;
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
        const client = this.supabase.getClient();

        if (!client) {
            throw new BadRequestException('Storage service not configured');
        }

        const { error } = await client.storage.from(bucket).remove([path]);

        if (error) {
            console.error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Delete multiple files
     */
    async deleteMultiple(bucket: StorageBucket, paths: string[]): Promise<void> {
        const client = this.supabase.getClient();

        if (!client) return;

        await client.storage.from(bucket).remove(paths);
    }
}
