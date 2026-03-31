import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
    target: string; // 'center' or CSS selector
    title: string;
    content: string;
    path: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    forcePosition?: boolean;
    offset?: { x: number; y: number };
    onEnter?: () => void;
    onExit?: () => void;
    allowInteraction?: boolean;
    image?: string;
}

interface Rect {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        target: 'center',
        title: 'Welcome to Novo Wellness!',
        content: 'Your journey to better wellness starts here. Let us show you around and help you get the most out of our tools.',
        path: '/',
        image: '/onboarding/down.png'
    },
    {
        target: '#onboarding-take-assessment',
        title: 'Your First Step',
        content: 'Take your first assessment to understand your current wellbeing profile. You can click this button to take your first assessment.',
        path: '/',
        position: 'bottom',
        allowInteraction: true,
        image: '/onboarding/up.png'
    },
    {
        target: '.max-w-4xl.mx-auto', // The card on assessment page
        title: 'Assessment Instructions',
        content: 'Take a moment to read these instructions. This helps us provide the best support tailored to you.',
        path: '/assessment',
        position: 'left',
        image: '/onboarding/left.png'
    },
    {
        target: '#onboarding-welcome',
        title: 'Personal Dashboard',
        content: 'This is your central hub for wellness stats and quick activities. Everything you need is right here.',
        path: '/student-dashboard',
        position: 'bottom',
        image: '/onboarding/up.png'
    },
    {
        target: '#onboarding-wellbeing',
        title: 'Track Progress',
        content: 'Monitor your emotional and mental health trends over time.',
        path: '/student-dashboard',
        position: 'right',
        image: '/onboarding/left.png'
    },
    {
        target: '#onboarding-streak',
        title: 'Daily Consistency',
        content: 'Build healthy habits by checking in every day. Watch your streak grow and feel proud of your progress!',
        path: '/student-dashboard',
        position: 'left',
        image: '/onboarding/right.png'
    },
    {
        target: '#wellness-journey',
        title: 'Wellness Journey',
        content: 'Explore specialized tools for your mental and emotional growth. Take a deep dive into your wellbeing.',
        path: '/wellness/dashboard',
        position: 'bottom',
    },
    {
        target: '#onboarding-wellness-nav',
        title: 'Wellness Modules',
        content: 'Access all your wellness tools from this central navigation bar. Switch between mood tracking, journals, and more.',
        path: '/wellness/dashboard',
        position: 'bottom',
    },
    {
        target: '#wellness-mood-section',
        title: 'Mood Tracker',
        content: 'Log how you feel throughout the day to identify emotional patterns and improve mindfulness.',
        path: '/wellness/mood',
        position: 'bottom',
    },
    {
        target: '#wellness-journal-section',
        title: 'Guided Journaling',
        content: 'Reflect on your day and express your thoughts using our supportive journal module.',
        path: '/wellness/journal',
        position: 'bottom',
    },
    {
        target: '#wellness-goals-section',
        title: 'Personal Goals',
        content: 'Define clear objectives for your wellness and track your progress toward achieving them.',
        path: '/wellness/goals',
        position: 'bottom',
    },
    {
        target: '#wellness-badges-section',
        title: 'Achievement Badges',
        content: 'Celebrate your dedication and consistency by earning unique wellness badges.',
        path: '/wellness/badges',
        position: 'bottom',
    },
    {
        target: '#onboarding-cognitive-grid',
        title: 'Cognitive Training',
        content: 'Strengthen your memory, focus, and mental agility with these fun exercises.',
        path: '/cognitive-tasks',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#onboarding-resources-grid',
        title: 'Resource Library',
        content: 'Explore our vast resources to support your mental health journey.',
        path: '/resources',
        position: 'top',
    },
    {
        target: '#onboarding-buddybot-chat',
        title: 'BuddyBot Support',
        content: 'Talk to BuddyBot! It can provide support, answer questions, or just listen to how you are feeling.',
        path: '/',
        position: 'left',
        image: '/onboarding/right.png',
        onEnter: () => {
            const btn = document.querySelector('#onboarding-buddybot') as HTMLButtonElement;
            if (btn && !document.querySelector('#onboarding-buddybot-chat')) btn.click();
        },
        onExit: () => {
            const closeBtn = document.querySelector('#onboarding-buddybot-chat button') as HTMLButtonElement;
            if (closeBtn) closeBtn.click();
        }
    },
    {
        target: '#onboarding-buddysafe-floating',
        title: 'Buddy Safe',
        content: 'If you ever feel unsafe or need immediate help, this floating icon is always here for you.',
        path: '/',
        position: 'left',
        image: '/onboarding/right.png'
    },
    {
        target: '#onboarding-buddysafe-cards',
        title: 'Safety Center',
        content: 'Our safety center provides helplines, support guides, and reporting tools to keep you safe.',
        path: '/buddysafe',
        position: 'top',
        image: '/onboarding/up.png'
    },
];

