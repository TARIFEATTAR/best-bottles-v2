import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Especially important for:
 * - AI integration failures (Gemini, ElevenLabs, Freepik)
 * - Network request errors
 * - Unexpected runtime exceptions
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log the error to console (could be extended to external service)
        console.error('ErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);

        this.setState({ errorInfo });

        // TODO: In production, send to error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    private handleReload = (): void => {
        window.location.reload();
    };

    private handleGoHome = (): void => {
        window.location.href = '/';
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI with Best Bottles branding
            return (
                <div className="min-h-screen bg-[#F9F8F6] dark:bg-[#161615] flex items-center justify-center p-6">
                    <div className="max-w-lg w-full text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#C5A065]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-[#C5A065]">
                                error_outline
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="font-serif text-3xl font-bold text-[#1D1D1F] dark:text-white mb-4">
                            Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            We encountered an unexpected error. Our team has been notified
                            and is working to fix it. Please try refreshing the page or
                            return to the homepage.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-full text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">refresh</span>
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-[#1D1D1F] dark:text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">home</span>
                                Go Home
                            </button>
                        </div>

                        {/* Error Details (Development only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-10 text-left">
                                <details className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                                    <summary className="cursor-pointer text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">
                                        Developer Details
                                    </summary>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Error</p>
                                            <code className="block text-xs text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg overflow-x-auto">
                                                {this.state.error.toString()}
                                            </code>
                                        </div>
                                        {this.state.errorInfo && (
                                            <div>
                                                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Component Stack</p>
                                                <pre className="text-xs text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            </div>
                        )}

                        {/* Support Link */}
                        <p className="mt-10 text-xs text-gray-400">
                            Need help? Contact us at{' '}
                            <a
                                href="mailto:sales@nematinternational.com"
                                className="text-[#C5A065] hover:underline"
                            >
                                sales@nematinternational.com
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
