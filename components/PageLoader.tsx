import React from 'react';

interface PageLoaderProps {
    message?: string;
}

/**
 * PageLoader Component
 * 
 * A premium loading skeleton shown during lazy-loaded route transitions.
 * Matches the Best Bottles brand aesthetic.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6">
            {/* Animated Logo/Spinner */}
            <div className="relative mb-8">
                {/* Outer ring */}
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
                {/* Spinning arc */}
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-[#C5A065] animate-spin"></div>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-[#C5A065] animate-pulse">
                        sanitizer
                    </span>
                </div>
            </div>

            {/* Loading text */}
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">
                {message}
            </p>

            {/* Subtle skeleton bars */}
            <div className="w-full max-w-xs space-y-3 mt-8 opacity-30">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-4/5"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/5"></div>
            </div>
        </div>
    );
};

/**
 * Compact loader for smaller sections/modals
 */
export const SectionLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div className="relative">
                <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 dark:border-gray-700`}></div>
                <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-[#C5A065] animate-spin`}></div>
            </div>
        </div>
    );
};

export default PageLoader;
