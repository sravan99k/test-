import * as React from 'react';
import { Textarea } from './textarea';
import { useProfanityFilter } from '@/hooks/useProfanityFilter';
import { cn } from '@/lib/utils';

interface ProfanityFilteredTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onProfanityDetected?: (hasProfanity: boolean) => void;
  filterEnabled?: boolean;
}

export const ProfanityFilteredTextarea = React.forwardRef<
  HTMLTextAreaElement, 
  ProfanityFilteredTextareaProps
>(({ className, onChange, onProfanityDetected, filterEnabled = true, ...props }, ref) => {
  const { validateInput, hasProfanity } = useProfanityFilter();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!filterEnabled) {
      onChange?.(e);
      return;
    }

    const textarea = e.target;
    const originalValue = textarea.value;
    
    // Get cursor position before any changes
    const cursorPosition = textarea.selectionStart || 0;
    
    // Validate and filter input
    const filteredValue = validateInput(originalValue);
    
    // Only update if value changed
    if (filteredValue !== originalValue) {
      // Create a new event with the filtered value
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: filteredValue,
        },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      // Call the original onChange with filtered value
      onChange?.(newEvent);
      
      // Notify parent about profanity detection
      if (onProfanityDetected) {
        onProfanityDetected(true);
      }
      
      // Restore cursor position after state update
      setTimeout(() => {
        const newPosition = Math.min(cursorPosition, filteredValue.length);
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // No profanity found, proceed normally
      onChange?.(e);
      if (onProfanityDetected) {
        onProfanityDetected(false);
      }
    }
  };

  return (
    <div className="relative">
      <Textarea
        className={cn(className, {
          'border-red-500 focus-visible:ring-red-500': hasProfanity,
        })}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
      {hasProfanity && (
        <p className="mt-1 text-xs text-red-500">
          Inappropriate language has been filtered out.
        </p>
      )}
    </div>
  );
});

ProfanityFilteredTextarea.displayName = 'ProfanityFilteredTextarea';

export default ProfanityFilteredTextarea;
