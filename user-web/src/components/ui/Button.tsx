'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * Button variants configuration
 */
const variants = {
    primary: `
        bg-gradient-to-r from-accent to-accent-hover
        text-primary font-semibold
        shadow-lg shadow-accent/30
        hover:shadow-xl hover:shadow-accent/40
        hover:scale-[1.02]
        active:scale-[0.98]
    `,
    secondary: `
        bg-white/5 border border-white/10
        text-white font-medium
        hover:bg-white/10 hover:border-white/20
        hover:scale-[1.02]
        active:scale-[0.98]
    `,
    ghost: `
        bg-transparent
        text-white/70 font-medium
        hover:text-white hover:bg-white/5
        active:bg-white/10
    `,
    danger: `
        bg-gradient-to-r from-red-600 to-red-700
        text-white font-semibold
        shadow-lg shadow-red-600/30
        hover:shadow-xl hover:shadow-red-600/40
        hover:scale-[1.02]
        active:scale-[0.98]
    `,
    outline: `
        bg-transparent border-2 border-accent
        text-accent font-semibold
        hover:bg-accent/10
        hover:scale-[1.02]
        active:scale-[0.98]
    `,
};

/**
 * Button sizes configuration
 */
const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl',
    icon: 'p-3 rounded-xl',
};

/**
 * Button component props
 */
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
    /** Visual variant of the button */
    variant?: keyof typeof variants;
    /** Size of the button */
    size?: keyof typeof sizes;
    /** Whether the button is in a loading state */
    isLoading?: boolean;
    /** Whether the button is disabled */
    isDisabled?: boolean;
    /** Icon to display on the left of the text */
    leftIcon?: React.ReactNode;
    /** Icon to display on the right of the text */
    rightIcon?: React.ReactNode;
    /** Full width button */
    fullWidth?: boolean;
    /** Children elements */
    children?: React.ReactNode;
}

/**
 * Premium button component with multiple variants, sizes, and loading states.
 * Features smooth animations, glassmorphism effects, and proper accessibility.
 *
 * @example
 * // Primary button
 * <Button variant="primary" size="lg">Reserve Now</Button>
 *
 * // With icons
 * <Button leftIcon={<ShoppingCart />} variant="secondary">Add to Cart</Button>
 *
 * // Loading state
 * <Button isLoading>Processing...</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            isDisabled = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            className,
            ...props
        },
        ref
    ) => {
        const isDisabledOrLoading = isDisabled || isLoading;

        return (
            <motion.button
                ref={ref}
                whileHover={isDisabledOrLoading ? {} : { scale: 1.02 }}
                whileTap={isDisabledOrLoading ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={cn(
                    // Base styles
                    'relative inline-flex items-center justify-center gap-2',
                    'font-medium transition-all duration-200 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-charcoal',
                    // Variant styles
                    variants[variant],
                    // Size styles
                    sizes[size],
                    // Full width
                    fullWidth && 'w-full',
                    // Disabled state
                    isDisabledOrLoading && 'opacity-50 cursor-not-allowed pointer-events-none',
                    // Custom className
                    className
                )}
                disabled={isDisabledOrLoading}
                aria-busy={isLoading}
                {...(props as any)}
            >
                {/* Loading spinner */}
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}

                {/* Left icon */}
                {!isLoading && leftIcon && (
                    <span className="flex-shrink-0">{leftIcon}</span>
                )}

                {/* Button text */}
                {children && <span>{children}</span>}

                {/* Right icon */}
                {!isLoading && rightIcon && (
                    <span className="flex-shrink-0">{rightIcon}</span>
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