const TEACHER_ONBOARDING_STEPS: OnboardingStep[] = [
    {
        target: 'center',
        title: 'Welcome to your Dashboard',
        content: 'This is your command center for monitoring student wellbeing, tracking risks, and managing your class.',
        path: '/teacher/dashboard',
        image: '/onboarding/down.png'
    },
    {
        target: '#teacher-tour-class-performance',
        title: 'Class Performance',
        content: 'Visualize engagement and wellbeing trends for your entire class over time. Spot patterns early.',
        path: '/teacher/dashboard',
        position: 'right',
        image: '/onboarding/left.png'
    },
    {
        target: '#teacher-tour-high-risk',
        title: 'Priority Alerts',
        content: 'Students flagged as "High Risk" appear here. These require your immediate attention.',
        path: '/teacher/dashboard',
        position: 'left',
        image: '/onboarding/right.png'
    },
    {
        target: '#teacher-tour-risk-section',
        title: 'Real-time Insights',
        content: 'Stay updated with live risk changes and chatbot triggers. See what\'s happening right now.',
        path: '/teacher/dashboard',
        position: 'top',
        forcePosition: true,
        image: '/onboarding/down.png',
        onEnter: () => {
            const element = document.querySelector('#teacher-tour-risk-section');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 300, behavior: 'smooth' });
            }
        }
    },
    {
        target: '#teacher-tour-student-list',
        title: 'Student Management',
        content: 'View your full student roster. Filter by risk level, export reports, or click a student for details.',
        path: '/teacher/dashboard',
        position: 'top',
        forcePosition: true,
        image: '/onboarding/down.png',
        onEnter: () => {
            const element = document.querySelector('#teacher-tour-student-list');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 400, behavior: 'smooth' });
            }
        }
    },
    {
        target: '#teacher-tour-assessments-grid',
        title: 'Assessments Hub',
        content: 'Create, manage, and track student assessments. View completion rates and results at a glance.',
        path: '/teacher/assessments',
        position: 'bottom',
        image: '/onboarding/down.png'
    },
    {
        target: '#teacher-tour-resources-grid',
        title: 'Resource Library',
        content: 'Access professional development guides, mental health resources, and classroom strategies.',
        path: '/teacher/resources',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#teacher-tour-activities-container',
        title: 'Activities & Sessions',
        content: 'Plan wellness activities like mindfulness sessions, and schedule individual or group counseling sessions.',
        path: '/teacher/activities',
        position: 'top',
        forcePosition: true,
        offset: { x: 0, y: -20 },
        image: '/onboarding/down.png',
        allowInteraction: true,
        onEnter: () => {
            const element = document.querySelector('#teacher-tour-activities-container');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 350, behavior: 'smooth' });
            }
        }
    },
    {
        target: '#teacher-tour-faq-container',
        title: 'Need Help?',
        content: 'Find answers to common questions about the platform, student management, assessments and more.',
        path: '/teacher/support?tab=faq',
        position: 'top',
        forcePosition: true,
        offset: { x: 0, y: 50 },
        image: '/onboarding/down.png'
    }
];

