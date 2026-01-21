import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper priority resolution.
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution.
 *
 * @example
 * // Basic usage
 * cn('text-red-500', 'text-blue-500') // => 'text-blue-500' (blue wins)
 *
 * // Conditional usage
 * cn('base-class', isActive && 'active-class', !isDisabled && 'enabled-class')
 *
 * // Object syntax
 * cn('base', { 'active': isActive, 'disabled': isDisabled })
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
