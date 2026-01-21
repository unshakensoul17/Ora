import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
    public client: SupabaseClient | null = null;

    onModuleInit() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.warn(
                '⚠️ Supabase credentials not configured. Storage/Auth features will be unavailable.',
            );
            return;
        }

        this.client = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        console.log('✅ Supabase client initialized');

        // ✅ KEY VALIDATION CHECK (added)
        this.client.auth
            .getUser()
            .then(() => console.log('✅ Supabase key valid'))
            .catch((err) => console.log('❌ Supabase key invalid:', err.message));
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    getClient(): SupabaseClient | null {
        return this.client;
    }

    clientOrThrow(): SupabaseClient {
        if (!this.client) {
            throw new Error(
                'Supabase is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
            );
        }
        return this.client;
    }
    async uploadFile(bucket: string, path: string, file: Buffer, contentType: string): Promise<string> {
        const client = this.clientOrThrow();

        const { data, error } = await client.storage
            .from(bucket)
            .upload(path, file, {
                contentType,
                upsert: true,
            });

        if (error) {
            throw new Error(`Storage upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = client.storage
            .from(bucket)
            .getPublicUrl(path);

        return publicUrlData.publicUrl;
    }
}
