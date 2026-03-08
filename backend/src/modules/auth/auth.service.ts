import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { hashPassword, comparePassword, validatePassword, maskEmail } from '../../common/utils/password.util';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private redis: RedisService,
        private supabase: SupabaseService,
    ) { }

    /**
     * Generate OTP and store in Redis
     */
    async sendOTP(phone: string, type: 'user' | 'shop') {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const key = `otp:${type}:${phone}`;

        // Store OTP with 5-minute TTL
        await this.redis.set(key, otp, 300);

        // In production, integrate with SMS gateway
        console.log(`[DEV] OTP for ${phone}: ${otp}`);

        return { success: true, message: 'OTP sent successfully' };
    }

    /**
     * Verify OTP and create/login user
     */
    async verifyUserOTP(phone: string, otp: string) {
        const key = `otp:user:${phone}`;
        const storedOTP = await this.redis.get(key);

        if (!storedOTP || String(storedOTP) !== String(otp)) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // Delete used OTP
        await this.redis.del(key);

        // Find or create user
        let user = await this.prisma.user.findUnique({ where: { phone } });

        if (!user) {
            user = await this.prisma.user.create({
                data: { phone, isVerified: true },
            });
        } else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true },
            });
        }

        // Generate JWT
        const token = this.jwtService.sign({
            sub: user.id,
            phone: user.phone,
            type: 'user',
        });

        return {
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
            },
        };
    }

    /**
     * Verify OTP and login shop owner
     */
    async verifyShopOTP(phone: string, otp: string) {
        const key = `otp:shop:${phone}`;
        const storedOTP = await this.redis.get(key);

        if (!storedOTP || String(storedOTP) !== String(otp)) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        await this.redis.del(key);

        // Find shop
        const shop = await this.prisma.shop.findUnique({
            where: { ownerPhone: phone },
        });

        if (!shop) {
            throw new UnauthorizedException('Shop not found. Please register first.');
        }

        if (shop.status === 'SUSPENDED') {
            throw new UnauthorizedException('Shop account is suspended');
        }

        // Generate JWT
        const token = this.jwtService.sign({
            sub: shop.id,
            phone: shop.ownerPhone,
            type: 'shop',
            status: shop.status,
        });

        return {
            token,
            shop: {
                id: shop.id,
                name: shop.name,
                status: shop.status,
                tier: shop.tier,
            },
        };
    }

    /**
     * Validate JWT payload
     */
    async validateToken(payload: any) {
        if (payload.type === 'user') {
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            return user;
        } else if (payload.type === 'shop') {
            const shop = await this.prisma.shop.findUnique({
                where: { id: payload.sub },
            });
            return shop;
        }
        return null;
    }

    /**
     * Admin: Get all users
     */
    async getAllUsers(page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.user.count(),
        ]);

        return {
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }

    // ============================================
    // SHOP: Password-Based Authentication
    // ============================================

    /**
     * Register shop with email + password
     * Store registration data temporarily, create account only after email verification
     */
    async registerShop(data: {
        name: string;
        ownerName: string;
        ownerPhone: string;
        email: string;
        password: string;
        address: string;
        locality: string;
        city?: string;
        pincode: string;
        lat: number;
        lng: number;
    }) {
        // Validate password strength
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.valid) {
            throw new BadRequestException(passwordValidation.errors.join(', '));
        }

        // Check if phone already exists
        const existingPhone = await this.prisma.shop.findUnique({
            where: { ownerPhone: data.ownerPhone },
        });
        if (existingPhone) {
            throw new ConflictException('Phone number already registered');
        }

        // Check if email already exists
        const existingEmail = await this.prisma.shop.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Store registration data in Redis temporarily (30 minutes TTL)
        const registrationKey = `pending_shop_registration:${data.email}`;
        const registrationData = {
            ...data,
            passwordHash,
            password: undefined, // Remove plain password
        };
        await this.redis.set(registrationKey, JSON.stringify(registrationData), 1800); // 30 min

        // Send email verification OTP
        await this.sendEmailOTP(data.email);

        return {
            success: true,
            message: 'Verification email sent. Please check your email to complete registration.',
            email: data.email,
        };
    }

    /**
     * Send email OTP via Supabase Auth (Sends actual email)
     * Falls back to console logging if Supabase is not configured
     */
    async sendEmailOTP(email: string) {
        // Check if Supabase is configured
        if (!this.supabase.isConfigured()) {
            console.warn('⚠️ Supabase not configured. Using development mode (console OTP).');
            return this.sendEmailOTPDev(email);
        }

        try {
            const client = this.supabase.clientOrThrow();

            // Use Supabase Auth to send OTP email
            // Note: shouldCreateUser must be true for OTP to work
            const { data, error } = await client.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true, // Required for OTP emails
                    emailRedirectTo: undefined, // Don't send magic link, only OTP
                    data: {
                        app: 'ora',
                        role: 'SHOP_OWNER',
                    },
                },
            });

            if (error) {
                console.error('Supabase OTP error:', error.message);
                console.warn('⚠️ Falling back to development OTP mode.');
                console.warn('💡 To use Supabase email OTP:');
                console.warn('   1. Go to Supabase Dashboard → Authentication → Email Templates');
                console.warn('   2. Select "Magic Link" template');
                console.warn('   3. Change the template to show {{ .Token }} instead of {{ .ConfirmationURL }}');
                console.warn('   4. Or create a custom OTP-only email template');
                return this.sendEmailOTPDev(email);
            }

            console.log(`✅ Email OTP sent to ${email} via Supabase`);
            return { success: true, message: 'OTP sent to email' };
        } catch (error) {
            console.error('Unexpected error sending OTP:', error);
            return this.sendEmailOTPDev(email);
        }
    }

    /**
     * Development fallback: Generate and log OTP to console
     */
    private async sendEmailOTPDev(email: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const key = `otp:email:${email}`;

        // Store in Redis for 10 minutes
        await this.redis.set(key, otp, 600);

        const logMsg = `
========================================
📧 DEV MODE: EMAIL OTP for ${email}
🔑 CODE: ${otp}
⏰ Valid for 10 minutes
========================================
`;
        console.log(logMsg);
        console.error(logMsg); // Also to stderr for visibility

        return { success: true, message: 'OTP sent (development mode - check console)' };
    }

    /**
     * Verify email OTP via Supabase Auth (or Redis in dev mode)
     * Completes pending registrations if found
     */
    async verifyEmailOTP(email: string, otp: string) {
        console.log(`🔍 Verifying OTP for ${email}, code: ${otp}`);

        let supabaseVerified = false;

        // Try Supabase verification first
        if (this.supabase.isConfigured()) {
            try {
                const client = this.supabase.clientOrThrow();

                console.log('📧 Attempting Supabase OTP verification...');
                const { data, error } = await client.auth.verifyOtp({
                    email,
                    token: otp,
                    type: 'email',
                });

                if (!error) {
                    console.log('✅ Supabase OTP verification succeeded');
                    supabaseVerified = true;

                    try {
                        await this.completePendingRegistration(email);
                        await this.markEmailVerified(email);
                    } catch (registrationError) {
                        console.error('❌ Error completing registration:', registrationError);
                        throw registrationError;
                    }

                    return { success: true, message: 'Email verified successfully' };
                }

                console.warn('⚠️ Supabase OTP verification failed:', error.message);
                console.log('🔄 Trying Redis fallback...');
            } catch (error) {
                console.warn('⚠️ Supabase verification error:', error);
                // If Supabase verification succeeded but registration failed, don't try Redis
                if (supabaseVerified) {
                    throw error;
                }
                console.log('🔄 Trying Redis fallback...');
            }
        } else {
            console.log('📝 Supabase not configured, using Redis verification');
        }

        // Fallback to Redis verification (development mode)
        const key = `otp:email:${email}`;
        const storedOTP = await this.redis.get(key);

        console.log(`🔑 Redis lookup - Key: ${key}, Stored: ${storedOTP}, Provided: ${otp}`);

        if (!storedOTP || String(storedOTP) !== String(otp)) {
            console.error(`❌ OTP mismatch or not found. Stored: ${storedOTP}, Provided: ${otp}`);
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        console.log('✅ Redis OTP verification succeeded');

        // Delete used OTP
        await this.redis.del(key);

        // Complete pending registration if exists
        await this.completePendingRegistration(email);

        // Mark as verified
        await this.markEmailVerified(email);
        return { success: true, message: 'Email verified successfully' };
    }

    /**
     * Complete pending shop or user registration after email verification
     */
    private async completePendingRegistration(email: string) {
        // Check for pending shop registration
        const shopKey = `pending_shop_registration:${email}`;
        const shopDataRaw = await this.redis.get<string>(shopKey);

        if (shopDataRaw) {
            console.log(`📦 Raw shop data type: ${typeof shopDataRaw}`, shopDataRaw);

            // Handle both string and object responses from Redis
            let registrationData;
            try {
                if (typeof shopDataRaw === 'string') {
                    registrationData = JSON.parse(shopDataRaw);
                } else if (typeof shopDataRaw === 'object' && shopDataRaw !== null) {
                    // Already an object
                    registrationData = shopDataRaw;
                } else {
                    console.error(`❌ Unexpected data type from Redis: ${typeof shopDataRaw}`);
                    return null;
                }
            } catch (parseError) {
                console.error(`❌ Failed to parse shop registration data:`, parseError);
                return null;
            }

            console.log(`📝 Found pending shop registration for ${email}`);

            // Create the shop account now
            const shop = await this.prisma.shop.create({
                data: {
                    name: registrationData.name,
                    ownerName: registrationData.ownerName,
                    ownerPhone: registrationData.ownerPhone,
                    email: registrationData.email,
                    passwordHash: registrationData.passwordHash,
                    address: registrationData.address,
                    locality: registrationData.locality,
                    city: registrationData.city,
                    pincode: registrationData.pincode,
                    lat: registrationData.lat,
                    lng: registrationData.lng,
                    emailVerified: true,
                    status: 'APPROVED', // Activate immediately after verification
                },
            });

            // Remove pending registration data
            await this.redis.del(shopKey);
            console.log(`✅ Shop account created for ${email} after email verification`);
            return shop;
        }

        // Check for pending user registration
        const userKey = `pending_user_registration:${email}`;
        const userDataRaw = await this.redis.get<string>(userKey);

        if (userDataRaw) {
            console.log(`📦 Raw user data type: ${typeof userDataRaw}`, userDataRaw);

            // Handle both string and object responses from Redis
            let registrationData;
            try {
                if (typeof userDataRaw === 'string') {
                    registrationData = JSON.parse(userDataRaw);
                } else if (typeof userDataRaw === 'object' && userDataRaw !== null) {
                    // Already an object
                    registrationData = userDataRaw;
                } else {
                    console.error(`❌ Unexpected data type from Redis: ${typeof userDataRaw}`);
                    return null;
                }
            } catch (parseError) {
                console.error(`❌ Failed to parse user registration data:`, parseError);
                return null;
            }

            console.log(`📝 Found pending user registration for ${email}`);

            // Create the user account now
            const user = await this.prisma.user.create({
                data: {
                    name: registrationData.name,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    passwordHash: registrationData.passwordHash,
                    city: registrationData.city,
                    emailVerified: true,
                    isVerified: true,
                },
            });

            // Remove pending registration data
            await this.redis.del(userKey);
            console.log(`✅ User account created for ${email} after email verification`);
            return user;
        }

        // No pending registration found (might be re-verification)
        console.log(`ℹ️ No pending registration found for ${email}`);
        return null;
    }

    /**
     * Mark email as verified in database for both shops and users
     */
    private async markEmailVerified(email: string) {
        const shopUpdate = await this.prisma.shop.updateMany({
            where: { email },
            data: { emailVerified: true },
        });

        const userUpdate = await this.prisma.user.updateMany({
            where: { email },
            data: { emailVerified: true, isVerified: true },
        });

        console.log(`✅ Email verified for ${email} (Shop: ${shopUpdate.count}, User: ${userUpdate.count})`);
    }

    /**
     * Login with phone + password
     */
    async loginWithPassword(phone: string, password: string) {
        // Find shop
        const shop = await this.prisma.shop.findUnique({
            where: { ownerPhone: phone },
        });

        if (!shop) {
            throw new UnauthorizedException('Invalid phone or password');
        }

        // Check password
        const isPasswordValid = await comparePassword(password, shop.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid phone or password');
        }

        // Check shop status
        if (shop.status === 'SUSPENDED') {
            throw new UnauthorizedException('Shop account is suspended');
        }

        // Update last login
        await this.prisma.shop.update({
            where: { id: shop.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate JWT
        const token = this.jwtService.sign({
            sub: shop.id,
            phone: shop.ownerPhone,
            type: 'shop',
            status: shop.status,
        });

        return {
            token,
            shop: {
                id: shop.id,
                name: shop.name,
                ownerName: shop.ownerName,
                phone: shop.ownerPhone,
                email: shop.email,
                locality: shop.locality,
                address: shop.address,
                status: shop.status,
                tier: shop.tier,
                emailVerified: shop.emailVerified,
            },
        };
    }

    /**
     * Login with email + OTP (backup method)
     */
    async loginWithEmailOTP(email: string, otp: string) {
        // Verify OTP with Supabase
        const { data, error } = await this.supabase.clientOrThrow().auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        if (error) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // Find shop
        const shop = await this.prisma.shop.findUnique({
            where: { email },
        });

        if (!shop) {
            throw new UnauthorizedException('Shop not found with this email');
        }

        if (shop.status === 'SUSPENDED') {
            throw new UnauthorizedException('Shop account is suspended');
        }

        // Update last login
        await this.prisma.shop.update({
            where: { id: shop.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate JWT
        const token = this.jwtService.sign({
            sub: shop.id,
            phone: shop.ownerPhone,
            type: 'shop',
            status: shop.status,
        });

        return {
            token,
            shop: {
                id: shop.id,
                name: shop.name,
                ownerName: shop.ownerName,
                phone: shop.ownerPhone,
                email: shop.email,
                locality: shop.locality,
                address: shop.address,
                status: shop.status,
                tier: shop.tier,
                emailVerified: shop.emailVerified,
            },
        };
    }

    /**
     * Forgot password - send OTP to email
     */
    async forgotPassword(phone: string) {
        // Find shop by phone
        const shop = await this.prisma.shop.findUnique({
            where: { ownerPhone: phone },
        });

        if (!shop) {
            throw new UnauthorizedException('Shop not found with this phone number');
        }

        // Send OTP to registered email
        await this.sendEmailOTP(shop.email);

        return {
            success: true,
            message: 'OTP sent to your registered email',
            maskedEmail: maskEmail(shop.email),
        };
    }

    /**
     * Reset password with email OTP (Supabase verification)
     */
    async resetPassword(email: string, otp: string, newPassword: string) {
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new BadRequestException(passwordValidation.errors.join(', '));
        }

        // Verify OTP using Supabase
        await this.verifyEmailOTP(email, otp);

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await this.prisma.shop.update({
            where: { email },
            data: {
                passwordHash,
                passwordChangedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Password reset successfully',
        };
    }

    // ============================================
    //USER: Password-Based Authentication
    // ============================================

    /**
     * Register user with email + password
     * Store registration data temporarily, create account only after email verification
     */
    async registerUser(data: {
        name: string;
        email: string;
        phone: string;
        password: string;
        city?: string;
    }) {
        // Validate password strength
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.valid) {
            throw new BadRequestException(passwordValidation.errors.join(', '));
        }

        // Check if email already exists
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email already registered');
        }

        // Check if phone already exists
        const existingPhone = await this.prisma.user.findUnique({
            where: { phone: data.phone },
        });
        if (existingPhone) {
            throw new ConflictException('Phone number already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Store registration data in Redis temporarily (30 minutes TTL)
        const registrationKey = `pending_user_registration:${data.email}`;
        const registrationData = {
            ...data,
            passwordHash,
            password: undefined, // Remove plain password
        };
        await this.redis.set(registrationKey, JSON.stringify(registrationData), 1800); // 30 min

        // Send email verification OTP
        await this.sendEmailOTP(data.email);

        return {
            success: true,
            message: 'Verification email sent. Please check your email to complete registration.',
            email: data.email,
        };
    }

    /**
     * Verify user email with OTP
     */
    async verifyUserEmailOTP(email: string, otp: string) {
        await this.verifyEmailOTP(email, otp);

        // Mark email as verified
        await this.prisma.user.updateMany({
            where: { email },
            data: { emailVerified: true, isVerified: true },
        });

        return { success: true, message: 'Email verified successfully' };
    }

    /**
     * Login user with email + password
     */
    async loginUserWithPassword(email: string, password: string) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.passwordHash || '');
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Check if email is verified
        if (!user.emailVerified) {
            throw new UnauthorizedException('Please verify your email before logging in');
        }

        // Generate JWT
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            type: 'user',
        });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                emailVerified: user.emailVerified,
            },
        };
    }

    /**
     * Send OTP to user email
     */
    async sendUserEmailOTP(email: string) {
        // Check if email exists
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('No user found with this email');
        }

        await this.sendEmailOTP(email);

        return {
            success: true,
            message: 'OTP sent to email',
        };
    }

    /**
     * Forgot password - send OTP
     */
    async forgotUserPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('No user found with this email');
        }

        await this.sendEmailOTP(email);

        return {
            success: true,
            message: 'OTP sent to your email',
            maskedEmail: maskEmail(email),
        };
    }

    /**
     * Reset user password with OTP (Supabase verification)
     */
    async resetUserPassword(email: string, otp: string, newPassword: string) {
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new BadRequestException(passwordValidation.errors.join(', '));
        }

        // Verify OTP using Supabase
        await this.verifyEmailOTP(email, otp);

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await this.prisma.user.updateMany({
            where: { email },
            data: { passwordHash },
        });

        return {
            success: true,
            message: 'Password reset successfully',
        };
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return { user };
    }

    /**
     * Update user profile
     */
    async updateUserProfile(userId: string, data: any) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone,
                city: data.city, // Only update allowed fields
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                emailVerified: true,
            },
        });
    }


}
