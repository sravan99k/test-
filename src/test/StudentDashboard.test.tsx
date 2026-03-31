import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '@/pages/StudentDashboard';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            uid: 'test-student-123',
            email: 'test@example.com',
            demographics: {
                name: 'Test Student',
                school: 'Test School',
                branch: 'Main',
                state: 'Test State',
                city: 'Test City',
                pincode: '12345',
            },
        },
        loading: false,
        error: null,
    }),
}));

// Mock the DashboardSkeleton component
vi.mock('@/components/DashboardSkeleton', () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Loading...</div>,
}));

// Mock timers to handle async operations
vi.useFakeTimers();

// Mock Firestore
const mockUnsubscribe = vi.fn();

vi.mock('firebase/firestore', () => {
    const callbacks: any[] = [];
    
    const mockOnSnapshot = vi.fn((ref, onNext, onError) => {
        if (ref.type === 'doc') {
            // For document snapshots
            const mockDoc = {
                exists: () => true,
                data: () => ({
                    name: 'Test Student',
                    interventions: [],
                    riskLevel: 'low',
                    unreadAlerts: 0
                })
            };
            // Call the callback immediately with the mock data
            onNext(mockDoc);
        } else {
            // For query snapshots (used by DashboardStats)
            const mockQuerySnapshot = {
                size: 1,
                empty: false,
                docs: [{
                    id: 'test-doc-1',
                    data: () => ({
                        riskPercentage: 20,
                        assessmentDate: { toDate: () => new Date() },
                        completed_at: { toDate: () => new Date() },
                        created_at: { toDate: () => new Date() }
                    })
                }]
            };
            // Call the callback immediately with the mock data
            onNext(mockQuerySnapshot);
        }
        
        // Store the callback for potential future updates
        callbacks.push({ onNext, onError });
        return mockUnsubscribe;
    });

    return {
        doc: vi.fn((db, path) => ({
            type: 'doc',
            path,
            id: 'test-id',
            withConverter: vi.fn()
        })),
        collection: vi.fn((db, path) => ({
            type: 'collection',
            path,
            withConverter: vi.fn()
        })),
        query: vi.fn((collectionRef) => ({
            type: 'query',
            collection: collectionRef,
            withConverter: vi.fn()
        })),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        startAfter: vi.fn().mockReturnThis(),
        getDoc: vi.fn(() => Promise.resolve({
            exists: () => true,
            data: () => ({
                parentAdminId: 'admin1',
                schoolId: 'school1',
                studentId: 'student1',
                isIndependent: false,
                riskLevel: 'low',
                lastAssessmentDate: { toDate: () => new Date() }
            })
        })),
        getDocs: vi.fn(() => Promise.resolve({
            empty: false,
            docs: [{
                id: 'assessment-1',
                data: () => ({
                    riskPercentage: 80,
                    assessmentDate: { toDate: () => new Date() },
                    completed_at: { toDate: () => new Date() },
                    created_at: { toDate: () => new Date() }
                })
            }]
        })),
        onSnapshot: mockOnSnapshot,
        Timestamp: {
            fromDate: (date: Date) => ({
                toDate: () => date
            })
        }
    };
});

describe('StudentDashboard', () => {
    // Set up and clean up for each test
    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    beforeEach(() => {
        vi.useFakeTimers();
    });
    it('renders welcome message with student name', async () => {
        render(
            <BrowserRouter>
                <StudentDashboard />
            </BrowserRouter>
        );

        // The component should initially show the loading state
        expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();

        // Wait for the component to update after loading
        await waitFor(() => {
            expect(screen.getByText(/Welcome back, Test Student!/)).toBeInTheDocument();
        });
    });

    it('shows personalized wellness overview text', async () => {
        render(
            <BrowserRouter>
                <StudentDashboard />
            </BrowserRouter>
        );

        // Wait for the component to update after loading
        await waitFor(() => {
            expect(screen.getByText(/Here's your personalized wellness overview for today/)).toBeInTheDocument();
        });
    });

    it('shows risk alert when risk level is high', async () => {
        // Mock the onSnapshot function directly
        const { onSnapshot } = await import('firebase/firestore');
        
        // Create a custom mock implementation for this test
        (onSnapshot as any).mockImplementationOnce((ref, onNext, onError) => {
            if (ref.type === 'doc') {
                const mockDoc = {
                    exists: () => true,
                    data: () => ({
                        name: 'Test Student',
                        interventions: [],
                        riskLevel: 'high',
                        unreadAlerts: 1
                    })
                };
                // Call the callback on the next tick to simulate async behavior
                setTimeout(() => onNext(mockDoc), 0);
            }
            return mockUnsubscribe;
        });

        render(
            <BrowserRouter>
                <StudentDashboard />
            </BrowserRouter>
        );

        // Check for the alert
        await waitFor(() => {
            const alert = screen.getByRole('alert');
            expect(alert).toBeInTheDocument();
            expect(screen.getByText(/You are currently flagged as high risk/)).toBeInTheDocument();
        }, { timeout: 3000 }); // Increase timeout if needed
    });
});
