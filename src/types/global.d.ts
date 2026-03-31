// Global type declarations

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

// This helps TypeScript understand the @/ path alias
declare module '@/components/ui/button' {
  import { ButtonHTMLAttributes, ReactNode } from 'react';
  
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
    children?: ReactNode;
  }
  
  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
  
  export const buttonVariants: any; // You can define proper types if needed
}