const ORGANIZATION_ONBOARDING_STEPS: OnboardingStep[] = [
    {
        target: 'center',
        title: 'Welcome to your Organization Dashboard!',
        content: 'This is your centralized command center to manage multiple schools, monitor student wellbeing, and track performance across your entire network.',
        path: '/organization-dashboard',
        image: '/onboarding/down.png'
    },
    {
        target: '#org-tour-stats',
        title: 'Network Overview',
        content: 'Track key performance indicators across all your institutions.',
        path: '/organization-dashboard',
        position: 'bottom',
        image: '/onboarding/up.png'
    },
    {
        target: '#org-tour-alerts',
        title: 'Priority Notifications',
        content: 'Stay informed about critical wellbeing alerts from any school in your network. Early detection helps in timely intervention.',
        path: '/organization-dashboard',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#org-tour-performance',
        title: 'Top Performing Schools',
        content: 'Identify and learn from the best-performing schools in your network based on student wellness scores.',
        path: '/organization-dashboard',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#org-tour-schools-add',
        title: 'Grow Your Network',
        content: 'Expand your organization by adding new schools to the platform. Simply fill in the details to get them started.',
        path: '/organization/schools',
        position: 'left',
        image: '/onboarding/right.png'
    },
    {
        target: '#org-tour-schools-table',
        title: 'Manage Institutions',
        content: 'View and manage all schools under your organization. You can filter, search, and access detailed reports for each school.',
        path: '/organization/schools',
        position: 'top',
        image: '/onboarding/up.png'
    }

];

const MANAGEMENT_ONBOARDING_STEPS: OnboardingStep[] = [
    {
        target: 'center',
        title: 'Welcome to Management Dashboard',
        content: 'Your central hub for monitoring school performance, student wellness, and academic administration.',
        path: '/',
        image: '/onboarding/down.png'
    },
    {
        target: '#management-overview-stats',
        title: 'School Overview',
        content: 'Get a quick snapshot of your school\'s total students, assessment progress, and specific risk levels needing attention.',
        path: '/',
        position: 'bottom',
        image: '/onboarding/up.png'
    },
    {
        target: '#management-overview-charts',
        title: 'Wellness Trends & Stats',
        content: 'Visualize assessment completion rates and the overall wellness distribution of your student body in real-time.',
        path: '/',
        position: 'top',
        image: '/onboarding/down.png',
        onEnter: () => {
            const element = document.querySelector('#management-overview-charts');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 200, behavior: 'smooth' });
            }
        }
    },
    {
        target: '#management-overview-quick-actions',
        title: 'Quick Actions',
        content: 'Fast-track common tasks like adding new students, assigning teachers, or checking system status.',
        path: '/',
        position: 'right',
        image: '/onboarding/left.png',
        onEnter: () => {
            const element = document.querySelector('#management-overview-quick-actions');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 300, behavior: 'smooth' });
            }
        },
        onExit: () => {
            // When going back, we want to see the charts again clearly
            const element = document.querySelector('#management-overview-charts');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 200, behavior: 'smooth' });
            }
        }
    },
    {
        target: '#teacher-table',
        title: 'Teacher Management',
        content: 'Manage your faculty, view their assigned classes, and monitor their performance metrics.',
        path: '/management?tab=teachers',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#student-table',
        title: 'Student Management',
        content: 'Access detailed student profiles, track wellbeing scores, and manage interventions efficiently.',
        path: '/management?tab=students',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#assignment-teachers-sidebar',
        title: 'Assignments & Classes',
        content: 'Assign students to teachers, manage section allocations, and oversee class structures.',
        path: '/management?tab=assignments',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#assignment-main-content',
        title: 'Class Directory',
        content: 'View entire class lists, filter by grade or section, and drag & drop students to assign them.',
        path: '/management?tab=assignments',
        position: 'top',
        image: '/onboarding/down.png'
    },
    {
        target: '#school-setup-card',
        title: 'Academic Settings',
        content: 'Configure academic years, handle student promotions, and manage school lifecycle transitions.',
        path: '/management?tab=academic',
        position: 'top',
        forcePosition: true,
        image: '/onboarding/down.png',
        onEnter: () => {
            const element = document.querySelector('#school-setup-card');
            if (element) {
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({ top: absoluteTop - 300, behavior: 'smooth' });
            }
        }
    },
    {
        target: '#alerts-tabs',
        title: 'Alerts & Notifications',
        content: 'Stay informed with real-time high-risk alerts and system notifications requiring your attention.',
        path: '/alerts',
        position: 'bottom',
        image: '/onboarding/down.png'
    }
];

