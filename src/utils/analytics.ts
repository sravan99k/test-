// Extend the Window interface for Clarity
declare global {
  interface Window {
    clarity?: {
      (action: 'identify', userId: string, userProperties?: Record<string, any>): void;
      (action: 'consent'): void;
      (action: 'set', key: string, value: any): void;
      (action: 'trackPageView'): void;
      (action: 'trackEvent', eventName: string, eventProperties?: Record<string, any>): void;
      q?: Array<[string, ...any[]]>;
    };
  }
}

export const initializeClarity = (): void => {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Check if Clarity is already initialized
  if (window.clarity) return;

  // Create a function to handle the Clarity initialization
  (function(c: Window, l: Document, a: 'clarity', r: 'script', i: string, t?: HTMLScriptElement, y?: Element) {
    (c as any)[a] = function() {
      ((c as any)[a].q = (c as any)[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${i}`;
    y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'udiyvc52lb');
};

// Function to track page views
export const trackPageView = (): void => {
  if (window.clarity) {
    window.clarity('trackPageView');
  }
};
