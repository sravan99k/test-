import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // TODO: Send to error tracking service (Sentry, Firebase Crashlytics)
        // Example: Sentry.captureException(error, { extra: errorInfo });

        this.setState({
            errorInfo,
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Something went wrong</CardTitle>
                                    <CardDescription>
                                        We encountered an unexpected error. Don't worry, your data is safe.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Error details (only in development) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm font-mono text-red-800 mb-2">
                                        <strong>Error:</strong> {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-red-700">
                                            <summary className="cursor-pointer font-semibold mb-2">
                                                Stack Trace
                                            </summary>
                                            <pre className="overflow-auto p-2 bg-white rounded">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* User-friendly message */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    This error has been automatically reported to our team. You can try the following:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                    <li>Refresh the page to try again</li>
                                    <li>Clear your browser cache and reload</li>
                                    <li>Go back to the home page</li>
                                    <li>Contact support if the problem persists</li>
                                </ul>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button onClick={this.handleReset} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
