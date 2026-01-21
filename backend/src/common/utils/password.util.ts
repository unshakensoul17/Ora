import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Check for common passwords
    const commonPasswords = [
        'password',
        '12345678',
        'password123',
        'qwerty',
        'abc123',
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common. Please choose a stronger password');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Mask email for display (e.g., r***@gmail.com)
 */
export function maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;

    const maskedUsername =
        username.charAt(0) + '***' + (username.length > 1 ? username.charAt(username.length - 1) : '');

    return `${maskedUsername}@${domain}`;
}