const StreamingText = ({ text, speed = 25 }: { text: string; speed?: number }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
        let i = 0;
        const intervalId = setInterval(() => {
            i++;
            setIndex(i);
            if (i >= text.length) {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return (
        <>
            <span>{text.slice(0, index)}</span>
            <span className="invisible" aria-hidden="true">{text.slice(index)}</span>
        </>
    );
};

export const OnboardingTour = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const requestRef = useRef<number>();

    // Determine which steps to use
    const steps = user?.role === 'teacher' || user?.role === 'admin'
        ? TEACHER_ONBOARDING_STEPS
        : user?.role === 'organization'
            ? ORGANIZATION_ONBOARDING_STEPS
            : user?.role === 'management'
                ? MANAGEMENT_ONBOARDING_STEPS
                : ONBOARDING_STEPS;
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

    const storageKey = user ? `onboarding_seen_${user.role}_${user.uid}` : '';
    const stepsKey = user ? `onboarding_steps_seen_${user.role}_${user.uid}` : '';

    const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
        if (!stepsKey) return [];
        const saved = localStorage.getItem(stepsKey);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to check if a step matches current path
    const isStepOnCurrentPath = useCallback((stepPath: string) => {
        const currentPath = location.pathname + location.search;
        return stepPath.includes('?')
            ? stepPath === currentPath
            : stepPath === location.pathname;
    }, [location.pathname, location.search]);

    // Trigger tour on path discovery
    useEffect(() => {
        if (!mounted || isVisible || isNavigating || !user || !storageKey) return;

        // Skip if globally skipped
        const hasSeenTourGlobal = localStorage.getItem(storageKey) === 'true';
        const legacyKey = `onboarding_seen_${user.uid}`;
        const hasSeenLegacy = localStorage.getItem(legacyKey) === 'true';
        if (hasSeenTourGlobal || (user.role === 'student' && hasSeenLegacy)) return;

        // Find first unseen step for this specific path
        const firstUnseenOnPathIndex = steps.findIndex((s) => {
            return isStepOnCurrentPath(s.path) && !completedSteps.includes(s.title);
        });

        if (firstUnseenOnPathIndex !== -1) {
            const timer = setTimeout(() => {
                setCurrentStepIndex(firstUnseenOnPathIndex);
                setIsVisible(true);
                steps[firstUnseenOnPathIndex]?.onEnter?.();
            }, 600); // Faster trigger
            return () => clearTimeout(timer);
        }
    }, [location.pathname, location.search, user, steps, storageKey, mounted, completedSteps, isVisible, isNavigating, isStepOnCurrentPath]);

    // Hide if manually navigated away from the current step's path
    useEffect(() => {
        if (isVisible && currentStep && !isNavigating) {
            if (!isStepOnCurrentPath(currentStep.path)) {
                currentStep.onExit?.();
                setIsVisible(false);
            }
        }
    }, [location.pathname, location.search, isVisible, currentStep, isNavigating, isStepOnCurrentPath]);

    // Update target element position - Absolute Coordinates
    const updatePosition = useCallback(() => {
        const currentPath = location.pathname + location.search;
        const isPathMatch = currentStep?.path.includes('?')
            ? currentStep.path === currentPath
            : currentStep?.path === location.pathname;

        if (!currentStep || !isVisible || (currentStep.target !== 'center' && !isPathMatch)) {
            setTargetRect(null);
            return;
        }

        if (currentStep.target === 'center') {
            setTargetRect(null);
            return;
        }

        const element = document.querySelector(currentStep.target);
        if (element) {
            const rect = element.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            // Calculate absolute position
            const absRect = {
                top: rect.top + scrollY,
                left: rect.left + scrollX,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom + scrollY,
                right: rect.right + scrollX
            };

            setTargetRect(prev => {
                // Determine if we REALLY need to update (layout shift)
                // If the absolute position hasn't changed, we don't update!
                // This means 'scroll' events won't trigger re-renders, as absolute pos stays same.
                if (!prev) return absRect;
                if (Math.abs(prev.top - absRect.top) < 1 &&
                    Math.abs(prev.left - absRect.left) < 1 &&
                    Math.abs(prev.width - absRect.width) < 1 &&
                    Math.abs(prev.height - absRect.height) < 1) return prev;
                return absRect;
            });
        } else {
            setTargetRect(null);
        }
        requestRef.current = requestAnimationFrame(updatePosition);
    }, [currentStep, isVisible, location.pathname]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePosition);
        // We still listen to scroll to handle initial positioning if something loads late,
        // but thanks to the check above, it won't cause re-renders if the doc-relative pos is stable.
        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition, { passive: true });

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]);

    const handleNext = () => {
        if (!currentStep) return;

        // Mark current as completed
        const newCompleted = [...completedSteps, currentStep.title];
        setCompletedSteps(newCompleted);
        localStorage.setItem(stepsKey, JSON.stringify(newCompleted));

        const nextIndex = currentStepIndex + 1;
        // Only proceed if next step exists and is on the SAME path
        if (nextIndex < steps.length && isStepOnCurrentPath(steps[nextIndex].path)) {
            currentStep.onExit?.();
            setCurrentStepIndex(nextIndex);
            setTimeout(() => {
                steps[nextIndex]?.onEnter?.();
            }, 50);
        } else {
            // End of this page's tour
            currentStep.onExit?.();
            setIsVisible(false);

            // If it was the literal last step of the entire tour array, mark global as well
            if (nextIndex >= steps.length) {
                localStorage.setItem(storageKey, 'true');
            }
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            const prevIndex = currentStepIndex - 1;
            // Only go back if it's on the same path
            if (isStepOnCurrentPath(steps[prevIndex].path)) {
                currentStep?.onExit?.();
                setCurrentStepIndex(prevIndex);
                setTimeout(() => {
                    steps[prevIndex]?.onEnter?.();
                }, 50);
            }
        }
    };

    const handleComplete = () => {
        // Close current part
        currentStep?.onExit?.();
        setIsVisible(false);
    };

    const handleSkip = () => {
        // Global Skip: Mark tour as fully seen
        currentStep?.onExit?.();
        setIsVisible(false);
        if (storageKey) {
            localStorage.setItem(storageKey, 'true');
        } else if (user?.uid) {
            localStorage.setItem(`onboarding_seen_${user.uid}`, 'true');
        }
    };

    if (!mounted || !isVisible || !currentStep) return null;

    // Calculate popup and arrow styles
    const getTourStyles = () => {
        const padding = 16;
        // Use document dimensions for absolute positioning context
        const docWidth = document.documentElement.scrollWidth;
        // Viewport dimensions for clamping checks
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const popupWidth = Math.min(400, vw - padding * 2);
        const popupHeight = 300;

        if (currentStep.target === 'center' || !targetRect) {
            return {
                popupStyle: {
                    position: 'fixed' as const, // Center step stays fixed
                    top: '50%',
                    left: '50%',
                    width: popupWidth,
                    zIndex: 10000,
                },
                txPct: '-50%',
                tyPct: '-50%',
                arrowStyle: { display: 'none' },
                offsetX: 0,
                offsetY: 0
            };
        }

        const { top, left, width, right, bottom } = targetRect;
        // NOTE: targetRect contains ABSOLUTE coordinates now (including scroll)

        // Calculate viewport-relative coords for clamping logic
        const viewportTop = top - scrollY;
        const viewportBottom = bottom - scrollY;
        const viewportRight = right - scrollX;
        const viewportLeft = left - scrollX;

        let finalPosition = currentStep.position || 'bottom';

        const popupStyle: React.CSSProperties = { position: 'absolute', width: popupWidth, zIndex: 10000 };
        let arrowStyle: React.CSSProperties = { position: 'absolute', width: 16, height: 16, backgroundColor: 'white', transform: 'rotate(45deg)', border: '1px solid rgba(0,0,0,0.1)' };

        // Clamp target anchorY within the VIEWPORT (converted to absolute)
        const safeYPadding = 80; // Top safegaurd (header)
        const minViewY = scrollY + safeYPadding;
        const maxViewY = scrollY + vh - padding;

        const clampedTop = Math.max(minViewY, top);
        const clampedBottom = Math.min(maxViewY, bottom);
        const clampedHeight = Math.max(0, clampedBottom - clampedTop);
        const anchorY = clampedTop + clampedHeight / 2;

        // Flip logic (checking against viewport bounds) - Skip if forcePosition is true
        if (!currentStep.forcePosition) {
            if (finalPosition === 'bottom' && viewportBottom + popupHeight + padding > vh) finalPosition = 'top';
            else if (finalPosition === 'top' && viewportTop - popupHeight < 10) {
                // Only flip if we are dangerously close to the very top of the window
                if (targetRect.height > 400) {
                    if (viewportRight + popupWidth + padding <= vw) finalPosition = 'right';
                    else if (viewportLeft - popupWidth - padding >= 0) finalPosition = 'left';
                    else finalPosition = 'bottom';
                } else {
                    finalPosition = 'bottom';
                }
            }
            // Flip sides if needed
            else if (finalPosition === 'right' && viewportRight + popupWidth + padding > vw) finalPosition = 'left';
            else if (finalPosition === 'left' && viewportLeft - popupWidth - padding < 0) finalPosition = 'right';
        }

        let txPct = '-50%';
        let tyPct = '0%';

        switch (finalPosition) {
            case 'bottom':
                popupStyle.top = bottom + padding;
                popupStyle.left = left + width / 2;
                arrowStyle = { ...arrowStyle, top: -8, left: '50%', borderLeft: '1px solid rgba(0,0,0,0.1)', borderTop: '1px solid rgba(0,0,0,0.1)', marginLeft: -8 };
                break;
            case 'top':
                // For 'top', we want it above the top edge
                // Ensure we don't go off the document top (0)

                // Sticky Logic: If element top is scrolled off screen (top < minViewY) but element is still visible (bottom > minViewY + 100),
                // stick the popup to the top of the viewport.
                if (top < minViewY && bottom > minViewY + 100) {
                    popupStyle.top = minViewY + 20;
                    tyPct = '0%'; // Render downwards from the sticky top position
                    // Arrow points UP because the content is effectively "below" this sticky header
                    arrowStyle = { ...arrowStyle, top: -8, left: '50%', borderLeft: '1px solid rgba(0,0,0,0.1)', borderTop: '1px solid rgba(0,0,0,0.1)', marginLeft: -8, transform: 'rotate(45deg)' };
                } else {
                    // Safety: Ensure we don't go off the document top (0)
                    // And try to stay within the viewport if possible
                    popupStyle.top = Math.max(padding + popupHeight, top - padding);
                    tyPct = '-100%';
                    // Standard arrow pointing down
                    arrowStyle = { ...arrowStyle, bottom: -8, left: '50%', borderRight: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)', marginLeft: -8 };
                }
                popupStyle.left = left + width / 2;
                break;
            case 'left':
                popupStyle.top = anchorY;
                popupStyle.left = Math.max(padding, left - padding);
                txPct = '-100%';
                tyPct = '-50%';
                arrowStyle = { ...arrowStyle, right: -8, top: '50%', borderRight: '1px solid rgba(0,0,0,0.1)', borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: -8 };
                // Adjust arrow if vertically shifted (clamped)
                if (Math.abs(anchorY - (top + targetRect.height / 2)) > 10) {
                    // If anchored differently than true center, adjust arrow
                    // This is tricky with absolute coords. 
                    // Just keep it centered on the popup for now, or use complex offset.
                    // The anchorY is where we WANT the popup center to be.
                }
                break;
            case 'right':
                popupStyle.top = anchorY;
                popupStyle.left = Math.min(docWidth - padding - popupWidth, right + padding);
                txPct = '0%';
                tyPct = '-50%';
                arrowStyle = { ...arrowStyle, left: -8, top: '50%', borderLeft: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)', marginTop: -8 };
                break;
        }

        // Horizontal pinning (prevent x overflow)
        const anchorX = left + width / 2;
        if (finalPosition === 'top' || finalPosition === 'bottom') {
            // We can't use viewport width (vw) directly for absolute constraint if doc is wider
            // But usually we want to keep it in viewport.
            // We can use transform translateX to shift it? No, left is set.

            // Simplification: Check left edge
            if (popupStyle.left as number - popupWidth / 2 < padding) {
                // Push right
                const shift = padding - (popupStyle.left as number - popupWidth / 2);
                popupStyle.left = (popupStyle.left as number) + shift;
                // Adjust arrow back
                arrowStyle.left = `calc(50% - ${shift}px)`;
                // Actually arrow is absolute child. 
                // To behave correctly we need consistent strategy.
                // Let's stick to simple centering unless extreme edge case.
            }
        }

        return { popupStyle, arrowStyle, txPct, tyPct, offsetX: currentStep.offset?.x || 0, offsetY: currentStep.offset?.y || 0 };
    };

    const { popupStyle, arrowStyle, txPct, tyPct, offsetX, offsetY } = getTourStyles();

    // Portal targets
    if (!mounted || !isVisible || !currentStep) return null;

    return createPortal(
        <div className="absolute top-0 left-0 w-full z-[9999] pointer-events-none" style={{ height: Math.max(document.documentElement.offsetHeight, window.innerHeight) }}>
            <AnimatePresence>
                {/* Backdrop with Highlight (only if not centered) */}
                {currentStep.target !== 'center' && targetRect && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-[2px] pointer-events-auto"
                        style={{
                            clipPath: `polygon(
                                0% 0%, 0% 100%, ${targetRect.left}px 100%, 
                                ${targetRect.left}px ${targetRect.top}px, 
                                ${targetRect.right}px ${targetRect.top}px, 
                                ${targetRect.right}px ${targetRect.bottom}px, 
                                ${targetRect.left}px ${targetRect.bottom}px, 
                                ${targetRect.left}px 100%, 100% 100%, 100% 0%
                            )`
                        }}
                    />
                )}

                {/* Full screen backdrop for centered welcome step */}
                {currentStep.target === 'center' && (
                    <motion.div
                        key="center-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                    />
                )}

                {/* Highlight Pulse */}
                {currentStep.target !== 'center' && targetRect && (
                    <motion.div
                        key="pulse"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.02, 1]
                        }}
                        transition={{
                            // Looping animation for visuals
                            opacity: { duration: 2, repeat: Infinity },
                            scale: { duration: 2, repeat: Infinity },
                            // Layout must be instant
                            layout: { duration: 0 },
                            default: { duration: 0 }
                        }}
                        className="absolute border-2 border-teal-400 rounded-lg pointer-events-none"
                        style={{
                            top: targetRect.top - 4,
                            left: targetRect.left - 4,
                            width: targetRect.width + 8,
                            height: targetRect.height + 8,
                        }}
                    />
                )}


                {/* Popup Card */}
                <motion.div
                    key="popup"
                    initial={{ opacity: 0, scale: 0.9, x: txPct, y: tyPct, marginLeft: offsetX, marginTop: offsetY }}
                    animate={{ opacity: 1, scale: 1, x: txPct, y: tyPct, marginLeft: offsetX, marginTop: offsetY }}
                    exit={{ opacity: 0, scale: 0.9, x: txPct, y: tyPct, marginLeft: offsetX, marginTop: offsetY }}
                    className={`absolute pointer-events-auto filter drop-shadow-xl flex items-end ${currentStep.image?.includes('right') ? 'flex-row-reverse' : ''}`}
                    style={{ ...popupStyle, overflow: 'visible' }}
                    transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 200,
                        layout: { duration: 0 },
                        opacity: { duration: 0.2 },
                        scale: { type: 'spring', damping: 25, stiffness: 200 }
                    }}
                >
                    {/* Mascot Side */}
                    <div className={`shrink-0 z-20 mb-2 relative ${currentStep.image?.includes('right') ? '-ml-6' : '-mr-6'}`}>
                        <motion.img
                            key={currentStep.image || 'default'}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            src={currentStep.image || "/onboarding/down.png"}
                            alt="Buddy"
                            className={`${(currentStep.image?.includes('left') || currentStep.image?.includes('right')) ? 'w-44' :
                                (currentStep.image?.includes('up')) ? 'w-36' : 'w-28'
                                } h-auto object-contain filter drop-shadow-lg transform ${currentStep.image?.includes('right') ? '' : '-scale-x-100'}`}
                        />
                    </div>

                    {/* Speech Cloud/Bubble - Styled like the reference image with centered tail */}
                    <div className={`bg-[#EAECF0] rounded-[1.5rem] p-5 shadow-lg w-full relative z-10 mb-4 text-slate-800 ${currentStep.image?.includes('right') ? 'mr-4' : 'ml-4'}`}>
                        {/* Sharp Tail - Position based on mascot side */}
                        {currentStep.image?.includes('right') ? (
                            <svg className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-6 text-[#EAECF0]" viewBox="0 0 10 20" fill="currentColor">
                                <path d="M0,0 L10,10 L0,20 Z" />
                            </svg>
                        ) : (
                            <svg className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-6 text-[#EAECF0]" viewBox="0 0 10 20" fill="currentColor">
                                <path d="M10,0 L0,10 L10,20 Z" />
                            </svg>
                        )}



                        <div className="mt-1">
                            <h3 className="text-slate-900 font-bold text-lg mb-1 leading-tight pr-6">{currentStep.title}</h3>
                            <p className="text-slate-600 text-[0.95rem] leading-relaxed mb-6 font-medium">
                                <StreamingText text={currentStep.content} />
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBack}
                                    disabled={currentStepIndex <= 0 || !isStepOnCurrentPath(steps[currentStepIndex - 1]?.path)}
                                    className="text-slate-500 disabled:opacity-0 hover:bg-slate-200/50 hover:text-slate-700 font-bold px-2"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Back
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2 font-bold shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    {currentStepIndex < steps.length - 1 && isStepOnCurrentPath(steps[currentStepIndex + 1]?.path) ? (
                                        <>Next <ChevronRight size={16} /></>
                                    ) : (
                                        <>Ok <CheckCircle size={16} /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div >,
        document.body
    );
};

export default OnboardingTour;
