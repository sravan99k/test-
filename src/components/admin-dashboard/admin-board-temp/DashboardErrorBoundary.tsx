import React from 'react';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardErrorBoundaryProps {
    children: React.ReactNode;
    dashboardName: string;
}

const DashboardErrorFallback = ({ dashboardName }: { dashboardName: string }) => (
    <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
            <Card className="border-red-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <CardTitle>Unable to Load {dashboardName}</CardTitle>
                            <CardDescription>
                                We're having trouble loading this dashboard right now.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This could be due to:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                        <li>A temporary network issue</li>
                        <li>Missing or incomplete data</li>
                        <li>A problem with your account permissions</li>
                    </ul>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={() => window.location.reload()}>
                            Reload Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Go to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

export const DashboardErrorBoundary: React.FC<DashboardErrorBoundaryProps> = ({
    children,
    dashboardName,
}) => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        // Log to console in development
        console.error(`Error in ${dashboardName}:`, error, errorInfo);

        // TODO: Send to error tracking service
        // Example: Send to Sentry with dashboard context
        // Sentry.captureException(error, {
        //   tags: { dashboard: dashboardName },
        //   extra: { errorInfo }
        // });

        // TODO: Send to Firebase Crashlytics
        // logEvent(analytics, 'dashboard_error', {
        //   dashboard: dashboardName,
        //   error: error.message,
        // });
    };

    return (
        <ErrorBoundary
            fallback={<DashboardErrorFallback dashboardName={dashboardName} />}
            onError={handleError}
        >
            {children}
        </ErrorBoundary>
    );
};

export default DashboardErrorBoundary;
